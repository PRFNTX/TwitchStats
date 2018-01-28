var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("../models/reader"),
	Session					= require("../models/session"),
	Message					= require("../models/message"),
	Stream					= require("../models/stream"),
    Summary                 = require("../models/summary")
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('../models/user'),
	_ 						= require('lodash'),
	bcrypt					= require('bcrypt'),
	twitch					= require('twitch.tv'),
	env						= require('../env/env');

const child_process = require("child_process")

const router = express.Router()

/*
router.use(express.static(__dirname +'/build'));
router.use(express.static(__dirname +'/public'));
*/

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

let summarizers = []

router.delete('/summary/:id',verifyJWTToken, (req,res)=>{
    Summary.findOne({sessionId:req.params.id}).remove().then(
        result=>{
            res.status(200).json({message:'deleted if it existed'})
        }
    ).catch(err=>{
        console.log(err)
        res.status(500).json({message:"delete failed"})
    })
})

router.get('/summary/:id', verifyJWTToken, (req,res)=>{
    Summary.findOne({sessionId:req.params.id}).then(
        summary=>{
            res.status(200).json({summary})
        }
    ).catch(err=>{
        res.status(500).json("failed while finding summary")
    })
})

router.get('/summary',verifyJWTToken, (req,res)=>{
    Summary.find({}).then(
        found=>{
            let ids=found.map(summary=>summary.sessionId)
            res.status(200).json({summaries:ids})
        }
    )
})

router.get('/summarize/:id',verifyJWTToken, (req,res)=>{
    Summary.find({_id:req.params.id}).then(
        found=>{
            if (found.length){
                res.status(200).json({summary:"complete"})
            }
            else {
                return
            }
        }
    ).then(
        to=>{
            let active = false
            summarizers.forEach(item=>{
                if (item.id===req.params.id){
                    active=true
                }
            })
            if (active){
                res.status(200).json({summary:"active"})
            } else {
                res.status(200).json({summary:"none"})
            }
        }
        )
})

router.post('/summarize/:id',verifyJWTToken, (req,res)=>{
    Session.findOne({_id:req.params.id}).then(
        found=>{
            let args=['agents/summarize.js',req.params.id]
            summarizer=child_process.fork("./agents/summarize.js",{execArgv:args,detached:true})
            summarizers.push({
                id:req.params.id,
                summarizer:summarizer
            })
        }
    ).then(
        data=>{
            let active = false
            summarizers.forEach(item=>{
                if (item.id===req.params.id){
                    active=true
                }
            })
            if (active){
                res.status(200).json({summary:'active'})
            } else {
                res.status(200).json({summary:''})
            }
        }
    ).catch(err=>{
        console.log('summary start err')
        console.log(err)
        res.status(500).send(err)
    })
})

router.get('/summarize', verifyJWTToken, (req,res)=>{
    let summaries = summarizers.map(val=>val.id)
    res.status(200).json({summaries})
})

router.delete("/:id", verifyJWTToken,(req,res)=>{
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

router.get('/:id/messages',verifyJWTToken,(req,res)=>{
	Message.find({session:req.params.id}).then(
		results =>{
			res.status(200).json(results)
		}
	).catch(err=>{console.log(err)})
})

router.get('/:id/streams',verifyJWTToken,(req,res)=>{
	Stream.find({session:req.params.id}).then(
		results =>{
			res.status(200).json(results)
		}
	).catch(err=>{console.log(err)})
})

router.get('/:id',verifyJWTToken,(req,res)=>{
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

router.get('/',verifyJWTToken, (req,res)=>{
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
/*
router.get("*",(req,res)=>{
	res.sendFile(__dirname+"/build/index.html")
})
*/



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

module.exports = router
