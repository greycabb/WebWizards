import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';

export default class TermsAndConditionsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentWillMount() {

    }

    componentDidMount() {
        document.title = 'Web Wizards - Terms and Conditions';
    }

    render() {

        return (
            <div>
                <Nav login={false} />
                <div className="terms-and-conditions-page">
                    <h1>Terms and Conditions</h1>
                    <p>Space is filled with so many unknowns and the possibility of being the first person to find something thats unknown is why I want to be an astronaut.</p>
                </div>
            </div>
        );
    }
}