import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Auth from "../modules/Auth"
//import Utils from "../modules/utils"

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
				this.setState({
					readers:result.data.readers,
				})
			}).catch((err)=>{
				console.log("get readers error")
                Auth.failedAuth(err.response.status)
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
		).catch(err=>{
			console.log(err)
			Auth.failedAuth(err.response.status)
		})
	}

    render(){
		let readers
		//populate readers
		if(this.state.readers && this.state.readers.length){
			readers=this.state.readers.map((val,i)=>{
				return <ReaderIcon key={i} del={this.delete} obj={val} />
			})
		}
        return(
			<div>
				<div className="spacing ui grid padded" >
					{readers}
				</div>
				<div className="bottom">
					<Link className="ui button square blue center wider" to="/readers/new">New Reader </Link>
				</div>
			</div>
        )
    }
}

export default Readers


