import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import Auth from "../../modules/Auth"


function inspect(value){
	console.log(value)
	return value
}

class NewReader extends Component{
    constructor(){
        super();
        this.username;
        this.state={
            classes:[
                {"name":"unable to get classes"}
            ]
        };
        // this.updated=false;
    }
    componentWillMount(){
        //pull class names from database
        // if (!this.updates){
            axios.get("/classes",{headers:{authenticate:Auth.getToken()}}).then(
                (result)=>{
                    console.log(result.data)
                    this.setState({
                        classes:result.data.classes
                    })
                    this.username=result.data.username
                },
                (err)=>{
                    console.log(err.response);
                    Auth.failedAuth(err.response.status)
                }
            )
            // this.updates=true;
        // }

    }

    componentDidMount(){
		{/*}
        let sDayOptions=this.sDay
        let eDayOptions=this.eDay
        let Weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
        let today=new Date();
        let time=new Date();
        today=today.getDay();
        for(var i=0;i<7;i++){
            sDayOptions[i].innerText=Weekdays[(i+today)%7];
        }
        for(var i=0;i<7;i++){
            eDayOptions[i].innerText=Weekdays[(i+today)%7];
        }
        console.log(time.getHours()+":"+time.getMinutes())
        this.eTime.value=inspect(time.getHours()+":"+time.getMinutes())
        this.sTime.value=time.getHours()+":"+time.getMinutes()
		*/}
    }

    onSubmit=(e)=>{
        console.log(e)
        e.preventDefault()
        var weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        //let isPeriodic= e.target.elements.periodic.checked;
        //let period=e.target.elements.period.value;
		/*
        var day=weekdays.indexOf(e.target.elements.startDay.value);
        var endDay=weekdays.indexOf(e.target.elements.endDay.value);
        var endTime=e.target.elements.eTime.value.split(":")
        let tempTime=new Date()
        let now = tempTime.getHours()+":"+tempTime.getMinutes()
        var time = ( !e.target.elements.immediate.checked ? e.target.elements.sTime.value.split(":") : now );
		*/
        //let data=[]
        //e.target.elements.data.forEach((ele)=>{
            //if (ele.checked){
                //data.push(ele.value)
            //}
        //})

        let reader={
            username:this.username,
			channel:e.target.elements.channel.value,
            name:e.target.elements.name.value,
            //periodic:isPeriodic,
            //period: period,
            immediate: e.target.elements.immediate.checked,
            /*day: day,
            time: time,
			endDay:endDay,
			endTime:endTime,
			*/
            //class:e.target.elements.class.value,
            allData: e.target.elements.allData.checked,
            //data:data,
        }
        let it = JSON.stringify(reader)
    //     fetch('/readers',{
    //         method:"POST",
    //         headers:{
    //             'Accept':'application/json',
    //             'Content-Type':'application/x-www-form-urlencoded'
    //         },
    //         body:{
    //             "reader":it
    //         }
 
    //         }).then((res)=>{
    //             console.log(res)
    //         }).catch((err)=>{
    //             console.log(err)
    //         })
    axios.post("/readers",reader,{headers:{authenticate:Auth.getToken()}}).then(
        (res)=>{
            console.log(res);
            this.props.popReaders()
        },
        (err)=>{console.log(err)}
    )
    }

