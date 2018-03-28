import React from 'react';
import { Link, hashHistory } from 'react-router';
import './CreateModal.css';
import OutsideAlerter from './OutsideAlerter';

export default class CreateBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shared: false,
            name: ''
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
        var privacy = 'y';
        if (this.state.shared) {
            privacy = 'n';
        }
        fetch('https://api.webwizards.me/v1/projects', {
            method: 'POST',
            headers: {
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
                    console.log(response.json());

                    //hashHistory.push('/main'); //redirect to whatever new path it is
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
                                <input type="checkbox" id="share-checkbox" className="css-checkbox" name="share-proj" value="share" onClick={this.handleCheck}/>
                                <label for="share-checkbox" className="css-label">Share with others</label>
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