var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser")

var app= express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname +'/public'));
app.set("view engine","ejs")

app.get("/", function(req,res){
	res.render("index");
})

app.get("/dashboard", function(req,res){
	res.render("dashboard/dashboard");
});

app.listen(process.env.PORT,process.env.IP, function(){
console.log("started");

})

