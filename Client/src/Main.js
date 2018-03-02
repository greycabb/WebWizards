import React from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined
        };

        if (!localStorage.getItem('Authorization')) {
            let Router = require('react-router');
            Router.browserHistory.push('/login');
        } else {
            //_________________________
            // Check to make sure account is valid
            fetch('https://api.webwizards.me/v1/sessions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                //'Access-Control-Expose-Headers': 'Authorization'
            },
            body: JSON.stringify({
                'password': this.state.password,
                'username': this.state.username,
            })
        })
        .then(function(response) {
            
            if (response.ok) {
                console.log('Success');
                let auth = response.headers.get('Authorization');
                localStorage.setItem('Authorization', auth);
                let Router = require('react-router');
                Router.browserHistory.push('/main');
            } else {
                response.text().then(text => {
                    that.setState({
                        error: text
                    });
                });
                
            }
        })
        .catch(err => {
            console.log('caught it!',err);
        })


            //_________________________
        }
    }

    render() {

        console.log(localStorage.getItem('Authorization'));

        return (
            <div className="bluebox">
                Welcome!
            </div>
        );
    }
}