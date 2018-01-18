const Message = require("../models/message")
const Reader = require("../models/reader")
const Session = require("../models/session")
const Stream = require("../models/stream")
const Summary = require('../models/summary')
const Subscribe = require('../models/subscribe')

const mongoose = require("mongoose")
const child_process=require('child_process')

mongoose.connect("mongodb://localhost/Avarice")

const sessionId = process.argv[2]

Session.find({_id:sessionId}).then(
    session=>{
        console.log(session._id)
        let promMsg = Message.find({session:sessionId}).then(
            found =>{
                console.log('messages found')
                return found
            }
        )

        let promStream = Stream.find({'session':sessionId}).then(
            found=>{
                console.log('streams found')
                return found
            }
        )

        let promSubs = Subscribe.find({'session':sessionId}).then(
            found=>{
                console.log('subs found')
                return found
            }
        )

        Promise.all([promMsg,promStream,promSubs]).then(
            allFound=>{
                console.log('all found')
                const sessionMessages = allFound[0]
                const sessionStreams = allFound[1]
                const sessionSubs = allFound[2]

                function endBinSearch(find,m1,e,p1){
                    if (e===find){
                        return {done:true,found:true}
                    }
                    if ((e>find)&&(m1>find)){
                        return {done:true,found:false}
                    }
                    if ((e<find)&&(p1>find)){
                        return {done:true,found:false}
                    }
                    return {done:false,found:false}
                }

                function findUser(name,array){
                    const len = array.length
                    let pos = Math.floor(len/2)
                    let it=2
                    if ((pos!==0)&&(pos!==len-1)){
                        let end = endBinSearch(name,array[pos-1],array[pos],array[pos+1])
                        while (!end.done){
                            if (name>array[len]){
                                pos = len - Math.ceil(pos/Math.pow(2,it))
                            } else {
                                pos = len + Math.ceil(pos/Math.pow(2,it))
                            }

                            console.log(it)
                            it++

                            end=endBinSearch(name,array[pos-1],array[pos],array[pos+1])
                            if ((pos===0)||(pos===len)){
                                end.done=true
                            }
                        }

                        if (array[pos]===name){
                            return pos
                        } else {
                            return -1
                        }
                    }
                }
                
                function slowFind(thing, array){
                    return array.indexOf(thing)
                }

                async function uniqueViewers(){
                    let list = sessionStreams[0].viewerList

                    sessionStreams.forEach((val,i)=>{
                        let newViewers = [] 
                        if (i>0){
                            newViewers = val.viewerList.filter(name=>!list.includes(name))
                            list = list.concat(newViewers)
                        }
                    })

                    return list.length
                }

                async function viewerRetentionFull(){
                    let progress=[]
                    let data=[]
                    for (let set=0;set<sessionStreams.length;set++){
                        let currList = sessionStreams[set].viewerList
                        let clear=[]
                        progress.filter(val=>{return !(currList.includes(val.name))}).forEach((left)=>{
                            left.end=set
                            data.push({...left})
                            clear.push(left.name)
                        })
                        progress = progress.filter(item=>!(clear.includes(item.name)))
                        
                        let filterList = currList.filter(val=>!progress.map(name=>name.name).includes(val))
                        filterList.forEach(name=>{
                            let thing = {
                                name:name,
                                start:set
                            }
                            progress.push({...thing})
                        })
                    }

                    progress.forEach((user,i)=>{
                        user.end=sessionStreams.length
                        data.push(user)
                    })
                    // average watch time
                    let result = data.length ? data.map(item=>{
                        return (item.end-item.start)
                    }) : []

                    return result
                }

                async function averageViewTime(){
                    return sessionStreams.reduce((a,val)=>{
                        if (!a){
                             a=0
                        }
                        return a +val.viewerList.length
                    },0)
                }

                async function viewerRetentionRandom(){
                    let n = sessionStreams[0].viewerList.length
                    let set=0
                    let progress=[]
                    let data=[]
                    while (set<sessionStreams.length){
                        let currList = sessionStreams[set].viewerList

                        progress.forEach((user,i)=>{
                            if (!(slowFind(user.name, currList)>=0)){
                                user.end=set
                                data.push(user)
                                user.splice(i,1)
                            }
                        })
                        while (n<Math.ceil(Math.sqrt(currList.length))){
                            let newPoint = currList[Math.Floor(currList.length*Math.random())]
                            let tries = 0
                            while ((tries<5) && (!(slowFind(newPoint, Object.keys(progress))>=0))){
                                newPoint = currList[Math.Floor(currList.length*Math.random())]
                                tries++
                            }

                            progress.push({
                                name:newPoint,
                                start:set
                            })
                        }
                        set++
                    }
                    // average watch time
                    let result = data.reduce((a,b)=>{
                        return a+b.end-b.start
                    },0)
                    result = result/(data.length || 1)
                    return result
                }

                async function newSubs(){
                    let ret = sessionSubs.filter(val=>{
                        return msg_id==='sub'
                    }).map(sub=>sub.display_name)
                    return ret
                }

                async function reSubs(){
                    let ret = sessionSubs.filter(val=>{
                        return msg_id==='resub'
                    }).map(sub=>{
                            return {
                                username: sub.display_name,
                                months: sub.msg_param_months
                            }
                        }
                    )
                    return ret
                }

                Promise.all([
                    uniqueViewers(),
                    viewerRetentionFull(),
                    averageViewTime(),
                    newSubs(),
                    reSubs()
                ]).then(
                    make=>{
                        console.log(make)
                        Summary.create({
                            sessionId:sessionId,
                            uniqueViews: make[0],
                            viewerRetention: make[2],
                            viewSessoins: make[1],
                            newSubList: make[3],
                            reSubList: make[4]
                        }).then(
                            result=>{
                                console.log('done')
                                process.send('done', result._id)
                                process.exit()
                            }
                        )
                    }
                ).catch(err=>{
                    console.log(err)
                    process.send('err',err)
                    process.exit()
                })












            }
        )
        
    }
).catch(err=>console.log(err))
