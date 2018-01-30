const mongoose = require('mongoose')

const summarySchema = new mongoose.Schema({
    sessionId:String,
    channel_id: String,
    channel: String,
    uniqueViews:Number,
    viewSessions:[
        {
            username:String,
            time:Number
        }
    ],
    viewerRetention:Number,
    newSubList:[String],
    reSubList:[
        {
            username:String,
            months:Number
        }
    ]
})

module.exports = mongoose.model('summary',summarySchema)
