var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("./models/reader"),
	Session					= require("./models/session")
	Message					= require("./models/message")
	Stream					= require("./models/stream")
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('./models/user'),
	_ 						= require('lodash'),
	bcrypt					= require('bcrypt'),
	twitch					= require('twitch.tv')
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
				reject(err)
			}
			bcrypt.hash(password,salt,(err,hash)=>{
				if (err){
					reject(err)
				}
				
				User.create({
					username:username,
					password:hash,
				}, (err,user)=>{
					if (err){
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
				if (res){
					resolve(user)
				} else {
					reject("password mismatch")
				}
				
			})
		})
	}).catch(err=>{
		console.log(err);
	})

}

app.get("/dashboard", verifyJWTToken,(req,res)=>{
	res.json({test:"test",thigner:'thinger'})
})

app.post("/register",(req,res)=>{
	// var newUser= new User({username: req.body.username});
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
	).catch(err=>console.log(err))
})



app.get("/readers/active",verifyJWTToken, (req,res)=>{
	console.log("WE DID GET HERE")
	try{
		let name=req.query.name;
		console.log("KEYS")
		console.log(Object.keys(children))
		if (children[name]){
			res.status(200).json({message:"reader active",active:true})
		} else {
			res.status(200).json({message:"reader not active",active:false})
		}
	} catch(err){
		console.log("catch fail")
		res.status(500).json({message:"failed to get reader status",active:null})
	}
})

app.post("/readers/active", verifyJWTToken, (req,res)=>{
	let reader=req.body.name
	let state=req.body.active
	if (state){
		console.log("started")
		startReader(reader).then(
			result=>{
				if (result){
					children[reader] =result
					res.status(200).json({message:"reader started",active:true})
				} else {
					res.status(401).json({message:'process failed to start',active:false})
				}
			}
		).catch(err=>{
			console.log("catch 01")
			console.log(err)
			res.status(500).json({message:"did not start",active:null})
		})

	} else {
		try{
			console.log(reader)
			console.log(children[reader])
			children[reader].send({message:'close'})
			children[reader]=false
			res.status(200).json({message:'process closed',active:false})
		}catch(err){
			console.log("catch 02")
			console.log(err)
			res.status(500).json({message:'thats not supposed to happen',active:null})
		}
	}
})

app.get("/readers/:name", verifyJWTToken, (req,res)=>{
	Reader.findOne({username:req.user,name:req.params.name},(err, reader)=>{
		if (err){
			console.log(err),
			res.status(401).json({message:"could not find reader"})
		}
		res.status(200).json(reader)
	})
})

