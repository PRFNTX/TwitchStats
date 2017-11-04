import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"


class NewReader extends Component{
    componentWillMount(){
        //pull readers from database
    }

    onSubmit(e){
        e.preventDefault()
        var weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
        let isPeriodic= e.content.periodic==="on"
        let period=(e.content.period==="daily" ? true : false)
        var day=weekdays.indexOf(e.content.startDay);
        var time = e.content.time.split(":");
        let reader={
            name:e.content.name,
            periodic:isPeriodic,
            period: period,
            immediate: e.content.immediate=="on",
            day: day,
            time: time,
            class:e.content.class,
            allData: e.content.allData==='on',
            data:e.content.data
        }

        axios.post("localhost:3000",JSON.stringify(reader)).then(()=>console.log("success")).catch((err)=>{
            console.log(err)
        })

    }

    immediate(){
        this.date.hidden=this.isImmediate.checked
    }
    periodic(){
        this.period.hidden=!this.isPeriodic.checked
    }
    datas(){
        this.datas.hidden=this.dataAll.checked
    }
    render(){
        return(
            <form action="/readers" method="POST" onSubmit={this.onSubmit}>
                <div>
                    <input type="text" name="name" placeholder="Reader name" required />
                    <input ref={(ref)=>this.isPeriodic=ref} onChange={this.periodic} type="checkbox" id="periodic" name="periodic" /><label for="periodic">Recurring?</label>
                </div>
                <div ref={(ref)=>this.period=ref} id="period" hidden="true">
                    <label for="Daily">Daily:</label><input type="checkbox" name="period" value="daily" id="Daily" />
                    <label for="Weekly">Weekly:</label><input type="checkbox" name="period" value="weekly" id="Weekly" />
                </div>
                <div>
                    <input ref={(ref)=>this.isImmediate=ref} onChange={this.immediate} type="checkbox" name="immediate" id="startNow" /><label for="startNow">Start Now</label>
                </div>
                <div ref={(ref)=>this.date=ref} id="date">
                    <label for="day">Day:</label>
                    <select name="startDay" id="day" required>
                        <option class="days">today</option>
                        <option class="days">tommorow</option>
                        <option class="days">The next day</option>
                        <option class="days">etc</option>
                        <option class="days">etc</option>
                        <option class="days">etc</option>
                        <option class="days">etc</option>
                    </select>
                
                        <label for="time">Time:</label>
                        <input type="time" name="time" />
                </div>
                <div>
                <labal for="class">Reader Class:</labal>
                <select name="class" id="class" required>
                    <option>get from premade classes from user db</option>
                </select>
                <a href="/class/new">New Class (reroutes) </a>
                </div>
                <div>
                <label>Track:</label>
                <div class="block" ><input ref={(ref)=>this.dataAll=ref} onChange={this.datas} id="dataAll" type="checkbox" value="all" name="allData" /><label for="dataAll">Track All</label></div>
                <div ref={(ref)=>this.datas=ref} id="allData">
                <div class="block"  >
                    <input id="data1" class="dataType" type="checkbox" name="data[]" value="data1" /><label for="data1">data1</label>
                    <input id="data2" class="dataType" type="checkbox" name="data[]" value="data2" /><label for="data2">data2</label>
                </div>
                <div class="block" >
                    <input id="data3" class="dataType" type="checkbox" name="data[]" value="data3" /><label for="data3">data3</label>
                    <input id="data4" class="dataType" type="checkbox" name="data[]" value="data4" /><label for="data4">data4</label>
                </div>
                <div class="block" >
                    <input id="data5" class="dataType" type="checkbox" name="data[]" value="data5" /><label for="data5">data5</label>
                    <input id="data6" class="dataType" type="checkbox" name="data[]" value="data6" /><label for="data6">data6</label>
                </div>
                <div class="block" >
                    <input id="data7" class="dataType" type="checkbox" name="data[]" value="data7" /><label for="data7">data7</label>
                    <input id="data8" class="dataType" type="checkbox" name="data[]" value="data8" /><label for="data8">data8</label>
                </div>
                </div>
                </div>
               <button>Set Reader</button> 
            </form>
        )
    }
}

export default NewReader

