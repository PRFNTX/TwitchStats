import React, { Component } from "react"
import Auth from "../modules/Auth"

import axios from "axios"


class Dashboard extends Component{
    componentDidMount(){
        axios.get("/api/dashboard",{headers:{authenticate:Auth.getToken()}}).then(
            (res)=>{
                console.log(res);
            },
            (err)=>{
                console.log(err.response)
                Auth.failedAuth(err.response.status)
            }
        )
    }
    render(){
        //populate readers from database
        return(
            <div className="dash-main spacing">
                <h1> This is the dashboard </h1>
            </div>
        )
    }
}

export default Dashboard
