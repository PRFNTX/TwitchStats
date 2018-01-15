var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("./models/reader"),
	Session					= require("./models/session"),
	Message					= require("./models/message"),
	Stream					= require("./models/stream"),
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('./models/user'),
	_ 						= require('lodash'),
	bcrypt					= require('bcrypt'),
	twitch					= require('twitch.tv'),
	env						= require('./env/env'),
    readers                 = require('./routes/readers'),
    sessions                = require('./routes/sessions')

var app= express();

//var children={};

const PORT = process.env.PORT||80

mongoose.connect("mongodb://localhost:27017/Avarice");

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/api/readers', readers)
app.use('/api/sessions', sessions)

app.use((req,res,next)=>{
    console.log(req)
    return next()
})
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
                console.log('res',res)
				if (err){
					console.log('err',err)
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

app.get("/api/dashboard", verifyJWTToken,(req,res)=>{
	res.json({test:"test",thigner:'thinger'})
})

app.post("/api/register",(req,res)=>{
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

app.post("/api/login",(req,res)=>{
    console.log('login')
	verify(req.body.username,req.body.password).then(
		(result)=>{
			res.set({
				'authenticate':signJWT({username:req.body.username})
			})
			res.status(200).send("/dashboard")
		},
		(err)=>{
            console.log('err 1')
			res.status(403).send("/login"+err)
		}
	).catch(err=>{
            console.log('err 2')
        res.status(403).send("catch"+err)
    })
})

//TODO check and remove
app.get("/api/classes", verifyJWTToken, function(req,res){
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


//SENDS data for graphs

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


app.get('/api/view/streams',(req,res)=>{
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

app.get('/api/view/messages',(req,res)=>{
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
		obj.maxAge=1000000;
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


process.on('exit',closeAll)

app.listen(PORT, function(){
    console.log("started on "+PORT);

})

app.get("*",(req,res)=>{
    console.log("fuuuuuu")
	res.status(404).sendFile(__dirname+"/build/index.html")
})


//closes all child processes
function closeAll(){
	children.forEach(val=>{
		val.send({message:'close'})
	})

	process.exit()
}

