import React, { Component } from "react"
import Link from "react-router-dom"

import Menu from "../components/menu"

class Dashboard extends Component{
    render(){
        //populate readers from database
        return(
            <div className="dash-main">
                <h1> This is the dashboard </h1>
            </div>
        )
    }
}

export default Dashboard