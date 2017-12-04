
const TwitchBot= require('twitch-bot'),
	Schedule=require("node-schedule"),
	moment=require("moment"),
	Message=require("../models/message")
	Stream=require("../models/stream")
	Session=require("../models/session")
	Reader=require("../models/reader")
	//Channel=require("./models/stream")
	axios=require('axios')
	twitch=require('twitch.tv')
	env=require("../env/env.js")
const options={
	ua:"",
	apiVersion:"5",
	clientID:env.clientID
}



const mongoose=require("mongoose")
mongoose.connect("mongodb://localhost/Avarice")

const username=process.argv[4];
const oauth=process.argv[5];
const channel = process.argv[6];
const terminate = process.argv[7];
const data=[];
for (var i=7;i<process.argv.length;i++){
	data.push(process.argv[i]);
}


//finds channel id from channel name

let channelID
if ('null'===data[0]){
	twitch("users?login="+data[2],options,(err,res)=>{
		if (err){
			//console.log(err)
		}
		channelID=res.users[0]._id
	})
} 


//get the reader from the database and start a new session 

//Prom.then(
Reader.findOne({username:"test",name:data[1]}).then( reader=>{ 
Session.create({
	start_ts:Number(moment()),
	reader:reader._id,
}).then(
session=>{

	const startDate=moment().format("DD-MM-YYYY")

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

	//close application when message recieved from parent

	process.on('message',(msg)=>{
		console.log(msg)
		if (msg.message==='close'){
			process.exit();
		}
	})
	
	//create bot
	const Bot = new TwitchBot({
		//username : (username ? username : "prfnt"),
		username : 'prfnt',
		oauth:oauth,
		//channel: (channel ? channel : "prfnt"),
		channel: reader.channel || channelID,
	})

	//start processes on join
	Bot.on('join', ()=>{

		//let dataPoint=new ActivityData()
		//console.log(dataPoint)
	//

		//api call every 60 seconds
		setInterval(()=>{
			console.log(channelID)
			twitch("streams/"+channelID,options, (err,res)=>{
				createStream(res.stream,session,reader)
			})
		},60000)
		
		//save messages
		Bot.on("message", (chatter)=>{
			console.log("chat  event",chatter.username)
			createMessage(chatter,session,reader);
		})

		//TODO
		Bot.on('close',(thing)=>{
			console.log("CLOSED", thing)
		})		

		Bot.on('join',(thing)=>{
			console.log("JOIN", thing)
		})		

		Bot.on('error',(thing)=>{
			console.log("ERROR", thing)
		})		

		Bot.on('ban',(thing)=>{
			console.log("BAN", thing)
		})		

		Bot.on('timeout',(thing)=>{
			console.log("TIMEOUT", thing)
		})		

	})

	Bot.on("error", (err)=>{
		console.log(err)
		//console.log("ooo fuckin... error.")
	})



	//END OF CONTENT
	}).catch(err=>{console.log(err);console.log("start failed")})/*end of session 
*//* end of reader*/}).catch(
(err)=>{
	console.log(err)
	console.log("start failed")
})
/*).catch(
	err=>{
		console.log(err)
		console.log("start failed")
	}
)*/

function createMessage(chatter, session, reader){
	Message.create({
		session:session._id,
		reader:reader._id,
		time:chatter.sent_ts,
		displayName:chatter.display_name,
		emotes:chatter.emotes,
		id: chatter.id,
		mod:chatter.mod,
		room_id:chatter.room_id,
		sent_ts:chatter.send_ts,
		subscriber:chatter.subscriber,
		tmi_sent_ts:chatter.tmi_sent_ts,
		turbo:chatter.turbo,
		user_id:chatter.user_id,
		user_type:chatter.user_type,
		badges:chatter.badges,
		channel:chatter.channel,
		message:chatter.message,
		username:chatter.username,
	}).then(
		result=>{
			console.log("message write successful")
		}
	).catch(err=>{console.log("write failed")})
}


function createStream(result, session,reader){
	let data = result;
	Stream.create({
		session:session._id,
		reader:reader._id,
		id:data._id,
		game:data.game,
		viewers:data.viewers,
		avarage_fps:data.average_fps,
		created_at:data.create_at,
		is_playlist:data.is_playlist
	}).then(
		result=>{
			console.log('Stream write successful')
		}
	).catch(err=>{console.log(err)})} 
