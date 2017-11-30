const mongoose=require('mongoose')

const channelSchema = new mongoose.Schema({
	mature:Boolean,
	status:String,
	broadcaster_language:String,
	display_name:String,
	game:String,
	language:String,
	_id:Number,
	name:String,
	created_at:Date,
	updated_at:Date,
	partner:Boolean,
	logo:String,
	video_banner:String,
	profile_banner:String,
	profile_banner_background_color:String,
	url:String,
	views:Number,
	followers:Number
})

module.exports=mongoose.model('channel',channelSchema)
