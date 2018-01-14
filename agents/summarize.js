const Message = require("../models/message")
const Reader = require("../models/reader")
const Session = require("../models/session")
const Stream = require("../models/stream")
const Summary = require('../models/summary')

const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/Avarice")

console.log(process.argv)
const sessionId = process.argv[4]

Session.find({_id:sessionId}).then(
    session=>{

        let promMsg = Message.find({session:session._id}).then(
            found =>{
                return found
            }
        )

        let promStream = Stream.find({session:session._id}).then(
            found=>{
                return found
            }
        )

        Promise.all([promMsg,promStream]).then(
            allFound=>{
                const sessionMessages = allFound[0]
                const sessionStreams = allFound[1]

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
                    let it=1
                    if ((pos!==0)&&(pos!==len-1)){
                        let end = endBinSearch(name,array[pos-1],array[pos],array[pos+1])
                        while (!end.done){
                            if (name>array[len]){
                                pos = pos - Math.ceil(pos/pow(2,it))
                            } else {
                                pos = pos + Math.ceil(pos/pow(2,it))
                            }

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

                async function uniqueViewers(){
                    let list = sessionStreams[0].viewerList

                    sessionStreams.forEach((val,i)=>{
                        let newViewers = [] 
                        if (i>0){
                            newViewers = val.viewerList.filter(name=>!findUser(name, list))
                            list = list.concat(newViewers)
                        }
                    })

                    return list.length
                }

                async function viewerRetentionFull(){
                    let set=0
                    let progress=[]
                    let data=[]
                    while (set<sessionStreams.length){
                        let currList = sessionStreams[set].viewerList

                        progress.forEach((user,i)=>{
                            if (!findUser(user.name, currList)){
                                user.end=set
                                data.push(user)
                                progress.splice(i,1)
                            }
                        })

                        let filterList = currList.filter(user=>{!findUser(user, progress.map(data=>data.name))})

                        filterList.forEach(name=>{
                            progress.push({
                                name:name,
                                start:set
                            })
                        })
                    }

                    // average watch time
                    let result = data.reduce((a,b)=>{
                        return a+b.end-b.start
                    })
                    result = result/data.length
                    return data
                }

                async function viewerRetentionRandom(){
                    let n = sessionStreams[0].viewerList.length
                    let set=0
                    let progress=[]
                    let data=[]
                    while (set<sessionStreams.length){
                        let currList = sessionStreams[set].viewerList

                        progress.forEach((user,i)=>{
                            if (!findUser(user.name, currList)){
                                user.end=set
                                data.push(user)
                                user.splice(i,1)
                            }
                        })
                        while (n<Math.ceil(Math.sqrt(currList.length))){
                            let newPoint = currList[Math.Floor(currList.length*Math.random())]
                            let tries = 0
                            while ((tries<5) && (findUser(newPoint, Object.keys(progress)))){
                                newPoint = currList[Math.Floor(currList.length*Math.random())]
                                tries++
                            }

                            progress.push({
                                name:newPoint,
                                start:set
                            })
                            
                        }
                    }
                    // average watch time
                    let result = data.reduce((a,b)=>{
                        return a+b.end-b.start
                    })
                    result = result/data.length
                    return result
                }

                Promise.all([
                    uniqueViewers(),
                    viewerRetentionFull()
                ]).then(
                    result=>{
                        Summary.create({
                            sessionId:session._id,
                            uniqueViews: result[0],
                            viewerRetention: result[1]
                        }).then(
                            result=>{
                                process.send('done')
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
