import React, { Component } from "react"
import axios from "axios"
import ReactHighcharts from "react-highcharts"
import moment from "moment"
import Auth from "../modules/Auth"
import { Session, SessionExplore } from "./view/session"
import Cruncher from "./view/cruncher"

/*
function zip(x,y){
	let ret = [];
	if (x.length>y.length){
		y.forEach((val,i)=>{
			ret.push([Number(moment(x[i])),y[i]])
		})
	} else {
		x.forEach((val,i)=>{
			ret.push([Number(moment(x[i])),y[i]])
		})
	}
	return ret
}
*/

class View extends Component{
	constructor(){
		super()
		this.state={
			sessions:[],
			config:{
				type:'line',
				xAxis:{
					type:'datetime'
				},
				series:[]
			},
			explore:-1,
			crunch:false,
			toCrunch:0
		}
	}	

	newSeries=(x,y,name="Unnamed",xtype='datetime')=>{
		let newCon = this.state.config;
		newCon.series=[{
			name:moment(x[0]).format("DD MMMM YYYY"),
			data:y,
			pointStart:(xtype==='datetime' ? Number(moment(x[0])) : x[0]),
			pointInterval:(xtype==='datetime' ? Number(moment(x[1]))-Number(moment(x[0])) : Number(x[1]-x[2]))
		}]
		newCon.xAxis.type='datetime'
		newCon.xAxis.dateTimeLabelFormats={
			hour:"%H:%M",
		}
		//console.log(moment(x[0]).format("h:mm") )
		//console.log(newCon)
		//addSeries.data=zip(x,y)
		//addSeries.data=y
		this.setState({
			config:newCon,
		})
	}

	destroy=(id)=>{
		if(this.state.sessions[id].streams<10){
			axios.delete("/sessions/"+this.state.sessions[id]._id,Auth.header()).then(
				result=>{
					let newSess=this.state.sessions.filter((val,i)=>!(i===id))
					this.setState({
						sessions:newSess
					})
				}
			).catch(err=>{console.log(err)})
		}
		
	}


	componentDidMount(){
		
		axios.get("/sessions",{
			headers:{
				authenticate:Auth.getToken()
			}
		}).then(
			(result)=>{
				let sess=result.data.sessions.map((val,i)=>{
					return {_id:val._id, start_ts:val.start_ts,msgs:result.data.msgs[i].len,streams:result.data.streams[i].len}
				})
				//dataSets = result.data.sets.map(val=>{return {val,name,val.x,val.y}})
				this.setState({
					sessions:sess
				})
			}, 
			(err)=>{
				console.log(err)
			}
		)
	}


	handleClick=(e,session,query={})=>{
		let header=Auth.header()
		header.query=query
		axios.get("/se)sions/"+session,header).then(
			result=>{
				this.newSeries(result.data.x,result.data.y,session)
			}
		).catch(err=>{
			console.log(err)
		})
		
	}

	explore=(id)=>{
		this.setState({
			explore:id
		})
	}
	

	//componentDidMount() {
		//let chart = this.chart.getChart();
		////chart.series[0].addPoint({x: 10, y: 12});
	//}
	viewersTime=(id)=>{
		let head=Auth.header()
		head.headers.type='viewers-time'
		axios.get("/sessions/"+this.state.sessions[id]._id,head).then(
			result=>{
				this.newSeries(result.data.x,result.data.y)	
			}
		).catch(err=>{console.log(err)})
	}

	messagesTime=(id)=>{
		let head=Auth.header()
		head.headers.type='messages-time'
		axios.get("/sessions/"+this.state.sessions[id]._id,head).then(
			result=>{
				this.newSeries(result.data.bins.map((val,i)=>{
					return Number(moment(result.data.t0))+result.data.interval*i
				}),result.data.bins)	
			}
		).catch(err=>{console.log(err)})
	}

	messagesUser=(id)=>{
		let head=Auth.header()
		head.headers.type='messages-user'
		axios.get("/sessions/"+this.state.sessions[id]._id,head).then(
			result=>{

				this.newSeries(result.data.messages.map((val,i)=>i),result.data.messages.sort((a,b)=>(b-a)),"messages-user","linear")	
			}
		).catch(err=>{console.log(err)})
	}

	crunch=(id)=>{
		this.setState({
			crunch:true,
			toCrunch:id
		})
	}

	render(){
		let sessions=this.state.sessions.map((val,i)=>{
			return <Session key={i} crunch={this.crunch} explore={this.explore} destroy={this.destroy} sId={i} date={val.start_ts} msgLen={val.msgs} strLen={val.streams} ></Session>
		})
		return(
			<div className="spacing">
				<div>
					<div className="chartgoeshere spacing ">
						{this.state.config.series.length>0 && <ReactHighcharts config={this.state.config} ref={(ref)=>this.chart=ref} />}
					</div>
				</div>
				<div className="sessions">
					{sessions}
				</div>
				<div className="explore">
					{this.state.explore<0 || <SessionExplore viewT={this.viewersTime} messageT={this.messagesTime} messageU={this.messagesUser} sId={this.state.explore} session={this.state.sessions[this.state.explore] } />}
				</div>
				{this.state.crunch && <ul><Cruncher plot={this.addSeries} id={this.state.sessions[this.state.toCrunch]._id} /></ul>}
			</div>
			)
		}
}

export default View
