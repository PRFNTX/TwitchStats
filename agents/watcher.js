const EventEmitter = require('events')
const TwitchBot = require('./twitch-bot')
const moment = require('moment')
const env = require('../env/env')
const Twitch = require('twitch.tv')

class Watcher extends EventEmitter{
    constructor(username, channel, timeout=10, timein=0){
        super()
        this.channel = channel
        this.username = username
        this.channelId
        this.options = {
            ua:"",
            apiVersion:"5",
            clientID: env.clientID
        }
        console.log('ops', channel)
        Twitch("users?login="+channel,this.options,(err,res)=>{
            if (err){
                console.log(err)
            }
            console.log(res)
            this.channelID=res.users[0]._id
        })
        this.timeout=timeout
        this.timein=timein

        this.active=false
        this.consecutive=timeout
        this.startTime
        this.interval
    }

    watch(){
        console.log('Watching')
        const params={
            username:this.username,
            channels:[this.channel],
            oauth:env.oauth
        }
        const Bot = new TwitchBot(params)
        Bot.on('join',()=>{
            console.log('chat join ')
            this.startTime = moment()
            this.active=false
            this.consecutive = this.timeout

            this.interval = setInterval(()=>{
                    console.log(' interval set ')
                    Twitch("streams/"+this.channelID,this.options, (err,res)=>{
                        try{
                            console.log('res.stream', res.stream)
                            if (err || !res.stream){
                                console.log('no stream')
                                if (this.active && this.consecutive>=this.timeout){
                                    this.consecutive = 0
                                    this.emit('stop')
                                    return this.active=false
                                }
                                else if (!this.active && this.consecutive<this.timeout){
                                    return this.consecutive+=1
                                }
                            } else {
                                console.log('stream up')
                                if (!this.active && this.consecutive >= this.timein){
                                    this.consecutive = 0
                                    this.emit('start')
                                    return this.active = true
                                } else {
                                    return this.consecutive +=1
                                }
                            }
                            
                        } catch(err){
                            console.log(err)
                        }
                    })
                },60000
            )
        })
    }

    stop(){
        this.active=false
        this.consecutive=0
        this.emit('stop')
    }
}

module.exports = Watcher
