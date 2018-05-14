import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import OutsideAlerter from './OutsideAlerter';
import './SettingsModal.css';

export default class SettingsModal extends React.Component {
    constructor(props) {
        super(props);

        var shared; 

        if (this.props.private == 'n') {
            shared = true;
        }
        else {
            shared = false;
        }

        this.state = {
            sharedNewChecked: false, // check to see if the user JUST checked the share button
            shared: shared,
            name: this.props.name,
            error: false
        }
        this.handleName = this.handleName.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.update = this.update.bind(this);
    }

    handleName(e) {
        this.setState({
            name: e.target.value
        });
    }

    handleCheck() {

        var showWarning = false;

        if (this.state.shared == false) {
            showWarning = true;
        }

        this.setState({
            sharedNewChecked: showWarning,
            shared: !this.state.shared
        });
    }


    update() {
        var that = this;

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

        fetch('https://api.webwizards.me/v1/projects?id=' + this.props.id, {
            method: 'PATCH',
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
                        that.props.handle(result);
                        that.props.toggle();
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
                    <OutsideAlerter handler={(e) => this.update()}>
                        <div id="modal-popup" className="settings-modal">
                            <h2>Update Project</h2>
                            <div>
                                <label htmlFor="title">Project Title </label>
                                <input id="proj-title" placeholder={this.props.name} type="name" maxLength="15" name="proj-title" onChange={(e) =>this.handleName(e)}/>
                            </div>
                            <div className="share-box">
                                <input type="checkbox" id="share-checkbox" checked={this.state.shared} className="css-checkbox" name="share-proj" value="share" onClick={this.handleCheck}/>
                                <label htmlFor="share-checkbox" className="css-label">Share with others</label>
                                {this.state.sharedNewChecked === true &&
                                    <div className="settings-warning">
                                        NOTE: Before making your website available to others, make sure that you don't have any personal information written anywhere on your website!
                                    </div>
                                }
                            </div>
                            <div className="center-div">
                                <button className="btn yellow-button confirm-button" onClick={this.update}>Confirm</button>
                            </div>
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}