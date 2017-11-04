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
app.use(bodyParser.json());
// app.use(express.static(__dirname +'/public'));
// app.use(function(req, res, next) {
	// res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// next();
//   });
  


app.post("/readers",function(req,res){
	console.log(req.body)
	let inReader=req.body
	Reader.create(inReader,function(err,reader){
		if(err){
			console.log("bad things on create reader");
		} else {
			console.log(reader)
			if (inReader.immediate){
				var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","starcraft",termVal];
				let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
				toPush.forEach((val)=>{
					args.push(val)
				})
				children[reader.name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
			}
			else if(!reader.periodic){
				var timeValue =(reader.time[1] ? reader.time[1] : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				var termVal =(reader.time[1] ? Number(reader.time[1])+2 : "*") +" "+( reader.time[0] ? reader.time[0] : "*")+" * * "+reader.day 
				schedule = nodeSchedule.scheduleJob(timeValue,function(){
					//create new reader here (fork)
					var args=["agents/reader.js",reader.name,"process.end.GM_CLIENT_ID", "prfnt","oauth:30yxno4670anheszf1chpk7upnb8xi","starcraft",termVal];
					let toPush=( !reader.allData ? reader.data : ["data1","data2","data3","dataexplicit"])
					toPush.forEach((val)=>{
						args.push(val)
					})
					children[reader.name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});

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
					children[name]=child_process.fork("./agents/reader.js",{execArgv:args,detached:true});
				});
			}
			res.json(JSON.stringify(reader))
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

app.listen(3003, function(){
console.log("started on 3003");

})

