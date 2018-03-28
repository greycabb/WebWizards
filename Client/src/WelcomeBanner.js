import React from 'react';
import { hashHistory } from 'react-router';
import img from './img/splashww.png';
import img2 from './img/welcome-img.png';
import './WelcomeBanner.css';

export default class WelcomeBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false
        }
    }

    render() {

        return (
            <div id="welcome-banner-div">
                <div className="welcome-card disable-select">
                    <h2 className="welcome-h2">Create fun and magical websites for you and other wizards</h2>
                    <img src={img2} width="470px"/>  <br/>
                    <h3>A fun and enchanted way to learn web development</h3>
                </div>
                <div className="img-card welcome-img-card disable-select">
                    <img src={img} height="300px" className="banner-img"/>  
                </div>
            </div>
        );
    }
}