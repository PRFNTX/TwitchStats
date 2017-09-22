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

app.get("/readers", function(req,res){
	res.render("readers/index");
})

app.post("/readers",function(req,res){
	res.redirect("/readers")
})
app.get("/readers/new", function(req,res){
	res.render("readers/new");
})

app.listen(3000, function(){
console.log("started");

})

