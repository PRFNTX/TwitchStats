import React, { Component } from "react"
import axios from "axios"
import Auth from "../../modules/Auth"

class ShowReader extends Component{
    constructor(){
        super()
        this.state={
            reader:{}
        }
    }
    componentDidMount(){

        axios.get("/api/readers/"+this.props.params.name,{
            // query:{
                // name:this.params.name
            // },
            headers:{
                authenticate:Auth.getToken()
            }
        }).then(
            (result)=>{
                this.setState({
                    reader:result.data
                })
                console.log(result.data)
            },
            (err)=>{
                console.log(err)
                Auth.failedAuth(err.response.status)
                window.location.pathname="/readers/"
            }
        )

    }
    render(){
        return(
            <div/>
        )
    }
}
 export default ShowReader
