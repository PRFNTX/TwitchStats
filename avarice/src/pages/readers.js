import React, { Component } from "react"
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom"
import axios from "axios"
import Auth from "../modules/Auth"
import Utils from "../modules/utils"

import ReaderIcon from "./readers/components/reader-icon"

function inspect(value){
	console.log("inspect",value)
	return value
}

class Readers extends Component{
    constructor(){
        super()
        this.state={
			readers:[]
		}
    }
    componentWillMount(){
        //pull readers from database
        axios.get("/readers",{headers:{authenticate:Auth.getToken()}}).then(
			(result)=>{
				console.log("RESULT",result)
				this.setState({
					readers:result.data.readers,
				})
			}).catch((err)=>{
				console.log("get readers error")
			}
		)
    }

	
	delete=(id)=>{
		axios.delete('/readers/'+id,Auth.header()).then(
			result=>{
				let newReads=Array.from(this.state.readers).filter(val=>{return (!(val._id===id))})
				this.setState({
					readers:newReads
				})
			}
		).catch(err=>{console.log(err)})
	}

    render(){
		let readers
		console.log("READERS",this.state.readers)
		if(inspect(this.state.readers.length)){
			readers=this.state.readers.map(val=>{
				return <ReaderIcon del={this.delete} obj={val} />
			})
		}
        return(
            <div className="spacing ui grid padded" >
                {readers}
            </div>
        )
    }
}

export default Readers


