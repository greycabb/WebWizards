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
            toggle: false
        }
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
                        {!this.state.mobileView &&
                            <area shape="rect" coords="25,75,263,167"  onClick={this.toggle} alt="Sun" />
                        }
                        {this.state.mobileView &&
                            <area className="no-click-allowed" shape="rect" coords="25,75,263,167" title="Sorry, the project editor only works on a computer." alt="Sun" />
                        }
                    </map>
                </div>
                <div className="img-card disable-select">
                    <img src={img2} alt="Wizard lizard" height="250px" className="banner-img"/>  
                </div>
                {this.state.toggle &&
                    <CreateModal toggle={this.toggle}/>
                }
            </div>
        );
    }
}