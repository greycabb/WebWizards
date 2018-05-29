import React from 'react';
import { Link, hashHistory } from 'react-router';

export default class SignupPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'username': undefined,
            'password': undefined,
            'passwordMatch': undefined,
            'error': undefined,
        };

        //function binding
        this.handleChange = this.handleChange.bind(this);

        localStorage.clear();
    }

    componentDidMount() {
        document.title = 'Sign Up - Web Wizards';
    }

    //update state for specific field
    handleChange(event) {
        var field = event.target.name;
        var value = event.target.value;

        var changes = {}; //object to hold changes
        changes[field] = value; //change this field
        this.setState(changes); //update state
    }


    //signUp button
    signUp(event) {
        event.preventDefault(); //don't submit
        var email = null; // Change this!

        var that = this;
        that.setState({
            error: ''
        });

        fetch('https://api.webwizards.me/v1/users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'email': email,
                'password': this.state.password,
                'passwordConf': this.state.password,
                'userName': this.state.username,
                'firstName': '',
                'lastName': ''
            })
        })
            .then(function (response) {

                if (response.ok) {
                    console.log('Success');

                    response.json().then(function (result) {
                        console.log(result);

                        let userdata = JSON.stringify({
                            'userName': result.userName,
                            'firstName': result.firstName,
                            'lastName': result.lastName,
                            'id': result.id,
                            'email': result.email,
                            'points': result.points,
                            'avatar': result.avatar
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
                        // switch(text) {
                        //     case 'email already in use':

                        //         break;
                        //     case 'password must be at least 6 characters':

                        //         break;
                        //     case 'passwords do not match':

                        //         break;
                        //     case 'username already in use':

                        //         break;
                        // }
                        that.setState({
                            error: text
                        });
                        //alert(that.state.error);
                        // change this
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
     * {required: true, minLength: 3, username: true}
     * (for required field, with min length of 3, and valid username)
     */
    validate(value, validations) {
        var errors = { isValid: true, style: '' };

        if (value !== undefined) { //check validations
            //required
            if (validations.required && value === '') {
                errors.required = true;
                errors.isValid = false;
            }

            //minLength
            if (validations.minLength && value.length < validations.minLength) {
                errors.minLength = validations.minLength;
                errors.isValid = false;
            }

            //samePassword
            if (validations.match && value !== this.state.password) {
                errors.match = true;
                errors.isValid = false;
            }

            //username type ??
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
        var passwordErrors = this.validate(this.state.password, { required: true, minLength: 6 });
        var passwordMatch = this.validate(this.state.passwordMatch, { required: true, match: true });

        //button validation
        var signUpEnabled = (usernameErrors.isValid && passwordErrors.isValid && passwordMatch.isValid);


        return (
            <div className="signup-page">
                <div className="welcomebox signupbox">
                    <h1>Sign Up</h1>
                    <form>
                        <ValidatedInput field="username" maxLength="15" type="username" label="Username" changeCallback={this.handleChange} errors={usernameErrors} />

                        <ValidatedInput field="password" maxLength="30" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

                        <ValidatedInput field="passwordMatch" maxLength="30" type="password" label="Re-enter Password" changeCallback={this.handleChange} errors={passwordMatch} />


                        <div className="terms-and-conditions">
                            <br />
                            By signing up, you agree to the <a href={"#/terms-and-conditions"} className="terms-and-conditions-link" target="_blank">Terms and Conditions</a>.
                            <br />
                            <br />
                        </div>

                        <div className="form-group">
                            <button className="btn green-button" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign Up</button>
                        </div>
                        <div id="postError" className="help-block error">{this.state.error}</div>
                    </form>
                </div>
            </div>
        );
    }
}

// SignupPage.propTypes = {
//     signUpCallback: PropTypes.func.isRequired,
// };

class ValidatedInput extends React.Component {
    render() {
        return (
            <div className={"form-group " + this.props.errors.style}>
                <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
                <input id={this.props.field} type={this.props.type} maxLength={this.props.maxlength} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
                <ValidationErrors errors={this.props.errors} />
            </div>
        );
    }
}

//a component to represent and display validation errors
class ValidationErrors extends React.Component {
    render() {
        return (
            <div>
                {this.props.errors.required &&
                    <p className="help-block">Required!</p>
                }
                {this.props.errors.username &&
                    <p className="help-block">Username can only contain Letters, Numbers, and Spaces</p>
                }
                {this.props.errors.minLength &&
                    <p className="help-block">Must be at least {this.props.errors.minLength} {/* space */}characters.</p>
                }
                {this.props.errors.match &&
                    <p className="help-block">Passwords need to be the same</p>
                }
            </div>
        );
    }
}