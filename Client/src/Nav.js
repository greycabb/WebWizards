import React from 'react';
import { Link } from 'react-router';

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
                        <h1 className="title navbar-title disable-select">Web Wizards</h1>
                    </div>
                    <div className="form-group pull-right navbar-welcome">
                        {!this.props.login &&
                            <div>
                                Welcome, {this.props.username}!
                                <Link to="/login"><button className="btn orange-button">Logout</button></Link>
                            </div>
                        }
                        {this.props.login &&
                            <div>
                                <button className="btn yellow-button" onClick={this.props.handleLogin}>Login</button>
                                <button className="btn green-button" onClick={this.props.handleSignup}>Sign Up</button>
                            </div>
                        }
                    </div>
                </div>
            </nav>
        );
    }
}