var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("./models/reader"),
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('./models/user'),
	_ 						= require('lodash'),
	// passport				= require('passport'),
	// passportLocal			= require('passport-local'),
	// passportLocalMongoose	= require('passport-local-mongoose');

const child_process = require("child_process")

var app= express();

var children={};

mongoose.connect("mongodb://localhost/Avarice");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//passport
app.use(passport.initialize())
// app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
app.use(express.static(__dirname +'/public'));

  
app.post("register",(req,res)=>{
	var newUser= new User({username: req.body.username});
    User.register(newUser,req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.json({})
        }
        passport.authenticate("local")(req,res,function(){
			res.headers.authenticate=signJWT({username:req.body.username})
			res.status(200).send("/dashboard")
		});
		
    });

})

app.post("/login", passport.authenticate("local"),(req,res)=>{
	res.headers.authenticate=signJWT({username:req.body.username})
	res.status(200).send("/dashboard")
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

	obj.sessionData = _.reduce(obj.sessionData||{}, (memo, val ,key)=>{
		if (typeof(val) !== "function" && key !=="password"){
		memo[key]=val;
		}
		return memo;
	},{});

	let token = jwt.sign({
		data:obj.sessionData
	},'secret', {
		expiresIn:obj.maxAge,
		algorith:'HS256'
	})
	return token
}

function verifyJWTToken(req,res,next){
	let token = req.headers.authenticate;

	verifyJWT(token).then(
		(tokenDecoded)=>{
			req.user=tokenDecoded.data;
			next()
		}
	).catch(err=>{
		res.status(400).json({message:"invalid auth token"})
	})
}