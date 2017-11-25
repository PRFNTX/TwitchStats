import React, { Component } from "react"
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom"
import axios from "axios"
import Auth from "../modules/Auth"

import ReaderIcon from "./readers/components/reader-icon"

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
					readers:result.data,
				})
			}).catch((err)=>{
				console.log("get readers error")
			}
		)
    }

    render(){
		let readers
		console.log("READERS",this.state.readers)
		if(this.state.readers){
			readers=this.state.readers.map(val=>{
				return <ReaderIcon obj={val} />
			})
		}
        return(
            <div className="spacing" >
                {readers}
            </div>
        )
    }
}

export default Readers
