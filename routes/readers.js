var express 				= require("express"),
	mongoose 				= require("mongoose"),
	bodyParser 				= require("body-parser"),
	Reader					= require("../models/reader"),
	Session					= require("../models/session"),
	Message					= require("../models/message"),
	Stream					= require("../models/stream"),
	nodeSchedule			= require("node-schedule"),
	jwt						= require('jsonwebtoken'),
	User					= require('../models/user'),
	_ 						= require('lodash'),
	bcrypt					= require('bcrypt'),
	twitch					= require('twitch.tv'),
	env						= require('../env/env');
    Watcher                 = require('../agents/watcher')
    //Summarize               = require('../agents/summarize')

const child_process = require("child_process")

const router=express.Router()
var children={};

/*
router.use(express.static(__dirname +'/build'));
router.use(express.static(__dirname +'/public'));
*/
// on /readers



router.post("/schedule/:id",verifyJWTToken, (req,res)=>{
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

router.get("/active",verifyJWTToken, (req,res)=>{
	try{
		let name=req.query.name;
		let keys=(Object.keys(children))
		if ( keys.indexOf(name>=0) && children[name] ){
			res.status(200).json({message:"reader active",active:true})
		} else {
			res.status(200).json({message:"reader not active",active:false})
		}
	} catch(err){
        console.log(err)
		console.log("catch fail")
		res.status(500).json({message:"failed to get reader status",active:null})
	}
})

router.post("/active", verifyJWTToken, (req,res)=>{
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

let watching = []

router.post('/watch/:name', verifyJWTToken, function(req,res){
    const name = req.params.name
    console.log(name)
    Reader.findOne({name:name}).then(
        found=>{
            console.log(found)
            watching.push({name:name, watcher:Watch(found)})
            res.status(200).json({message:'found and added'})
        }
    ).catch(err=>{
        console.log(err)
        res.status(500).json({message:'something happened'})
    })
})

router.delete('/watch/:name',verifyJWTToken, function(req,res){
    const name = req.params.name
    watching.forEach((obj,i)=>{
        if (obj.name===name){
            clearInterval(watching[i].watcher.interval)
            watching.splice(i,1)
        }
    })
    res.status(200).json({watching:false})
})

router.get('/watch/:name', verifyJWTToken, function(req,res){
    const name = req.params.name
    let found = false
    watching.forEach((obj,i)=>{
        if (obj.name===name){
            found = true
        }
    })
    if (found){
        res.status(200).json({watching:true})
    } else {
        res.status(200).json({watching:false})
    }
})

router.get("/r/:name", verifyJWTToken, (req,res)=>{
	Reader.findOne({username:req.user,name:req.params.name},(err, reader)=>{
		if (err){
			res.status(401).json({message:"could not find reader"})
		}
		res.status(200).json(reader)
	})
})

router.delete("/:id", verifyJWTToken, (req,res)=>{
	Reader.findOne({_id:req.params.id}).remove().then(
		result=>{
			res.status(200).json({message:"item deleted"})
		}
	).catch(err=>{res.status(500).json({message:"item not deleted"})})
})

router.get("/", verifyJWTToken, function(req,res){
	Reader.find(/*{username:req.user}*/{},(err,readers)=>{
		if(err){
			res.status(204).json({message:"error on get"})
		}
		res.status(200).json({readers:readers,user:{username:req.user}})
	})
})

router.post("/", verifyJWTToken, function(req,res){
	let inReader=req.body
	Reader.create(inReader,function(err,reader){
		if(err){
			console.log(err)
			console.log("bad things on create reader");
            res.status(500).json({message:"failed to make reader"})
		} else if (!reader) {
            console.log("null response")
            res.status(500).json({message:'failed to make reader'})
        } else {
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

/*
router.get("*",(req,res)=>{
	res.sendFile(__dirname+"/build/index.html")
})
*/

function Watch(foundReader, summarizeOnEnd=false){
    const watcher = new Watcher('prfnt', foundReader.channel)
    let reader
    let summarizer
    let session
    watcher.on('start',()=>{
        console.log('start')
        startReader(foundReader).then(
            result=>{
                if (result){
                    reader = result
                    reader.on('message',(id)=>{
                        session=id
                    })
                }
            }
        )
    })
    watcher.on('stop',()=>{
        console.log('this')
        console.log('stop')
        if (reader){
            reader.send({message:'close'})
        }
        reader = null
        let summarizer
        if (summarizeOnEnd){
            let args=[session,session,session,session,session,session,session]
            summarizer=child_process.fork("./agents/summarize.js",{execArgv:args,detached:true})
            summarizer.on('err',console.log)
            summarizer.on('done',()=>{
                console.log('done')
            })
        }
    })
    watcher.watch()
    return watcher
}


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
        console.log('reader',reader)
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


module.exports = router
