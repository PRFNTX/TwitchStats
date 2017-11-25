const mongoose = require('mongoose')

const joinSchema = new mongoose.Schema({
	thing:String,
})

module.exports=mongoose.model('join',joinSchema)

