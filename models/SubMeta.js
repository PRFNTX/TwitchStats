const mongoose = require('mongoose')

const subMetaSchema = new mongoose.Schema({
    userName: String,
    channel_id: String,
    channel: String,
    views: [{
        session: String,
        start:Number,
        duration:Number
    }],
    averageViewTime:Number,
    minutesViewed:Number,
    messagesSent:Number,
    firstSubscribe: Number
})

module.exports = mongoose.model('subMeta',subMetaSchema)
