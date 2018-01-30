const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	start_ts:Number,
    channel:String,
	reader:String,
})

module.exports = mongoose.model('session',sessionSchema)
