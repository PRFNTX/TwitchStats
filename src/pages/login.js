import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from 'axios'
import Auth from "../modules/Auth"

class Login extends Component{
    handleSubmit=(e)=>{
        e.preventDefault();
        let obj={
            username: e.target.children.username.value,
            password:e.target.children.password.value
        }
        console.log(obj)
        axios.post("/login",obj).then(
            (user)=>{
                console.log(user.headers.authenticate)
                // localStorage.setItem('token',user.headers.authenticate)
                Auth.authenticateUser(user.headers.authenticate)
                this.props.readers()
                window.location.pathname="/dashboard"
            },
            (err)=>{
                console.log(err)
                alert("error")
            }
        )



    }
    render(){
        return(
            <div className="container">
                <form onSubmit={this.handleSubmit} >
                    <label htmlFor="username">Username:</label><input ref={(ref)=>this.user=ref} type="text" name="username" placeholder="username" />
                    <label htmlFor="password">Password:</label><input ref={(ref)=>this.pass=ref} type="password" name="password" placeholder="password" />
                    <input type="submit"/>
                </form>
            </div>
        )
    }
}

export default Login
