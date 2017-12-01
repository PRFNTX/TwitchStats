import React, { Component } from "react"
import { Link } from "react-router-dom"
//import MenuDropdown from "./menu-dropdown"
//import Utils from "../modules/utils"

class MenuItem extends Component{
    constructor(){
        super()
        this.state={
            showDrop:true
        }
        this.style={
            "display":"inline-block",
            "position":"relative"
        }
    }
    componentDidMount(){
        this.setState({
            showDrop:false,
        })
    }
    drop=(e,over)=>{
        if(over&&this.state.showDrop){

        }
        else if (this.props.item.drop){
            let boo = this.state.showDrop
            this.setState({
                showDrop:!boo
            })
        }
        
    }
    render(){
        //props.item= {
        //        val:String,
       //         link:null/String
       //         drop:Bool,
       //         items:[
       //             val:String
       //             link:String
       //         ]
       //     }
		
       let item
       if (this.props.item.drop||!(this.props.item.link)){
        //    item= <MenuDropdown items={this.props.item.items} />
            item= <span ><h2>{this.props.item.val}</h2></span>
       }
       else {
            item= <Link to={this.props.item.link}><span><h2>{this.props.item.val}</h2></span></Link>
       }

        //let dropList=[]
        //if (this.state.showDrop){
            //dropList=<MenuDropdown items={this.props.item.items} />
        //}

        //use this.props.active(int) to highlight current
        return(
            //<div onMouseLeave={this.drop} onMouseOver={(e)=>this.drop(e,true)} className="menu-item link" style={this.style}>
			<div className="item">
                {/*{dropList*/}
                {item}
            </div>
        )
    }
}

export default MenuItem
