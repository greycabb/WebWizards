import React from 'react';
import { Link, hashHistory } from 'react-router';
import './CreateModal.css';

export default class CreateBanner extends React.Component {
    constructor(props) {
        super(props);
    }

    create() {

    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <div id="modal-popup">
                        <h2>Create Project</h2>
                        <div>
                            <label htmlFor="title">Project Title </label>
                            <input id="proj-title" type="name" maxLength="15" name="proj-title" />
                        </div>
                        <div>
                            <input type="checkbox" id="share-box" name="share-proj" value="share"/>
                            <label>Share with others</label>
                        </div>
                        <center>
                            <button className="btn orange-button" onClick={(e) => this.props.toggle(e)}>Cancel</button>
                            <button className="btn green-button" onClick={(e) => this.create()}>Create</button>
                        </center>
                    </div>
                </div>
                
            </div>
        );
    }
}