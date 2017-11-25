const mongoose = require('mongoose')

const timeoutSchema = new mongoose.Schema({
	thing:String,
})

module.exports=mongoose.model('timeout',timeoutSchema)

