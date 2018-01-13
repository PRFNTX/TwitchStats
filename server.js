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
	env						= require('./env/env')
	// passport				= require('passport')
	// passportLocal			= require('passport-local'),
	// passportLocalMongoose	= require('passport-local-mongoose');

/*
console.log=function(val,aval){
	return
}
*/
const child_process = require("child_process")

var app= express();

var children={};

const PORT = process.env.PORT||3003

mongoose.connect("mongodb://localhost/Avarice");

app.use(express.urlencoded({extended:true}));
app.use(express.json());

//passport
// app.use(passport.initialize())
// app.use(passport.session())
// passport.use(new passportLocal(User.authenticate()))
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser())
app.use(express.static(__dirname +'/build'));
app.use(express.static(__dirname +'/public'));

//TODO Separate to new file
function register(username, password){
	return new Promise((resolve,reject)=>{
		bcrypt.genSalt(12,(err,salt)=>{
			if (err){
			    return reject(err)
			}
			bcrypt.hash(password,salt,(err,hash)=>{
				if (err){
				    return reject(err)
				}
                console.log(hash)
				
				User.create({
					username:username,
					password:hash,
				}, (err,user)=>{
					if (err){
                        console.log('hash err')
					    return reject(err)
					}
                    if (!user){
                        console.log("null user")
                        return reject("failed to make user")
                    }
				    return resolve(user)
				})
			})
		})
	})
}


function verify(user,pass){
	return new Promise((resolve,reject)=>{
		User.findOne({'username':user},(err,founduser)=>{
			if (err){
			    return reject(err)
			}
            if (!founduser){
                return reject("user not found")
            }
			bcrypt.compare(pass,founduser.password,(err,res)=>{
                console.log(res)
				if (err){
					console.log(err)
				    return reject(err)
                }
				if (res){
				    return resolve(user)
				} else {
				    return reject("password mismatch")
				}
				
			})
		})
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
			res.set({
				'authenticate':signJWT({username:req.body.username})
			})
			res.status(200).send("/dashboard")
		},
		(err)=>{
			res.status(403).send("/login"+err)
		}
	).catch(err=>{
        res.status(403).send("catch"+err)
    })
})

//TODO break separate to readers file

//TODO implement schedules start/stop
app.post("/readers/schedule/:id",verifyJWTToken, (req,res)=>{
	let time=req.body.sTime.split(":")
	let day=req.body.sDay
	var startValue =(time[1] ?time[1] : "*") +" "+(time[0] ?time[0] : "*")+" * * "+day 

	let eTime=req.body.eTime.split(":")
	let eDay=req.body.eDay
	var endValue =(time[1] ?time[1] : "*") +" "+(time[0] ?time[0] : "*")+" * * "+day 
	//var termVal =(time[1] ? Number(time[1])+2 : "*") +" "+(time[0] ?time[0] : "*")+" * * "+day 
	scheduleReader(startValue,endValue,req.params.id)
	res.sendStatus(200)
})

app.get("/readers/active",verifyJWTToken, (req,res)=>{
	try{
		let name=req.query.name;
		let keys=(Object.keys(children))
		if ( keys.indexOf(name>=0) && children[name] ){
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
			if (children[reader]){
				children[reader].send({message:'close'})
			}
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
			res.status(401).json({message:"could not find reader"})
		}
		res.status(200).json(reader)
	})
})

app.delete("/readers/:id", verifyJWTToken, (req,res)=>{
	Reader.find({_id:req.params.id}).remove().then(
		result=>{
			res.status(200).json({message:"item deleted"})
		}
	).catch(err=>{res.status(500).json({message:"item not deleted"})})
})

app.get("/readers", verifyJWTToken, function(req,res){
	Reader.find(/*{username:req.user}*/{},(err,readers)=>{
		if(err){
			res.status(204).json({message:"error on get"})
		}
		res.status(200).json({readers:readers,user:{username:req.user}})
	})
})

//TODO check and remove
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
	let inReader=req.body
	Reader.create(inReader,function(err,reader){
		if(err){
			console.log(err)
			console.log("bad things on create reader");
		} else {
			if (inReader.immediate){
				let readerReturn=startReader(inReader)
				if (readerReturn){
					children[reader.name =readerReturn]
				}
			}	
			else if(!reader.periodic){
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


//TODO move to analysis file
//used to graph data
async function viewersTime(query){
	return Stream.find(query).then(
		results=>{
			let views=results.map(val=>val.viewers)
			let time=results.map(val=>val._id.getTimestamp())
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


//SENDS data for graphs
app.get('/sessions/:id',verifyJWTToken,(req,res)=>{
	let query={session:req.params.id}
	let type=req.headers.type
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

//summarizes the session data by number of messages and number of api calls
async function sessionMeta(sessions){
	let ret={}
	let msgLen
	let streamLen
	let msgs = sessions.map(val=>Message.count({session:val._id}))
	let streams = sessions.map(val=>Stream.count({session:val._id}))
	let pmsg=Promise.all(msgs).then(
		result=>{
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
			return {msgs:results[0],streams:results[1]}
		}
	).catch(err=>{console.log(err)})
}


app.get('/view/streams',(req,res)=>{
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

app.get('/view/messages',(req,res)=>{
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

app.listen(PORT, function(){
console.log("started on "+PORT);

})


//TODO move to separate file
//token verification utility

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

//token signing utility

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

//token verification middlewhere

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


//TODO allow stream scheduling

function scheduleReader(startTime,endtime,readerId){
	Reader.find({_id:readerId}).then(
		reader=>{
			schedule = nodeSchedule.scheduleJob(startTime,function(){
				startReader(reader).then(
					result =>{
						children[reader.name]=result
					}
				).catch(err=>{console.log(err)})
			})
		}
		//create new reader here (fork)
	).catch(err=>{console.log(err)})
}


//starts the reader using either the name of the reader or the reader object

//function inspect(val){
	//console.log("inspect",val)
	//return val
//}
async function startReader(reader){
	let ret=false
	if (typeof(reader)==="string"){
		await Reader.findOne({name:reader}).then(
			result=>{
				var args=["agents/reader.js",result.name,"process.end.GM_CLIENT_ID", "prfnt",env.oauth,result.channel||"lara6683"];
				let toPush=[null,reader,result.channel || ""]//( !result.allData ? result.data : [null,"data3","dataexplicit"])
				toPush.forEach((val)=>{
					args.push(val)
				})
				try{
					ret= child_process.fork("./agents/reader.js",{execArgv:args,detached:true})
				}catch(err){
					ret= false
				}
			}
		).catch(err=> {
			ret= false
			console.log("catch")
		})
	} else {
		let ret
		var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt",env.oauth,reader.channel||""];
		let toPush=['null',reader.name,reader.channel || ""]// !reader.allData ? reader.data : ['null',"data3","dataexplicit"])
		toPush.forEach((val)=>{
			args.push(val)
		})
		try {
			ret= child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
		} catch(err){
			console.log("start, else catch error")
			console.log(err)
			ret= false
		}	
	}
	return ret
}

process.on('exit',closeAll)

app.get("*",(req,res)=>{
	res.sendFile(__dirname+"/build/index.html")
})


//closes all child processes
function closeAll(){
	children.forEach(val=>{
		val.send({message:'close'})
	})

	process.exit()
}
