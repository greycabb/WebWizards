import React from 'react';
import { Link, hashHistory } from 'react-router';

export default class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.updateParent = this.props.updateParent;
        this.signOut = this.signOut.bind(this);
    }

    signOut() {

    }

    render() {

        return (
            <nav className="navbar navbar-default header">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <h1 className="navbar-title">Web Wizards</h1>
                    </div>
                    <div className="form-group pull-right">
                        <button className="btn orange-button">{this.props.username}</button>
                        <button className="btn green-button"><Link to="/login">Logout</Link></button>
                    </div>
                </div>
            </nav>
        );
    }
}