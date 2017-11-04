import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

import Landing from "./pages/landing"
import Readers from "./pages/readers"
import NewReader from "./pages/readers/new"
import Dashboard from "./pages/dashboard.js"

import Menu from "./components/menu"

class App extends Component {
  render() {
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
                items:[
                    {
                        val:"All",
                        link:"/readers"
                    },
                    {
                        val:"test",
                        link:"/dashboard"
                    },
                    {
                        val:"test2",
                        link:"/dashboard"
                    },
                    {
                        val:"New",
                        link:"/readers/new"
                    }
                    
                ]
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
            <Route path="/" exact component={Landing} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/readers/new" component={Dashboard} />
            <Route path="/readers" component={Dashboard} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
