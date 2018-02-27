const mongoose = require('mongoose')

const subMetaSchema = new mongoose.Schema({
    username: String,
    channel_id: String,
    channel: String,
    views: [{
        session: String,
        start:Number,
        duration:Number,
        messages: Number
    }],
    averageViewTime:Number,
    minutesViewed:Number,
    messagesSent:Number,
    firstSubscribe: Number
})

module.exports = mongoose.model('subMeta',subMetaSchema)
