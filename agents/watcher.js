const EventEmitter = require('events')
const TwitchBot = require('./twitch-bot')
const moment = require('moment')
const env = require('../env/env')
const Twitch = require('twitch.tv')

const child_process=require('child_process')

class Watcher extends EventEmitter{
    constructor(username, channel, readerName, timeout=1, timein=0){
        super()
        this.readerName=readerName
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

        this.reader
        this.summarizer
        this.currentSession
    }

    watch(){
        console.log('Watching')
        /*
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
            */
            this.interval = setInterval(()=>{
                    console.log(' interval set ')
                    Twitch("streams/"+this.channelID,this.options, (err,res)=>{
                        try{
                            console.log('res.stream', res.stream)
                            if (err || !res.stream){
                                console.log('no stream')
                                if (this.active && this.consecutive>=this.timeout){
                                    this.emit('stop')
                                    this.stop()
                                }
                                else if (!this.active && this.consecutive<this.timeout){
                                    return this.consecutive+=1
                                }
                            } else {
                                console.log('stream up')
                                if (!this.active && this.consecutive >= this.timein){
                                    this.emit('start')
                                    this.start()
                                } else {
                                    return this.consecutive +=1
                                }
                            }
                            
                        } catch(err){
                            console.log(err)
                        }
                    })
                },10000
            )
    }

    stop(){
        this.active=false
        this.consecutive=0
        this.emit('stop')
        this.reader.send({message:'close'})
        this.summarizer = child_process.fork("./agents/summarize.js",{execArgv:["./agents/summarize.js",this.currentSession],detached:true})
        this.summarizer.on('done',(id)=>{
            console.log('done', id)
        })
    }

    start(){
        this.active=true
        this.consecutive=0
        this.emit('start')
        this.reader=child_process.fork('./agents/reader.js',{execArgv:['./agents/reader.js',this.readerName,'','prfnt',env.oauth,this.channel,null,this.readerName,this.channel],detached:true})
        this.reader.on('message',(id)=>{
            this.currentSession=id
        })
    }
}

module.exports = Watcher
