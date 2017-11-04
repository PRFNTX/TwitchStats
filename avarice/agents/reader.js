var TwitchBot= require('twitch-bot'),
    Schedule=require("node-schedule")
var username=process.argv[4];
var oauth=process.argv[5];
var channel = process.argv[6];
var terminate = process.argv[7];
var data=[];
for (var i=8;i<process.argv.length;i++){
    data.push(process.argv[i]);
    console.log(process.argv[i])
}

//https://github.com/kritzware/twitch-bot
//events: (Bot.on(''))
//join
//message
//timeout
//ban
//error
//close

//methods: Bot.''
//say()
//timeout()
//ban()
//close
const Bot = new TwitchBot({
    username : (username ? username : "prfnt"),
    oauth:oauth,
    channel: (channel ? channel : "prfnt"),
})
console.log(Bot)
Bot.on("message", (chatter)=>{
    console.log(chatter)
})
Bot.on('join',(thing)=>{
    console.log(thing)
})

Bot.on("error", (err)=>{
    console.log("ooo fuckin... error")
})



function terminate(){
    console.log("terminating")
    process.exit();
}