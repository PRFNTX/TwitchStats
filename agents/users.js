const mongoose = require('mongoose')
const moment=require('moment')

const Channel = require('../models/channel')
const Message = require('../models/message')
const Reader = require('../models/reader')
const Session = require('../models/sessio')
const Stream = require('../models/stream')
const Subscribe = require('../models/subscribe')
const Summary = require('../models/summary')

const TwitchUser = require('../models/twitchUser')

const session = process.argv[2]
const subsOnly = process.argv[3]==='subs'
console.log(process.argv)

mongoose.connect('mongodb://localhost:27017/Avarice')

Summary.findOne({_id:session}).then(
    summary=>{
        const resubs = summary.reSubList
        const newSubs = summary.newSubList
        const setReSubs = reSubs.map(sub=>{
            TwitchUser.findOne({username:sub.username}).then(
                user=>{
                    if (user){
                        return Subscribe.find({display_name:sub.username}).then(
                            subscribe=>{
                                user.viewed_sessions.push(summary.sessionId)
                                user.subscribed_to.push({
                                    channel: subscribe.room_id
                                    sub_end:parseInt(moment(subscribe.time).add(1,'M'))
                                })
                                return user.save()
                            }
                        )
                    } else {
                        Subscribe.find({session:summary.sessionId}).then(
                            subEvent=>{
                                TwitchUser.create({
                                    username:sub.username,
                                    subscribed_to:[{
                                        channel:subEvent.room_id,
                                        sub_end:parseInt(moment(subscribe.time).add(1,'M'))
                                    }]
                                    viewed_sessions:[summary.sessionId]
                                })
                            }
                        )
                    }
                }
            )
        })
        const setSubs = newSubs.map(sub=>{
            TwitchUser.findOne({username:sub}).then(
                user=>{
                    if (user){
                        return Subscribe.find({display_name:sub}).then(
                            subscribe=>{
                                user.viewed_sessions.push(summary.sessionId)
                                user.subscribed_to.push({
                                    channel: subscribe.room_id
                                    sub_end:parseInt(moment(subscribe.time).add(1,'M'))
                                })
                                return user.save()
                            }
                        )
                    } else {
                        Subscribe.find({session:summary.sessionId}).then(
                            subEvent=>{
                                TwitchUser.create({
                                    username:sub,
                                    subscribed_to:[{
                                        channel:subEvent.room_id,
                                        sub_end:parseInt(moment(subscribe.time).add(1,'M'))
                                    }]
                                    viewed_sessions:[summary.sessionId]
                                })
                            }
                        )
                    }
                }
            )
        })
    }
)


