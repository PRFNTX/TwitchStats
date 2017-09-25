var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	Reader=require("./models/reader"),
	nodeSchedule=require("node-schedule")

var app= express();

var children={};

//mongoose.connect("Avarice");

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
var weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
app.post("/readers",function(req,res){
	var inReader = req.body;
	console.log(inReader)
	var day;
	weekdays.forEach(function(val,ind){
		if(val===inReader.startDay){
			day=ind;
		}
	});

	var time = inReader.time.split(":");
	var schedule
	var read = new Reader();
	var keys = inReader.keys();
	keys.forEach(function(val){
		read[val]=inReader[val];
	});
	read.save(function(err,reader){
		if(err){
			console.log("bad things on create reader");
		} else {
			
			if(!inReader.periodic){
				var timeValue =time[1]+" "+time[0]+" * * "+day 
				schedule = nodeSchedule.scheduleJob(time[1]+" "+time[0]+" * * "+day,function(){
					//create new reader here (fork)
					var args=[name,process.end.GM_CLIENT_ID, "prfnt",timeValue];
					args.push(data);
					children[name]=child_process.fork("reader.js",{execArgv:args});

				});
			} else {
				var rule;
				rule = new nodeSchedule.ReccurenceRule();
				rule.dayOfWeek=day;
				rule.hour=time[0];
				rule.minute=time[1];
				schedule = nodeSchedule.scheduleJob(rule,function(){
					//create new reader here (forkvar args=[timeValue];
					var args=[name,process.end.GM_CLIENT_ID, "prfnt",timeValue];
					args.push(data);
					children[name]=child_process.fork("reader.js",{execArgv:args});
				});
			}
			res.redirect("/readers")
		}
	})
	//name 
	//periodic (bool)
	//period (daily/weekly)
	//immediate (bool)
	//start (weekday)
	//time (hour)
	//class
	//allData (bool) or:
	//data[] [thing,thing,thing,......]
	//res.redirect(redirect to error page)
})
app.get("/readers/new", function(req,res){
	res.render("readers/new");
})

app.listen(3000, function(){
console.log("started");

})

