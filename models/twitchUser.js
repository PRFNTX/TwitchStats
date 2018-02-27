const mongoose = require('mongoose')

const twitchUserSchema = new mongoose.Schema({
    username: String,
    subscribed_to: [
        {
            channel:String,
            sub_end:Number
        }
    ],
    viewed_sessions:[String]
})

module.exports=mongoose.model('twitchUser', twitchUserSchema)
