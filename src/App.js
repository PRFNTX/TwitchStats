import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom"
import './App.css';

import Landing from "./pages/landing"
import Readers from "./pages/readers"
import NewReader from "./pages/readers/new"
import ShowReader from "./pages/readers/show-reader"
//import Dashboard from "./pages/dashboard.js"
import Register from "./pages/register"
import Login from "./pages/login"
import View from "./pages/view"

import Menu from "./components/menu"

import Auth from "./modules/Auth"

import axios from "axios"

class App extends Component {
  constructor(){
    super();
    this.state={
		readers:[],
		user:{username:null}
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
        link:"/readers/"
      }
      let post={
        val:"New",
        link:"/readers/new"
      }
      axios.get("/api/readers/",{headers:{authenticate:Auth.getToken()}}).then(
        (readers)=>{
          console.log(readers)
          if (Array.isArray(readers.data.readers)){
          }
          let readerMenu=readers.data.readers.map(val=>{
            return {
              val:val.name,
              link:"/readers/r/"+val.name
            }
          })
          readerMenu.unshift(pre);
          readerMenu.push(post)
          this.setState({
            readers:readerMenu,
			user:readers.data.user
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
                val:(this.state.user.username || "login"),
                link:null,
                drop:false,
                items:[]
            },
            {
                val:"Readers",
                link:"/readers",
                drop:false,
                items:this.state.readers
            },
            {
                val:"View Data",
                link:"/view",
                drop:false,
                items:[]
            }
        ]
    return (
      <Router>
        <div>
          <nav>
            <Menu items={menuItems} user={this.state.user} />
          </nav>
          <Switch>
            {/* Open routes */}
            <Route path="/" exact component={Login} />
            {/* noAuth */}
            <Route path="/register" render={()=>{
                  return (this.noAuth() ? <Register readers={this.populateReaders} /> : <Redirect to="/dashboard" />)
                }
              } />
            <Route path="/login" render={()=>{
                  return (this.noAuth() ? <Login readers={this.populateReaders} /> : <Redirect to="/dashboard" />)
                }
              } />
            {/* auth required routes */}
            <Route path="/dashboard" render={()=>{
                  return (this.requireAuth() ? <Redirect to="/readers" /> : <Redirect to="/login" />)
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
            <Route path="/view" exact render={()=>{
                  return (this.requireAuth() ? <View /> : <Redirect to="/login" />)
                }
              } />
            {/* auth empty */}
            <Route path="/logout" render={()=>{
                  this.logout();
                  //this.unpopulateReaders()
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
