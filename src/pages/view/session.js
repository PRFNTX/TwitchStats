import React, { Component } from "react"
import moment from "moment"
import {PropTypes} from 'prop-types'


//list component for sessions
export class Session extends Component{

	render(){
		return(
			<div>
				<h4 className="stretch-4"><strong>{"Date: "+moment(this.props.date).format('MMMM Do YYYY, h:mm:ss a')}</strong></h4>
				<div className="stretch-text"><span> <strong>Messages:</strong> {this.props.msgLen}, </span><span> <strong>Data Points:</strong> {this.props.strLen} </span></div>
				<button className="ui button yellow half"  onClick={()=>this.props.explore(this.props.sId)} > Explore </button>
                <button className="ui button green half" onClick={()=>this.props.summarize(this.props.sId)} > Summarize </button>
				{/*<button className="ui button blue third"  onClick={()=>this.props.crunch(this.props.sId)}>Crunch</button>*/}
				<button className="ui button black fifth" onClick={()=>{this.props.destroy(this.props.sId)}}> Destroy </button>
				<hr/>
			</div>
		)
	}
}

//graph selector for sessions
export class SessionExplore extends Component{
	render(){
		return(
			<div className="space">
				<h4 className="stretch-4" >{"Date: "+moment(this.props.session.start_ts).format('MMMM Do YYYY, h:mm:ss a')}</h4>
				<h5 className="stretch-text">Plots:</h5>
				<div>
					<label htmlFor="viewers-time"></label>
					<button className="ui button center space half" onClick={()=>this.props.viewT(this.props.sId)} id="viewers-time">Viewers Over Time </button>
				</div>
				<div>
					<label htmlFor="messages-time"></label>
					<button className="ui button center space half" onClick={()=>this.props.messageT(this.props.sId)} id="messages-time">Messages/Minute Over Time </button>
				</div>
				<div>
					<label htmlFor="messages-user"></label>
					<button className="ui button center space half" onClick={()=>this.props.messageU(this.props.sId)} id="messages-user">Messages Per User </button>
				</div>
			</div>
		)
	}
}

Session.propTypes={
    date: PropTypes.number,
    msgLen: PropTypes.number,
    strLen: PropTypes.number,
    sId: PropTypes.string.isRequired,
    destroy: PropTypes.func.isRequired,
    explore: PropTypes.func.isRequired,
    summarize: PropTypes.func.isRequired,
    crunch: PropTypes.func
}

SessionExplore.propTypes = {
    messageT: PropTypes.func,
    messageU: PropTypes.func,
    sId: PropTypes.string.isRequired,
    session: PropTypes.object.isRequired,
    viewT: PropTypes.func.isRequired
}

export default Session

