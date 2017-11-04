import React, { Component } from "react"
// import { Link } from "react-router-dom"

class ReaderIcon extends Component{
    componentWillMount(){
        //pull readers from database

    }
    render(){
        //recieves a single db reader details to show
        return(
            <div className="reader-icon">
                <h3>{this.props.obj.name}</h3>
                <h3>{this.props.obj.periodic}</h3>
                <h3>{this.props.obj.period}</h3>
                <h3>{this.props.obj.immediate}</h3>
                <h3>{this.props.obj.day}</h3>
                <h3>{this.props.obj.time}</h3>
                <h3>{this.props.obj.class}</h3>
                <h3>{this.props.obj.allData}</h3>
                <h3>{this.props.obj.data}</h3>
            </div>
        )
    }
}

export default ReaderIcon

