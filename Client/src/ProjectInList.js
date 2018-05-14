import React from 'react';
import { hashHistory } from 'react-router';
import './ProjectInList.css';

export default class ProjectInList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hovered: false,
            deleteWarningOn: false
        }

        this.toggleOver = this.toggleOver.bind(this);
        this.toggleOut = this.toggleOut.bind(this);
        this.deleteProjectWarning = this.deleteProjectWarning.bind(this);
    }

    toggleOver() {
        this.setState({
            hovered: true
        })
    }

    toggleOut() {
        this.setState({
            hovered: false,
            deleteWarningOn: false
        })
    }

    deleteProjectWarning() {
        this.setState({
            deleteWarningOn: !this.state.deleteWarningOn
        });
    }

    render() {

        return (
            <span>
            {!this.props.mobileView &&
                <div className="project-in-list" >
                    <div className="project-square" onMouseEnter={this.toggleOver} onMouseLeave={this.toggleOut}>
                        {!this.state.hovered &&
                            <img src={this.props.img} width="180px" />
                        }

                        {this.state.hovered && !this.state.deleteWarningOn &&
                            <div className="hover-div">
                                <button className="btn green-button larger-btn" onClick={this.props.redirectEdit}>Edit</button>
                                <button className="btn red-button larger-btn" onClick={this.deleteProjectWarning}>Delete</button>
                            </div>
                        }

                        {this.state.hovered && this.state.deleteWarningOn &&
                            <div className="hover-div">
                                Are you sure?
                                <div>
                                    <button className="btn green-button smaller-btn" onClick={this.deleteProjectWarning}>Cancel</button>
                                    <button className="btn red-button smaller-btn" onClick={this.props.deleteProject}>Delete</button>
                                </div>
                            </div>
                        }
                    
                    </div>
                    {this.props.name !== '' &&
                        <div className="project-title">{this.props.name}</div>
                    }
                    {this.props.name === '' &&
                        <div className="project-title"><i>untitled</i></div>
                    }
                </div>
            }
            {/* On mobile, load the website, instead of the editor*/}
            {this.props.mobileView &&
                <div className="project-in-list" key={this.props.id} onClick={() => { hashHistory.push('/project/' + this.props.id); } } >
                    <div className="project-square">
                    
                        <img src={this.props.img} width="180px" />
                    
                    </div>
                    {this.props.name !== '' &&
                        <div className="project-title">{this.props.name}</div>
                    }
                    {this.props.name === '' &&
                        <div className="project-title"><i>untitled</i></div>
                    }
                </div>
            }
        </span>
        );
    }
}