    immediate=()=>{
        this.start.hidden=this.isImmediate.checked
    }
    //periodic=()=>{
    //    this.period.hidden=!this.isPeriodic.checked
    //}
    //datas=()=>{
    //    this.dataBlock.hidden=this.dataAll.checked
    //}
    render(){
        let options=this.state.classes.map(val=> {return <option value={val.name} >{val.name}</option>})
        return(
            <div className="container new-reader">
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label htmlFor="channel">Channel: </label><input type="text" name="channel" placeholder="Channel name" required />
                    </div>
                    <div>
                        <label htmlFor="name">Reader Name: </label><input type="text" name="name" placeholder="Reader name" required />
                       {/* <input ref={(ref)=>this.isPeriodic=ref} onChange={this.periodic} type="checkbox" id="periodic" name="periodic" /><label htmlFor="periodic">Recurring?</label> */}
                    </div>
					{/*
                    <div ref={(ref)=>this.period=ref} id="period" hidden="true">
                        <label htmlFor="Daily">Daily:</label><input type="radio" name="period" value="daily" id="Daily" />
                        <label htmlFor="Weekly">Weekly:</label><input type="radio" name="period" value="weekly" id="Weekly" />
                    </div>
					*/}
                    <div>
                        <input ref={(ref)=>this.isImmediate=ref} onChange={this.immediate} type="checkbox" name="immediate" id="startNow" /><label htmlFor="startNow">Start Now</label>
                    </div>
					{/*
                    <div ref={(ref)=>this.start=ref} id="sDate">
						<div><label htmlFor="sDate">Start: </label></div>
                        <label htmlFor="sDay">Day:</label>
                        <select ref={(ref)=>this.sDay=ref} name="startDay" id="sDay" required>
                            <option className="days">today</option>
                            <option className="days">tommorow</option>
                            <option className="days">The next day</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                        </select>
                    
						<label htmlFor="time">Time:</label>
                        <input ref={(ref)=>this.sTime=ref} type="time" name="sTime" />
                    </div>
					<div ref={(ref)=>this.end=ref} id="end">
					<div><label htmlFor="end">End: </label></div>
                        <label htmlFor="eDay">Day:</label>
                        <select ref={(ref)=>this.eDay=ref} name="endDay" id="eDay" required>
                            <option className="days">today</option>
                            <option className="days">tommorow</option>
                            <option className="days">The next day</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                            <option className="days">etc</option>
                        </select>
                    
						<label htmlFor="eTime">Time:</label>
                        <input ref={(ref)=>this.eTime=ref} type="time" name="eTime" />
                    </div>
                    <div>
					*/}
					{/*
                    <label htmlFor="class">Reader Class:</label>
                    <select name="class" id="class" required>
                        {options}
                    </select>
                    <a href="/class/new">New Class (reroutes) </a>
                    </div>
                    <div>
					*/}
                    <input ref={(ref)=>this.dataAll=ref} onChange={()=>{this.datas()}} id="dataAll" type="checkbox" value="all" name="allData"  hidden checked/><label hidden htmlFor="dataAll">Track All</label>
					{/*
                    <div ref={(ref)=>this.dataBlock=ref} id="allData">
                    <div className="block"  >
                        <input id="data1" className="dataType" type="checkbox" name="data" value="data1" /><label htmlFor="data1">data1</label>
                        <input id="data2" className="dataType" type="checkbox" name="data" value="data2" /><label htmlFor="data2">data2</label>
                    </div>
                    <div className="block" >
                        <input id="data3" className="dataType" type="checkbox" name="data" value="data3" /><label htmlFor="data3">data3</label>
                        <input id="data4" className="dataType" type="checkbox" name="data" value="data4" /><label htmlFor="data4">data4</label>
                    </div>
                    <div className="block" >
                        <input id="data5" className="dataType" type="checkbox" name="data" value="data5" /><label htmlFor="data5">data5</label>
                        <input id="data6" className="dataType" type="checkbox" name="data" value="data6" /><label htmlFor="data6">data6</label>
                    </div>
                    <div className="block" >
                        <input id="data7" className="dataType" type="checkbox" name="data" value="data7" /><label htmlFor="data7">data7</label>
                        <input id="data8" className="dataType" type="checkbox" name="data" value="data8" /><label htmlFor="data8">data8</label>
                    </div>
                    </div>
					*/}
                   {/* </div> */}
                <button>Set Reader</button> 
                </form>
            </div>

        )
    }
}

export default NewReader

