const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	start_ts:Number,
	reader:String,
})

module.exports = mongoose.model('session',sessionSchema)