app.get("/readers", verifyJWTToken, function(req,res){
	Reader.find(/*{username:req.user}*/{},(err,readers)=>{
		if(err){
			res.status(204).json({message:"error on get"})
		}
		console.log(readers[0])
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
			console.log(err)
			console.log("bad things on create reader");
		} else {
			console.log(reader)
			if (inReader.immediate){
				let readerReturn=startReader(inReader)
				if (readerReturn){
					children[reader.name =readerReturn]
				}
			}	
			else if(!reader.periodic){
				var timeValue =(reader.time[1] ? reader.time[1] : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				var termVal =(reader.time[1] ? Number(reader.time[1])+2 : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				schedule = nodeSchedule.scheduleJob(timeValue,function(){
					//create new reader here (fork)
					let readerReturn=startReader(reader)
					if (readerReturn){
						children[reader.name =readerReturn]
					}
				});
			} else {
				var rule;
				rule = new nodeSchedule.ReccurenceRule();
				rule.dayOfWeek=day;
				rule.hour=time[0];
				rule.minute=time[1];
				schedule = nodeSchedule.scheduleJob(rule,function(){
					//create new reader here (forkvar args=[timeValue];
					let readerReturn=startReader(reader)
					if (readerReturn){
						children[reader.name =readerReturn]
					}
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

app.delete("/sessions/:id", verifyJWTToken,(req,res)=>{
	let m=Message.find({session:req.params.id}).remove()
	let s=Stream.find({session:req.params.id}).remove()
	Promise.all([m,s]).then(
		dones=>{
			return Session.find({_id:req.params.id}).remove()
		}
	).then(
		result=>{
			res.status(200).json({message:"session "+req.params.id+" deleted"})
		}
	).catch(
		err=>{
			res.status(500).json({message:"something went wrong"})
		}
	)
})


async function viewersTime(query){
	return Stream.find(query).then(
		results=>{
			let views=results.map(val=>val.viewers)
			let time=results.map(val=>val._id.getTimestamp())
			console.log("XY", [time,views])
			return {x:time,y:views}
		}
	)
}

async function messagesTime(query,interval){
	
	return Message.find(query).then(
		results=>{
			let buckets = results.reduce((a,b)=>{
				if (!a){
					return {bin:Number(results[0]._id.getTimestamp()),bins:[0],interval:interval,t0:results[0]._id.getTimestamp()}
				} else if (Number(b._id.getTimestamp())<(a.bin+interval)){
					console.log("BINS",a.bins)
					let newA = a
					newA.bins[newA.bins.length-1]+=1
					return newA
				} else {
					let newA = a
					newA.bin +=interval;
					newA.bins.push(1)
					return newA
				}
			},null)
			console.log("BUCKETS", buckets)
			return buckets
		}
	)
}

async function messagesUsers(query){
	return Message.find(query).then(
		results=>{
			let counts = results.reduce((a,b)=>{
				if (!a){
					return {users:[],messages:[]}
				} else {
					let index =a.users.indexOf(b.username)
					if (index>=0){
						let newA=a
						newA.messages[index]+=1;
						return newA
					}
					else {
						let newA=a
						newA.users.push(b.username);
						newA.messages.push(1)
						return newA
					}
				}
			},null)
			console.log("COUNT", counts)
			return counts
		}
	)
}

app.get('/sessions/:id/messages',verifyJWTToken,(req,res)=>{
	Message.find({session:req.params.id}).then(
		results =>{
			res.status(200).json(results)
		}
	).catch(err=>{console.log(err)})
})

app.get('/sessions/:id/streams',verifyJWTToken,(req,res)=>{
	Stream.find({session:req.params.id}).then(
		results =>{
			res.status(200).json(results)
		}
	).catch(err=>{console.log(err)})
})

app.get('/sessions/:id',verifyJWTToken,(req,res)=>{
	console.log(req.headers)
	let query={session:req.params.id}
	let type=req.headers.type
	console.log(type)
	let prom
	switch (type){
		case "viewers-time":
			prom =viewersTime(query);
			break;
		case "messages-time":
			prom=messagesTime(query,60000);
			break;
		case "messages-user":
			prom=messagesUsers(query);
			break;
	}
	prom.then(
		results=>{
			res.status(200).json(results)
		}
	).catch(
		err=>{
			console.log(err)
			res.status(500).json({message:"failed to get data"})
		}
	)
})

app.get('/sessions',verifyJWTToken, (req,res)=>{
	Session.find().then(
		result=>{
			sessionMeta(result).then(
				lens =>{
					console.log(lens)
					res.status(200).json({sessions:result,msgs:lens.msgs,streams:lens.streams})
				}
			).catch(err=>{
				console.log(err)
				res.sendStatus(500)
			})
		}
	).catch(
		err=>{
			
			console.log(err)
			console.log("session get error")
			res.status(500).json({message:"failed to get sessions"})
		}
	)
})

async function sessionMeta(sessions){
	let ret={}
	let msgLen
	let streamLen
	let msgs = sessions.map(val=>Message.count({session:val._id}))
	let streams = sessions.map(val=>Stream.count({session:val._id}))
	let pmsg=Promise.all(msgs).then(
		result=>{
			console.log(result)
			return result.map((val,i)=>{return {'session':sessions[i]._id,len:val}})	
		}
	).catch(err=>console.log(err))
	let pstrm =Promise.all(streams).then(
		result=>{
			return result.map((val,i)=>{return {'session':sessions[i]._id,len:val}})	
		}
	).catch(err=>console.log(err))
	
	return Promise.all([pmsg,pstrm]).then(
		results =>{
			console.log(results)
			return {msgs:results[0],streams:results[1]}
		}
	).catch(err=>{console.log(err)})
}

app.get('view/streams',(req,res)=>{
	let q=req.params.query
	let rets
	if (q.all){
		let date=moment()
		for (let i=0;i<7;i++){
			rets.push(Reader.findOne({}))
		}
	}
	Stream.find({reader:'test'}).then(
		result=>{
			res.status(200).json(result)
		}
	).catch(err=>{
		console.log(err);
		res.status(400).json({message:"error getting messages"})
	})
})

app.get('view/messages',(req,res)=>{
	let q=req.params.query
	Message.find({reader:'test'}).then(
		result=>{
			res.status(200).json(result)
		}
	).catch(err=>{
		console.log(err);
		res.status(400).json({message:"error getting messages"})
	})
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

	obj= _.reduce(obj||{}, (memo, val ,key)=>{
			if (typeof(val) !== "function" && key !=="password"){
			memo[key]=val;
		}
		return memo;
	},{});

	let token = jwt.sign(
			{data:obj},
			'secret',
			 {expiresIn:obj.maxAge,algorithm:'HS256'}
		)
	return token
}

function verifyJWTToken(req,res,next){
	let token =(req.headers.authenticate);

	verifyJWT(token).then(
		(tokenDecoded)=>{
			req.user=tokenDecoded.data.username;
			next()
		}
	).catch(err=>{
		console.log(err)
		res.status(411).json({message:"invalid auth token"})
	})
}

async function startReader(reader){
	let ret=false
	if (typeof(reader)==="string"){
		await Reader.find({name:reader}).then(
			result=>{
				var args=["agents/reader.js",result.name,"process.end.GM_CLIENT_ID", "prfnt",,"lara6683"];
				let toPush=[null,reader,"dataexplicit"]//( !result.allData ? result.data : [null,"data3","dataexplicit"])
				toPush.forEach((val)=>{
					args.push(val)
				})
				try{
					ret= child_process.fork("./agents/reader.js",{execArgv:args,detached:true})
					console.log("setting ret")
				}catch(err){
					console.log("this false was necessary")
					ret= false
				}
			}
		).catch(err=> {
			ret= false
			console.log("catch")
		})
	} else {
		let ret
		var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","lara6683"];
		let toPush=['null',reader.name,"dataexplicit"]// !reader.allData ? reader.data : ['null',"data3","dataexplicit"])
		toPush.forEach((val)=>{
			args.push(val)
		})
		try {
			ret= child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
			console.log("setting ret")
		} catch(err){
			console.log("start, else catch error")
			console.log(err)
			ret= false
		}	
	}
	return ret
}

process.on('exit',closeAll)

function closeAll(){
	children.forEach(val=>{
		val.send({message:'close'})
	})

	process.exit()
}
