import React from 'react';
import { Link, hashHistory } from 'react-router';
import img from './img/create-banner.png';
import img2 from './img/tutorial-teaser.png';

export default class CreateBanner extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div id="create-banner-div">
                <img src={img} height="250px"  className="banner-img" usemap="#createmap"/>
                <map name="createmap">
                    <area shape="rect" coords="25,75,263,167" href="#" alt="Sun" />
                </map>
                <img src={img2} height="250px" className="banner-img"/>  
            </div>
        );
    }
}