import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'username': undefined,
            'password': undefined
        };

        //function binding
        this.handleChange = this.handleChange.bind(this);
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
            <div className="bluebox">
                <h1>Web Wizards</h1>
                <form>
                    <div>
                        <ValidatedInput field="username" type="username"  maxlength="15" label="Username" tabIndex={1} changeCallback={this.handleChange} errors={usernameErrors} />
                    </div>
                    <div>
                        <ValidatedInput field="password" type="password"   maxlength="30" label="Password" tabIndex={2} changeCallback={this.handleChange} errors={passwordErrors} />
                    </div>

                    <div className="form-group">
                        <button className="btn green-button" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Login</button>
                    </div>

                </form>
                <div className="black-link"><Link to="/signup">Don't have an account? Sign up!</Link></div>
                {/* <div className="black-link">Forgot Username or Password</div> */}
            </div>
        );
    }
}

// LoginPage.propTypes = {
//     signInCallback: PropTypes.func.isRequired
// };

class ValidatedInput extends React.Component {
    render() {
        return (
            <div className="black-link">
                <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
                <input id={this.props.field} type={this.props.type} maxlength={this.props.maxlength} tabIndex={this.props.tabIndex} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
            </div>
        );
    }
}