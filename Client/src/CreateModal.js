import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import OutsideAlerter from './OutsideAlerter';

export default class CreateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shared: false,
            name: '',
            error: false
        }
        this.handleName = this.handleName.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.create = this.create.bind(this);
    }

    handleName(e) {
        this.setState({
            name: e.target.value
        });
    }

    handleCheck() {
        this.setState({
            shared: !this.state.shared
        });
    }

    create() {
        let privacy = 'y';
        if (this.state.shared) {
            privacy = 'n';
        }

        if (this.state.name.trim() === '') {
            this.setState({
                error: 'Please enter a name for your project'
            });
            return;
        } else {
            this.setState({
                error: false
            });
        }

        fetch('https://api.webwizards.me/v1/projects', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'name': this.state.name,
                'private': privacy
            })
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        console.log(result);
                        hashHistory.push('/edit?project=' + result.id); //redirect to whatever new path it is with query parameter
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup">
                            <h2>Create Project</h2>
                            <div>
                                <label htmlFor="title">Project Title </label>
                                <input id="proj-title" type="name" maxLength="15" name="proj-title" onChange={(e) =>this.handleName(e)}/>
                            </div>
                            <div className="share-box">
                                <input checked={this.state.shared} type="checkbox" id="share-checkbox" className="css-checkbox" name="share-proj" value="share" onClick={this.handleCheck}/>
                                <label htmlFor="share-checkbox" className="css-label">Share with others</label>
                                {this.state.shared === true &&
                                    <div className="yel">
                                        NOTE: Your project will be viewable by others, so make sure that you don't write any personal information on your website!
                                    </div>
                                }
                            </div>
                            <center>
                                <button className="btn yellow-button" onClick={(e) => this.props.toggle(e)}>Cancel</button>
                                <button className="btn green-button" onClick={this.create}>Create</button>
                            </center>
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}