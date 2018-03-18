import React from 'react';
import { Link, hashHistory } from 'react-router';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined, 
            'username': undefined,
        };

        let auth = localStorage.getItem('Authorization');

        if (!auth) {
            hashHistory.push('/login');
        }
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        if (ud) {
            if (ud.username !== undefined) {
                this.state.username = ud.username;
            }
        }
    }

    render() {
        return (
            <div className="bluebox">
                <div>Welcome, {this.state.username}!</div>
                <br />
                <div className="black-link"><Link to="/login">Logout</Link></div>
            </div>

        );
    }
}