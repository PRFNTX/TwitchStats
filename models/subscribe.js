const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
    session:String,
    reader:String,
    time:Number,
    badges: {
        subscriber: Number,
        premium: Number
    },
    color:String,
    display_name:String,
    emotes:String,
    id: String,
    login: String,
    mod: Boolean,
    msg_id: String,
    msg_param_months: Number,
    msg_param_sub_plan_name:String,
    msg_param_sub_plan:String,
    room_id:String,
    subscriber: Boolean,
    system_msg:String,
    tmi_sent_ts:Number,
    turbo: Boolean,
    user_id:String,
    user_type: String
})

module.exports = mongoose.model("Subscribe", subscribeSchema)
