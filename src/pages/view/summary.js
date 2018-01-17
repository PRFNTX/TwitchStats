import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Summary extends Component{
    render(){
        console.log(this.props.summary)
        return(
            <div>
                <h4>Summary for Session: {this.props.summary.sessionId}</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>Unique Views</td>
                            <td>{this.props.summary.uniqueViews}</td>
                        </tr>
                        <tr>
                            <td>Viewer Retention (average minutes watched)</td>
                            <td>{this.props.summary.viewerRetention}</td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={this.props.summarize(this.props.summary.sessionId)}> Recalculate </button>
            </div>
        )
    }
}

Summary.propTypes={
    summary: PropTypes.object.isRequired,
    summarize: PropTypes.func
}

export default Summary
