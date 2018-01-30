const mongoose = require('mongoose')

const streamSchema = new mongoose.Schema({
	session:String,
	reader:String,
	date:Date,
	id:Number,
    channel: String,
	game:String,
	viewers:Number,
    followers:Number,
    title:String,
	average_fps:Number,
	created_at:Date,
	is_playlist:Boolean,
    viewerList:[String]
})

module.exports=mongoose.model('stream',streamSchema)
