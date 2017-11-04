import React, { Component } from "react"
import Link from "react-router-dom"
import MenuItem from "./menu-item"

class Menu extends Component{
    render(){
        //items are singles (val, link, drop)
        //optional items component for dropdown
        let items = this.props.items.map(val=>{
            return <MenuItem item={val} />
        })
        return(
            <div className="menu">
                {items}
            </div>
        )
    }
}
 export default Menu