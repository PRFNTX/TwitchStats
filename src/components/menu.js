import React, { Component } from "react"
import { Link } from "react-router-dom"
import MenuItem from "./menu-item"

class Menu extends Component{
    render(){
        //items are singles (val, link, drop)
        //optional items component for dropdown
        let items = this.props.items.map((val,i)=>{
            return <MenuItem key={i} item={val} name={val.link ? val.link.split("/")[1] : ""} />
        })
        return(
            <div className="menu pointing ui">
                {items}
				<div className="right item"><Link to="/logout">Logout</Link></div>
            </div>
        )
    }
}
 export default Menu
