import React, { Component } from "react"
import axios from "axios"
// import { Link } from "react-router-dom"
import Auth from "../../../modules/Auth"


class ReaderIcon extends Component{
	constructor(){
		super()
		this.state={
			active:false
		}
	}

    componentWillMount(){
        axios.get("/readers/active",{
			headers:{authenticate:Auth.getToken()},
			query:this.props.obj.name
		}).then(
			(result)=>{
				this.setState({
					active:result.data.active
				})
			}
		).catch(err=>{
			console.log(err.response)
		})

    }


	switch=()=>{
		let set={
				name:this.props.obj.name,
				active:!(this.state.active)
			}
		axios.post("/readers/active",set, {
			headers:{authenticate:Auth.getToken()},
		}).then(
			(result)=>{
				this.setState({
					active:result.data.active
				})
			}
		).catch(err=>{
			console.log(err)
		})
	}

	schedule=(e)=>{
		e.preventDefault()
		let head = Auth.header()
		let body={}
		body.sTime=this.sTime.value
		body.sDay=e.target.elements.sDay.value
		body.eTime=this.eTime.value
		body.eDay=e.target.elements.eDay.value
		console.log("panic?")
		axios.post("/readers/schedule/"+this.props.obj._id,body,head).then(
			result=>{
				console.log("done")
				this.setState({active:true})
			}
		).catch(err=>{console.log("...no")})
	}


    render(){
        //reciueves a single db reader details to show
        return(
            <div className="reader-icon sixteen wide mobile eight wide tablet four wide computer column">
                <h3 className="reader-name">{this.props.obj.name}</h3>
				<h4 className="reader-channel">{this.props.obj.channel||"channel undefined"}</h4>
                {/*<h3>{this.props.obj.periodic}</h3>
                <h3>{this.props.obj.period}</h3>
                <h3>{this.props.obj.immediate}</h3>
                <h3>{this.props.obj.day}</h3>
                <h3>{this.props.obj.time}</h3>
                <h3>{this.props.obj.class}</h3>
                <h3>{this.props.obj.allData}</h3>
                <h3>{this.props.obj.data}</h3>*/}
				{this.state.active ? <button className="ui button red square wider " onClick={this.switch}> Stop </button> : <button className="ui button green square wider " onClick={this.switch}> Start </button>}
				<button className="ui button black square right" onClick={()=>{this.props.del(this.props.obj._id)}} >Delete</button>
            </div>
        )
    }
}

export default ReaderIcon

