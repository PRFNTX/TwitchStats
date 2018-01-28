import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Summary extends Component{
    render(){
        console.log(this.props.summary)
        let items = Object.keys(this.props.summary).map(val=>{
            return(
                <tr>
                    <td>{val}</td>
                    <td>{JSON.stringify(this.props.summary[val])}</td>
                </tr>
            )
        })
        return(
            <div>
                <h4>Summary for Session: {this.props.summary.sessionId}</h4>
                <table>
                    <tbody>
                        {items}
                    </tbody>
                </table>
                <button onClick={()=>this.props.summarize(this.props.summary.sessionId)}> Recalculate </button>
            </div>
        )
    }
}

Summary.propTypes={
    summary: PropTypes.object.isRequired,
    summarize: PropTypes.func
}

export default Summary
