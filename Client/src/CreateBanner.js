import React from 'react';
//import { Link, hashHistory } from 'react-router';
import { hashHistory } from 'react-router';
import img from './img/create-banner.png';
import img2 from './img/tutorial-teaser.png';
import CreateModal from './CreateModal';
import './CreateBanner.css';

export default class CreateBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'toggle': false
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle(event) {
        this.setState(prevState => ({
          toggle: !prevState.toggle
        }));
    }

    render() {

        return (
            <div id="create-banner-div">
                <div className="img-card disable-select">
                    <img src={img} alt="Click to create a project!" height="250px"  className="banner-img" useMap="#createmap"/>
                    <map name="createmap">
                        {!this.props.mobileView &&
                            <area shape="rect" coords="25,75,263,167"  onClick={this.toggle} alt="Sun" />
                        }
                        {this.props.mobileView &&
                            <area className="no-click-allowed" shape="rect" coords="25,75,263,167" title="Sorry, the project editor only works on a computer." alt="Sun" />
                        }
                    </map>
                </div>
                <div className="img-card disable-select">
                    <iframe width="445" height="250" src="https://www.youtube.com/embed/AQ9TEJBOlbc?rel=0" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe> 
                </div>
                {this.state.toggle &&
                    <CreateModal toggle={this.toggle}/>
                }
            </div>
        );
    }
}