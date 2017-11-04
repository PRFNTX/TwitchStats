import React, { Component } from "react"
import Link from "react-router-dom"
import MenuDropdown from "./menu-dropdown"

class MenuItem extends Component{
    constructor(){
        super()
        this.state={
            showDrop:false
        }
    }
    drop=()=>{
        let boo = this.state.showDrop
        this.setState({
            showDrop:!boo
        })
        
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
       if (this.props.item.drop){
        //    item= <MenuDropdown items={this.props.item.items} />
            item= <span onMouseLeave={this.drop} onClick={this.drop}><h2>{this.props.item.val}</h2></span>
       }

        let dropList=[]
        if (this.state.dropDown){
            dropList=<MenuDropdown items={this.props.item.items} />
        }
        //use this.props.active(int) to highlight current
        return(
            <div className="menu-item">
                {item}
                {dropList}
            </div>
        )
    }
}

export default MenuItem
