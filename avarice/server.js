var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("./models/reader"),
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('./models/user'),
	_ 						= require('lodash'),
	bcrypt					= require('bcrypt')
	// passport				= require('passport')
	// passportLocal			= require('passport-local'),
	// passportLocalMongoose	= require('passport-local-mongoose');

const child_process = require("child_process")

var app= express();

var children={};

mongoose.connect("mongodb://localhost/Avarice");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//passport
// app.use(passport.initialize())
// app.use(passport.session())
// passport.use(new passportLocal(User.authenticate()))
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser())
app.use(express.static(__dirname +'/public'));

function register(username, password){
	return new Promise((resolve,reject)=>{
		bcrypt.genSalt(12,(err,salt)=>{
			if (err){
				console.log(err)
				reject(err)
			}
			bcrypt.hash(password,salt,(err,hash)=>{
				if (err){
					console.log(err)
					reject(err)
				}
				
				User.create({
					username:username,
					password:hash,
				}, (err,user)=>{
					if (err){
						console.log(err)
						reject(err)
					}
					resolve(user)					
				})
			})
		})
	})
}

function verify(user,pass){
	return new Promise((resolve,reject)=>{
		User.findOne({'username':user},(err,founduser)=>{
			if (err){
				reject(err)
			}
			bcrypt.compare(founduser.password,pass,(err,res)=>{
				if (err){
					console.log(err)
					reject(err)					
				}
				resolve(user)
			})
		})
	})

}

app.get("/dashboard", verifyJWTToken,(req,res)=>{
	res.json({test:"test",thigner:'thinger'})
})

app.post("/register",(req,res)=>{
	// var newUser= new User({username: req.body.username});
	console.log("hit")
	register(req.body.username,req.body.password).then(
		(user)=>{
			// res.headers.authenticate=
			res.set({
				'authenticate':signJWT({username:req.body.username})
			})
			res.status(200).send("/dashboard")
		},
		(err)=>{
			res.status(403).send("/register")
		}
	)
})

app.post("/login",(req,res)=>{
	console.log("hitter")
	verify(req.body.username,req.body.password).then(
		(result)=>{
			console.log(result)
			res.set({
				'authenticate':signJWT({username:req.body.username})
			})
			res.status(200).send("/dashboard")
		},
		(err)=>{
			res.status(403).send("/login")
		}
	)
})
app.get("/readers/:name", verifyJWTToken, (req,res)=>{
	Readers.findOne({username:req.user,name:req.params.name},(err, reader)=>{
		if (err){
			console.log(err),
			res.status(401).json({message:"could not find reader"})
		}
		res.status(200).json(reader)
	})
})
app.get("/readers", verifyJWTToken, function(req,res){
	Reader.find({username:req.user},(err,readers)=>{
		if(err){
			res.status(204).json([])
		}
		console.log(readers)
		res.status(200).json(readers)
	})
})


app.get("/classes", verifyJWTToken, function(req,res){
	//temp code
	res.status(200).json({
		"username":req.user,
		"classes":[
		{"name":"class1"},
		{"name":"class2"},
		{"name":"class3"},
		{"name":"class4"},
	]})
})

app.post("/readers", verifyJWTToken, function(req,res){
	console.log(req.body)
	let inReader=req.body
	Reader.create(inReader,function(err,reader){
		if(err){
			console.log("bad things on create reader");
		} else {
			console.log(reader)
			if (inReader.immediate){
				var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","starcraft",termVal];
				let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
				toPush.forEach((val)=>{
					args.push(val)
				})
				children[reader.name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
			}
			else if(!reader.periodic){
				var timeValue =(reader.time[1] ? reader.time[1] : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				var termVal =(reader.time[1] ? Number(reader.time[1])+2 : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				schedule = nodeSchedule.scheduleJob(timeValue,function(){
					//create new reader here (fork)
					var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","starcraft",termVal];
					let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
					toPush.forEach((val)=>{
						args.push(val)
					})
					children[reader.name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});

				});
			} else {
				var rule;
				rule = new nodeSchedule.ReccurenceRule();
				rule.dayOfWeek=day;
				rule.hour=time[0];
				rule.minute=time[1];
				schedule = nodeSchedule.scheduleJob(rule,function(){
					//create new reader here (forkvar args=[timeValue];
					var args=["reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","lara6683",timeValue];
					args.push(data);
					children[name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
				});
			}
			res.json(JSON.stringify(reader))
		}
	})
	//name 
	//periodic (bool)
	//period (daily/weekly)
	//immediate (bool)
	//start (weekday)
	//time (hour)
	//class
	//allData (bool) or:
	//data[] [thing,thing,thing,......]
	//res.redirect(redirect to error page)
})
app.get("/readers/new", function(req,res){
	res.render("readers/new");
})

app.listen(3003, function(){
console.log("started on 3003");

})


function verifyJWT(token){
	//copied code
	return new Promise ((resolve,reject)=>{
		jwt.verify(token,'secret', (err,tokenDecoded)=>{
			console.log(tokenDecoded)
			if (err || !tokenDecoded){
				return reject(err);
			}
			resolve(tokenDecoded)
		})
	})
}

function signJWT(obj){
	//copied code
	if (typeof(obj) !== 'object'){
		obj={}
	}
	if (!obj.maxAge || typeof(obj.maxAge)!=="number"){
		obj.maxAge=3600;
	}

	obj= _.reduce(obj||{}, (memo, val ,key)=>{
			if (typeof(val) !== "function" && key !=="password"){
			memo[key]=val;
		}
		return memo;
	},{});

	let token = jwt.sign({
		data:obj
	},'secret', {
		expiresIn:obj.maxAge,
		algorithm:'HS256'
	})
	console.log(typeof token)
	return token
}

function verifyJWTToken(req,res,next){
	let token =(req.headers.authenticate);
	console.log("token:")
	console.log(token)

	verifyJWT(token).then(
		(tokenDecoded)=>{
			console.log("token Decoded")
			console.log(tokenDecoded);
			req.user=tokenDecoded.data.username;
			next()
		}
	).catch(err=>{
		console.log(err)
		res.status(411).json({message:"invalid auth token"})
	})
}