var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	Reader=require("./models/reader"),
	nodeSchedule=require("node-schedule")

const child_process = require("child_process")

var app= express();

var children={};

mongoose.connect("mongodb://localhost/Avarice");

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
	var day=weekdays.indexOf(inReader.startDay);

	var time = inReader.time.split(":");
	var schedule
	var read = new Reader();
	// var keys = inReader.keys();
	// keys.forEach(function(val){
	// 	read[val]=inReader[val];
	// });
	console.log("immediate",inReader.immediate=="on")
	//console.log("day",inReader.immediate=="on")
	//console.log("time",time)
	//console.log("immediate",inReader.immediate=="on")
	Reader.create({
		name:inReader.name,
		//is periodic
		periodic:inReader.peiodic,
		//period (daily/weekly)(true/false)
		period:false,
		//immediate (bool)
		immediate:inReader.immediate=="on",
		//start (weekday)
		day:day,
		//time (hour)a
		time:time,
		//class
		class:inReader.class,
		//allData (bool) or:
		allData:inReader.allData==="all",
		//data[] [thing,thing,thing,......]
		data:(inReader.allData==="all" ? [] : inReader.data)
	},function(err,reader){
		if(err){
			console.log("bad things on create reader");
		} else {
			console.log(reader)
			if (inReader.immediate=="on"){
				var args=["reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","lara6683",termVal];
				let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
				toPush.forEach((val)=>{
					args.push(val)
				})
				children[reader.name]=child_process.fork("./reader.js",{execArgv:args,detached:true});
			}
			else if(!reader.periodic){
				var timeValue =(reader.time[1] ? reader.time[1] : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				var termVal =(reader.time[1] ? Number(reader.time[1])+2 : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				schedule = nodeSchedule.scheduleJob(timeValue,function(){
					//create new reader here (fork)
					var args=["reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","lara6683",termVal];
					let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
					toPush.forEach((val)=>{
						args.push(val)
					})
					children[reader.name]=child_process.fork("./reader.js",{execArgv:args,detached:true});

				});
			} else {
				var rule;
				rule = new nodeSchedule.ReccurenceRule();
				rule.dayOfWeek=day;
				rule.hour=time[0];
				rule.minute=time[1];
				schedule = nodeSchedule.scheduleJob(rule,function(){
					//create new reader here (forkvar args=[timeValue];
					var args=["reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","lara6683",timeValue];
					args.push(data);
					children[name]=child_process.fork("reader.js",{execArgv:args,detached:true});
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
console.log("started on 3000");

})

