import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

export default class SignupPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'username': undefined,
            'password': undefined,
            'passwordMatch': undefined
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


    //signUp button
    signUp(event) {
        event.preventDefault(); //don't submit
        this.props.signUpCallback(
            this.state.username,
            this.state.password
        );
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
        var passwordErrors = this.validate(this.state.password, { required: true, minLength: 3 });
        var passwordMatch = this.validate(this.state.passwordMatch, { required: true, match: true });

        //button validation
        var signUpEnabled = (usernameErrors.isValid && passwordErrors.isValid && passwordMatch.isValid);

        return (
            <div className="bluebox">
                <h1>Sign Up</h1>
                <form>
                    <ValidatedInput field="username" maxlength="15" type="username" label="Username" changeCallback={this.handleChange} errors={usernameErrors} />

                    <ValidatedInput field="password" maxlength="30" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

                    <ValidatedInput field="passwordMatch" maxlength="30" type="password" label="Re-enter Password" changeCallback={this.handleChange} errors={passwordMatch} />


                    <div className="form-group">
                        <button className="btn green-button" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
                    </div>
                </form>
                <div className="black-link"><Link to="/login">Already have an account? Log in!</Link></div>
            </div>
        );
    }
}

SignupPage.propTypes = {
    signUpCallback: PropTypes.func.isRequired,
};

class ValidatedInput extends React.Component {
    render() {
        return (
            <div className={"form-group " + this.props.errors.style}>
                <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
                <input id={this.props.field} type={this.props.type} maxlength={this.props.maxlength}name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
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
                    <p className="help-block">Password does not match!</p>
                }
            </div>
        );
    }
}