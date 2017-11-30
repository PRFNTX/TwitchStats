const   mongoose    =   require("mongoose")

let UserSchema = new mongoose.Schema({
    username:{
        type:String,
        index:{unique:true}
    },
    password:String,
});

module.exports= mongoose.model("User",UserSchema);