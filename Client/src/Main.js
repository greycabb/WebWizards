import React from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined, 
            'username': undefined,
        };

        let auth = localStorage.getItem('Authorization');

        if (!auth) {
            let Router = require('react-router');
            Router.browserHistory.push('/login');
        }
        let ud = localStorage.getItem('USERDATA');
        console.log(ud);
        if (ud) {
            if (ud.username !== undefined) {
            this.state.username = ud.username;
            }
        }
    }

    render() {

        console.log(localStorage.getItem('Authorization'));

        return (
            <div className="bluebox">
                Welcome, {this.state.username}
            </div>
        );
    }
}