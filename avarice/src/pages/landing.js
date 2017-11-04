import React, { Component } from "react"
import { Link } from "react-router-dom"

class Landing extends Component{
    render(){
        return(
            <Link to="/dashboard"><button> To Dash </button></Link>
        )
    }
}

export default Landing