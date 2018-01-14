const mongoose = require('mongoose')

const summarySchema = new mongoose.Schema({
    sessionId:String,
    uniqueViews:Number,
    viewerRetention:Number
})

module.exports = mongoose.model('summary',summarySchema)
