import React, { Component } from "react"
import { Link } from "react-router-dom"
import MenuDropdown from "./menu-dropdown"

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
    drop=(e)=>{
        if (this.props.item.drop){
            let boo = this.state.showDrop
            console.log("drop the menu")
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
       if (this.props.item.drop){
        //    item= <MenuDropdown items={this.props.item.items} />
            item= <span ><h2>{this.props.item.val}</h2></span>
       }
       else {
            item= <Link to={this.props.item.link}><span><h2>{this.props.item.val}</h2></span></Link>
       }

        let dropList=[]
        if (this.state.showDrop){
            dropList=<MenuDropdown items={this.props.item.items} />
        }
        //use this.props.active(int) to highlight current
        return(
            <div onMouseLeave={this.drop} onMouseEnter={this.drop} className="menu-item" style={this.style}>
                {item}
                {dropList}
            </div>
        )
    }
}

export default MenuItem
