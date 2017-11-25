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

    render(){
        //recieves a single db reader details to show
		console.log("NAME",this.props.obj.name)
        return(
            <div className="reader-icon">
                <h3>{this.props.obj.name}</h3>
                {/*<h3>{this.props.obj.periodic}</h3>
                <h3>{this.props.obj.period}</h3>
                <h3>{this.props.obj.immediate}</h3>
                <h3>{this.props.obj.day}</h3>
                <h3>{this.props.obj.time}</h3>
                <h3>{this.props.obj.class}</h3>
                <h3>{this.props.obj.allData}</h3>
                <h3>{this.props.obj.data}</h3>*/}
				{this.state.active ? <button onClick={this.switch}> Stop </button> : <button onClick={this.switch}> Start </button>}
				<hr/>
            </div>
        )
    }
}

export default ReaderIcon

