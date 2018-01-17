import React, { Component } from "react"
import axios from "axios"
import ReactHighcharts from "react-highcharts"
import moment from "moment"
import Auth from "../modules/Auth"
import { Session, SessionExplore } from "./view/session"
import Cruncher from "./view/cruncher"
import Summary from './view/summary'

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
				title:"",
				type:'line',
				xAxis:{
					type:'datetime'
				},
				series:[],
			},
			explore:-1,
			crunch:false,
			toCrunch:0,
            summaries:[],
            summary:null
		}
	}	

	newSeries=(x,y,name="Unnamed",xtype='datetime')=>{
		let newCon = this.state.config;
		newCon.series=[{
			name:moment(x[0]).format("DD MMMM YYYY"),
			data:y,
			pointStart:(xtype==='datetime' ? Number(moment(x[0])) : x[0]),
			pointInterval:(xtype==='datetime' ? Number(moment(x[1]))-Number(moment(x[0])) : Number(x[2]-x[1]))
		}]
		newCon.xAxis.type=xtype
		newCon.xAxis.title=(xtype==='datetime' ? "Time" : "User")
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
			axios.delete("/api/sessions/"+this.state.sessions[id]._id,Auth.header()).then(
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
		
		axios.get("/api/sessions/",{
			headers:{
				authenticate:Auth.getToken()
			}
		}).then(
			(result)=>{
				let sess=result.data.sessions.map((val,i)=>{
					return {_id:val._id, start_ts:val.start_ts,msgs:result.data.msgs[i].len,streams:result.data.streams[i].len}
				})
				this.setState({
					sessions:sess
				})
                return sess
			}, 
			(err)=>{
				console.log(err)
			}
		).then(
            sess=>{
                axios.get('/api/sessions/summarize', Auth.header()).then(
                    result=>{
                        let summariesActive = new Array(sess.length)
                        sess.forEach((session,i)=>{
                            if (result.data.summaries.indexOf(session._id)>=0){
                                summariesActive[i]='active'
                            }
                        })
                        console.log('active',summariesActive)
                        this.setState({
                            summaries:summariesActive
                        })
                    }
                ).then(
                    next=>{
                        axios.get('/api/sessions/summary',Auth.header()).then(
                            result=>{
                                let summariesComplete=Array.from(this.state.summaries)
                                sess.forEach((session,i)=>{
                                    if (result.data.summaries.indexOf(session._id)>=0){
                                        summariesComplete[i]='complete'
                                    }
                                })
                                console.log('complete',summariesComplete)
                                this.setState({
                                    summaries:summariesComplete
                                })
                            }
                        )
                    }
                )
           }
        )
	}


	handleClick=(e,session,query={})=>{
		let header=Auth.header()
		header.query=query
		axios.get("/api/sessions/"+session,header).then(
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

	//plotting funcitons x3
	viewersTime=(id)=>{
		let head=Auth.header()
		head.headers.type='viewers-time'
		axios.get("/api/sessions/"+this.state.sessions[id]._id,head).then(
			result=>{
				this.newSeries(result.data.x,result.data.y)	
			}
		).catch(err=>{console.log(err)})
	}

	messagesTime=(id)=>{
		let head=Auth.header()
		head.headers.type='messages-time'
		axios.get("/api/sessions/"+this.state.sessions[id]._id,head).then(
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
		axios.get("/api/sessions/"+this.state.sessions[id]._id,head).then(
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

    isSummarizing=()=>{
        axios.get('/api/sessions/summarize', Auth.header()).then(
            result=>{
                let summariesActive = new Array(this.state.sessions.length)
                this.state.sessions.forEach((session,i)=>{
                    if (result.data.summaries.indexOf(session._id)>=0){
                        summariesActive[i]='active'
                    }
                })
                this.setState({
                    summarizing:'active'
                })
            }
        ).then(
            next=>{
                axios.get('/api/sessions/summary',Auth.header()).then(
                    result=>{
                        let summariesComplete=Array.from(this.state.summaries)
                        result.data.summaries.forEach(val=>{
                            summariesComplete[this.state.sessions.map(sess=>sess._id).indexOf(val.sessionId)] = 'complete'
                        })
                        this.setState({
                            summaries:summariesComplete
                        })
                    }
                )
            }
        )
    }

    summarize=(sId)=>{
        let id=this.state.sessions[sId]._id
        axios.post('/api/sessions/summarize/'+id,{},Auth.header()).then(
            result=>{
                let newArray = Array.from(this.state.summaries)
                newArray[sId]=result.data.summary
                this.setState({
                    summaries:newArray
                })
            }
        )
    }

    recalculateSummary(sessionId){
        axios.delete('/api/sessions/summary/'+sessionId,Auth.header()).then(
            after=>{
                axios.post('/api/sessions/summarize/'+sessionId,{},Auth.header())
            }
        ).catch(err=>{
            console.log(err)
        })
    }

    getSummary=(sId)=>{
        console.log('get summary')
        let id = this.state.sessions[sId]._id
        axios.get('/api/sessions/summary/'+id,Auth.header()).then(
            result=>{
                const summary = result.data.summary
                this.setState({
                    summary:<Summary summary={summary} summarize={this.recalculateSummary} />,
                })
            }
        )
    }

	render(){
		let sessions=this.state.sessions.map((val,i)=>{
            let summaryAction = this.state.summaries[i]
            /*
            const summaryState = this.state.summaries[i]
            if (summaryState==="active"){
                summaryAction = ()=>{}
            } else if (summaryState==="complete"){
                summaryAction = this.getSummary
            } else {
                summaryAction = this.summarize
            }
            */

			return <Session
                key={i}
                crunch={this.crunch}
                explore={this.explore}
                destroy={this.destroy}
                summarize={this.summarize}
                getSummary={this.getSummary}
                summaryState={summaryAction}
                sId={i}
                date={val.start_ts}
                msgLen={val.msgs}
                strLen={val.streams}
            />
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
					{this.state.explore<0 || <SessionExplore
                                                viewT={this.viewersTime}
                                                messageT={this.messagesTime}
                                                messageU={this.messagesUser}
                                                sId={this.state.explore}
                                                session={this.state.sessions[this.state.explore] }
                                            />}
				</div>
                <div className='summary'>
                    {this.state.summary}
                </div>
				{this.state.crunch && <ul><Cruncher 
                                            plot={this.addSeries}
                                            id={this.state.sessions[this.state.toCrunch]._id}
                                            />
                                    </ul>}
			</div>
			)
		}
}

export default View
