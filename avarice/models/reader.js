var mongoose = require("mongoose");

var readerSchema = new mongoose.Schema({
    //name
    name: String,
    //periodic (bool)
    periodic: Boolean,
    //period (daily/weekly)(true/false)
    period: Boolean,
    //immediate (bool)
    immediate: Boolean,
    //start (weekday)
    day: Number,
    //time (hour)a
    time: [String,String],
    //class
    class: String,
    //allData (bool) or:
    allData: Boolean,
    //data[] [thing,thing,thing,......]
    data:[]
});

module.exports = mongoose.model("Reader",readerSchema);