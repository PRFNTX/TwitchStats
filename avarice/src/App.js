import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom"
import logo from './logo.svg';
import './App.css';

import Landing from "./pages/landing"
import Readers from "./pages/readers"
import NewReader from "./pages/readers/new"
import ShowReader from "./pages/readers/show-reader"
import Dashboard from "./pages/dashboard.js"
import Register from "./pages/register"
import Login from "./pages/login"

import Menu from "./components/menu"

import Auth from "./modules/Auth"

import axios from "axios"

class App extends Component {
  constructor(){
    super();
    this.state={
      readers:[]
    }
    this.populated=false;
  }
  parseParams(route,path){
    let bp=route.split("/")
    console.log(bp)
    let bpVals=path.split("/")
    let keeps=bp.map((val,i)=>{
      if (val.charAt(0)===":"){
        return i
      }
      return -1
    }).filter(val=>val>=0)
    let bpTemp=[]
    let valTemp=[]
    for (let i=0;i<keeps.length;i++){
      bpTemp.push(bp[keeps[i]])
      valTemp.push(bpVals[keeps[i]])
    }
    bp=bpTemp
    bpVals=valTemp
    console.log(bp)
    let params=bp.map((val,i)=>{
      let ret={}
      return ret[val]=bpVals[i]
    }).reduce((obj,array)=>{
      console.log(array)
      obj[Object.keys(array)[0].substring(0)]=array[Object.keys(array)[0]]
      return obj;
    },{})
    return params
  }

  populateReaders=()=>{
      this.populated=true;
      let pre={
        val:"All",
        link:"/readers"
      }
      let post={
        val:"New",
        link:"/readers/new"
      }
      axios.get("/readers",{headers:{authenticate:Auth.getToken()}}).then(
        (readers)=>{
          let readerMenu=readers.data.map(val=>{
            return {
              val:val.name,
              link:"/readers/r/"+val.name
            }
          })
          readerMenu.unshift(pre);
          readerMenu.push(post)
          this.setState({
            readers:readerMenu,
          })
        }
      )
  }

  unpopulateReaders(){
    this.setState({
      readers:[],
    })
    this.populated=false;

  }

  requireAuth(nextState,replace){
    return Auth.isUserAuthenticated()
  }

  noAuth(nextState,replace){
    return !Auth.isUserAuthenticated()
  }

  logout(nextState,replace){
    Auth.deauthenticateUser();
  }

  render() {
    if ((Auth.isUserAuthenticated())&&(!this.populated)){
      this.populateReaders()
    }
        let menuItems=[
            {
                val:"Summary",
                link:"/dashboard",
                drop:false,
                items:[]
            },
            {
                val:"Readers",
                link:null,
                drop:true,
                items:this.state.readers
            },
            {
                val:"Analyze",
                link:"/data",
                drop:false,
                items:[]
            }
        ]
    return (
      <Router>
        <div>
          <nav>
            <Menu items={menuItems} />
          </nav>
          <Switch>
            {/* Open routes */}
            <Route path="/" exact component={Landing} />
            {/* noAuth */}
            <Route path="/register" render={()=>{
                  return (this.noAuth() ? <Register readers={this.populateReaders} /> : <Redirect to="/dashboard" />)
                }
              } />
            <Route path="/login" render={()=>{
                  return (this.noAuth() ? <Login readers={this.populateReaders} /> : <Redirect to="/dashboard" />)
                }
              } />
            {/* auth routes */}
            <Route path="/dashboard" render={()=>{
                  return (this.requireAuth() ? <Dashboard /> : <Redirect to="/login" />)
                } 
              }/>
            <Route path="/readers/r/:name" render={()=>{
                  let params=this.parseParams("/readers/r/:name",window.location.pathname)
                  console.log(params)
                  return (this.requireAuth() ? <ShowReader params={params} />: <Redirect to="/login" />)
                }
              } />

            <Route path="/readers/new" render={()=>{
                  return (this.requireAuth() ? <NewReader popReaders={this.populateReaders} /> : <Redirect to="/login" />)
                }
              } />
            <Route path="/readers" exact render={()=>{
                  return (this.requireAuth() ? <Readers /> : <Redirect to="/login" />)
                }
              } />
            {/* auth empty */}
            <Route path="/logout" render={()=>{
                  this.logout();
                  this.unpopulateReaders()
                  return <Redirect to="/" />
                }
              } />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
