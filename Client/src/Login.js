import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';
import Signup from './Signup';
import OutsideAlerter from './OutsideAlerter';
import WelcomeBanner from './WelcomeBanner';
import FeaturedProjects from './FeaturedProjects';
import img from './img/ProfilePictures/Cow.png';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        var mobileView = false;

        if (window.innerWidth < 801) {
            console.log(window.innerWidth);
            mobileView = true;
        }

        this.state = {
            'username': undefined,
            'password': undefined,
            'error': undefined,
            'mobileView': mobileView
        };

        localStorage.clear();

        let auth = localStorage.getItem('Authorization');

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            }
        })
            .then(function (response) {

                if (response.ok) {
                    hashHistory.push('/main');
                } else {
                    response.text().then(text => {
                       console.log("signed out: " + text)
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })

        //function binding
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignup = this.handleSignup.bind(this);
    }

    componentDidMount() {
        document.title = 'Login - Web Wizards';
    }

    //update state for specific field
    handleChange(event) {
        var field = event.target.name;
        var value = event.target.value;

        var changes = {}; //object to hold changes
        changes[field] = value; //change this field
        this.setState(changes); //update state
    }

    handleLogin() {
        this.setState({
            loginClicked: !this.state.loginClicked
        });
    }

    handleSignup() {
        this.setState({
            signupClicked: !this.state.signupClicked
        });
    }

    //handle signIn button
    signIn(event) {
        event.preventDefault(); //don't submit

        var that = this;

        that.setState({
            error: ''
        });

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
            .then(function (response) {

                if (response.ok) {
                    console.log('Success');

                    response.json().then(function (result) {
                        console.log(result);

                        let userdata = JSON.stringify({
                            'username': result.userName,
                            'firstName': result.firstName,
                            'lastName': result.lastName,
                            'id': result.id,
                            'email': result.email
                        });

                        let auth = response.headers.get('Authorization');
                    

                        // Local storage Data setting
                        localStorage.setItem('Authorization', auth);
                        localStorage.setItem('USERDATA', userdata);
                        //
                        hashHistory.push('/main');
                    });

                   
                } else {
                    response.text().then(text => {
                        that.setState({
                            error: text
                        });
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    /**
     * A helper function to validate a value based on a hash of validations
     * second parameter has format e.g.,
     * {required: true, minLength: 4, username: true}
     * (for required field, with min length of 4, and valid username)
     */
    validate(value, validations) {
        var errors = { isValid: true, style: '' };

        if (value !== undefined) { //check validations
            //handle required
            if (validations.required && value === '') {
                errors.required = true;
                errors.isValid = false;
            }

            //handle minLength
            if (validations.minLength && value.length < validations.minLength) {
                errors.minLength = validations.minLength;
                errors.isValid = false;
            }

            //handle username type
            if (validations.username) {
                //pattern comparison from w3c
                //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
                var valid = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/.test(value)
                if (!valid) {
                    errors.username = true;
                    errors.isValid = false;
                }
            }
        }

        //display details
        if (!errors.isValid) { //if found errors
            errors.style = 'has-error';
        }
        else if (value !== undefined) { //valid and has input
            //errors.style = 'has-success' //show success coloring
        }
        else { //valid and no input
            errors.isValid = false; //make false anyway
        }
        return errors; //return data object
    }

    render() {
        //field validation
        var usernameErrors = this.validate(this.state.username, { required: true, username: true });
        var passwordErrors = this.validate(this.state.password, { required: true, minLength: 3 });

        //button validation
        var signInEnabled = (usernameErrors.isValid && passwordErrors.isValid);

        return (
            <div>
                {!this.state.mobileView &&
                    <div className="login-page">
                        <Nav login={true} handleLogin={this.handleLogin} handleSignup={this.handleSignup}/>
                        {this.state.loginClicked &&
                            <OutsideAlerter handler={this.handleLogin}>
                            <div className="arrow_box welcomebox">
                                <form>
                                    <div>
                                        <ValidatedInput field="username" type="username" maxLength="15" label="Username" tabIndex={1} changeCallback={this.handleChange} errors={usernameErrors} />
                                    </div>
                                    <div>
                                        <ValidatedInput field="password" type="password" maxLength="30" label="Password" tabIndex={2} changeCallback={this.handleChange} errors={passwordErrors} />
                                    </div>
                                    <div className="form-group">
                                        <br />
                                        <button className="btn yellow-button" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Login</button>
                                    </div>
                                    <div id="postError" className="help-block error">{this.state.error}</div>

                                </form>
                                {/*<div className="box-link"><Link to="/signup">Don't have an account? Sign up!</Link></div>
                                <div className="black-link">Forgot Username or Password</div> */}
                        </div>
                        </ OutsideAlerter>
                    }
                    {this.state.signupClicked &&
                        <div className="modal-container">
                            <div className="modal-background">
                                <OutsideAlerter handler={this.handleSignup}>
                                    <Signup />
                                </ OutsideAlerter>
                            </div>
                        </div>
                    }
                    <WelcomeBanner />
                    <FeaturedProjects />
                </div>
                }
                {this.state.mobileView &&
                    <div id="mobile-view">
                        <img src={img} width="400px"/><br />
                        Oops! Web Wizards only works on a computer!
                    </div>
                }
            </div>
        );
    }
}

class ValidatedInput extends React.Component {
    render() {
        return (
            <div>
                <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
                <input id={this.props.field} type={this.props.type} maxLength={this.props.maxLength} tabIndex={this.props.tabIndex} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
            </div>
        );
    }
}