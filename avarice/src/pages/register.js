import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from 'axios'
import Auth from "../modules/Auth"

class Register extends Component{
    handleSubmit=(e)=>{
        e.preventDefault();
        if (e.target.children.password.value===e.target.children.confirm.value){
            let obj={
                username:e.target.children.username.value,
                password:e.target.children.password.value
            }
            axios.post("/register",obj).then(
                (user)=>{
                    console.log(user.headers.authenticate)
                    // localStorage.setItem('token',user.headers.authenticate)
                    Auth.authenticateUser(user.headers.authenticate)
                    this.props.readers()
                    window.location.pathname="/dashboard"
                },
                (err)=>{
                    console.log(err)
                }
            )
        }
        else {
            alert("passwords must match")
        }


    }
    render(){
        return(
            <div className="container">
                <form onSubmit={this.handleSubmit} >
                    <label htmlFor="username">Username:</label><input ref={(ref)=>this.user=ref} type="text" name="username" placeholder="username" />
                    <label htmlFor="password">Password:</label><input ref={(ref)=>this.pass=ref} type="password" name="password" placeholder="password" />
                    <label htmlFor="confirm">Password:</label><input ref={(ref)=>this.pass=ref} type="password" name="confirm" placeholder="confirm" />
                    <input type="submit"/>
                </form>
            </div>
        )
    }
}

export default Register