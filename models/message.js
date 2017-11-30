const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
	session:String,
	reader:String,
	time:Date,
	displayName:String,
	emotes:String,
	id:String,
	mod:Boolean,
	room_id:Number,
	sent_ts:Number,
	subscriber:Boolean,
	tmi_sent_ts:Number,
	turbo:Boolean,
	user_id: Number,
	user_type:String,
	badges:{
		subscriber:Number,
		broadcaster:Number,
		
	},
	channel:String,
	message:String,
	username:String
})

module.exports=mongoose.model('message',messageSchema)
