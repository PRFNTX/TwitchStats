var mongoose = require("mongoose");

var readerSchema = new mongoose.Schema({
    //name
    username:String,
    name: {
        type:String,
        index:{unique:true}
    },
	channel:String,
    //periodic (bool)
    //periodic: Boolean,
    //period (daily/weekly)(true/false)
    //period: Boolean,
    //immediate (bool)
    immediate: Boolean,
    //start (weekday)
    day: Number,
    //time (hour)a
    time: [String,String],
    //start (weekday)
    endDay: Number,
    //time (hour)a
    endTime: [String,String],
    //class
    //class: String,
    //allData (bool) or:
    allData: Boolean,
    //data[] [thing,thing,thing,......]
    //data:[]
});

module.exports = mongoose.model("Reader",readerSchema);
