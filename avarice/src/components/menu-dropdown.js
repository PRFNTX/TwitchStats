import React, { Component } from "react"
import { Link } from "react-router-dom"

class MenuDropdown extends Component{
    render(){
        //this.props.items={
        //     val:String
        //     link:String
        // }
        let items=this.props.items.map(val=>{
            return <Link to="val.link"><h3><span>{val.val}</span></h3></Link>
        })
        return(
            <div className="menu-dropdown">
                {items}
            </div>
        )
    }
}

export default MenuDropdown
