import React from 'react';
import { Link, hashHistory } from 'react-router';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'username': undefined,
            'password': undefined,
            'error': undefined
        };

        //function binding
        this.handleChange = this.handleChange.bind(this);

        localStorage.clear();
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
                    let auth = response.headers.get('Authorization');
                    let userdata = JSON.stringify({
                        'username': that.state.username
                    });

                    // Local storage Data setting
                    localStorage.setItem('Authorization', auth);
                    localStorage.setItem('USERDATA', userdata);
                    //
                    hashHistory.push('/main');
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
            <div className="login-page">
                <div className="bluebox">
                    <h1>Web Wizards</h1>
                    <form>
                        <div>
                            <ValidatedInput field="username" type="username" maxLength="15" label="Username" tabIndex={1} changeCallback={this.handleChange} errors={usernameErrors} />
                        </div>
                        <div>
                            <ValidatedInput field="password" type="password" maxLength="30" label="Password" tabIndex={2} changeCallback={this.handleChange} errors={passwordErrors} />
                        </div>

                        <div className="form-group">
                            <button className="btn green-button" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Login</button>
                        </div>
                        <div id="postError" className="help-block error">{this.state.error}</div>

                    </form>
                    <div className="black-link"><Link to="/signup">Don't have an account? Sign up!</Link></div>
                    {/* <div className="black-link">Forgot Username or Password</div> */}
                </div>
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