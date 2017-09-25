var TwitchBot= require('node-twitchbot'),
    Schedule=require("node-schedule")
var username=process.argv[2];
var oauth=process.argv[3];
var channel = process.argv[4];
var terminate = process.argv[5];
var data=[];
for (var i=6;i<process.argv.length;i++){
    data.push(process.argv[i]);
}

var endEvent = Schedule.ScheduleJob(terminate, terminate());

const Bot = new TwitchBot({
    username : username,
    oauth:oauth,
    channel:channel
})

Bot.connect().then(() => {
    Bot.listen((err,chatter) => {
        if(err){
            console.log("listen error");
        } else {
            console.log(chatter.msg);
        }
    });
    Bot.listenFor("rdnd", (err, chatter) => {
        if(err){
            console.log("process end error");
        } else {
            if (chatter.user===username){
                terminate();
            }
        }
    });
});

function terminate(){
    process.exit();
}