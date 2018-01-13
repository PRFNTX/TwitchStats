const mongoose = require('mongoose')

const streamSchema = new mongoose.Schema({
	session:String,
	reader:String,
	date:Date,
	reader:String,
	id:Number,
	game:String,
	viewers:Number,
	average_fps:Number,
	created_at:Date,
	is_playlist:Boolean,
    viewerList:[String]
})

module.exports=mongoose.model('stream',streamSchema)
