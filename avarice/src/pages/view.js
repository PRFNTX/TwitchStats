import React, { Component } from "react"
import axios from "axios"
import ReactHighcharts from "react-highcharts"
import StreamMeta from "../modules/streamMeta"
import MessageMeta from "../modules/messageMeta"

class View extends Component{
	constructor(){
		super()
		this.config={
			chart: {
				type: 'line'
			},
			series: [{
				type: 'line',
				data: []
			},{
				type: 'column',
				data: []
			}]	
		}
		
	}	

	componentWillMount(){
		TODO implement something that looks like this
		
		axios.get("/views").then(
			(result)=>{
				//dataSets = result.data.sets.map(val=>{return {val,name,val.x,val.y}})
			}, 
			(err)=>{
				//console.log(err)
			}
		)
	}
	

	componentDidMount() {
		let chart = this.chart.getChart();
		//chart.series[0].addPoint({x: 10, y: 12});
	}

	addSeries=(data)=>{
		//TODO actually make this do something
		this.config.series.push({
			type:data.type,
			name:data.name,
			data:data.data
		})
	}

	render(){
		return(
			<div className="spacing">
				<div className="plots">
					
				</div>
				<div>
					<div className="chartgoeshere">
						<ReactHighcharts config={this.config} ref={(ref)=>{this.chart=ref}} />
					</div>
				</div>
			</div>
			)
	}
}

export default View
