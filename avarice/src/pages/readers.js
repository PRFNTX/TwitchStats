import React, { Component } from "react"
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom"
import axios from "axios"

import ReaderIcon from "./readers/components/reader-icon"

class Readers extends Component{
    constructor(){
        super()
        this.readers=[

        ]
    }
    componentWillMount(){
        //pull readers from database
        axios.get("localhost:3000/readers").then((result)=>{
            this.setState({
                readers:result,
            })
        }).catch((err)=>{
            console.log("get routers error")
        })

    }
    render(){
        let readers=this.state.readers.map(val=>{
            return <ReaderIcon obj={val} />
        })
        return(
            <div>
                {readers}
            </div>
        )
    }
}

export default Readers
