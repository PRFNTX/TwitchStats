import React, { Component } from "react"
import moment from "moment"

export class Session extends Component{
	render(){
		return(
			<div>
				<h4>{"Date: "+moment(this.props.date).format('MMMM Do YYYY, h:mm:ss a')}</h4>
				<div><span> Messages: {this.props.msgLen}, </span><span> Data Points: {this.props.strLen} </span></div>
				<button onClick={()=>this.props.explore(this.props.sId)} > Explore </button><button onClick={()=>{this.props.destroy(this.props.sId)}}> Destroy </button>
				<button onClick={()=>this.props.crunch(this.props.sId)}>Crunch</button>
			</div>
		)
	}
}

export class SessionExplore extends Component{
	render(){
		return(
			<div>
				<h4>{"Date: "+moment(this.props.session.start_ts).format('MMMM Do YYYY, h:mm:ss a')}</h4>
				<div>
					<label htmlFor="viewers-time">Viewers Over Time </label>
					<button onClick={()=>this.props.viewT(this.props.sId)} id="viewers-time">Show</button>
				</div>
				<div>
					<label htmlFor="messages-time">Messages/Minute Over Time </label>
					<button onClick={()=>this.props.messageT(this.props.sId)} id="messages-time">Show</button>
				</div>
				<div>
					<label htmlFor="messages-user">Massages Per User </label>
					<button onClick={()=>this.props.messageU(this.props.sId)} id="messages-user">Show</button>
				</div>
			</div>
		)
	}
}

export default Session

