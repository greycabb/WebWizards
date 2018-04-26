import React from 'react';
import { hashHistory } from 'react-router';
import AvatarModal from './AvatarModal';

export default class AvatarDisplay extends React.Component {
    constructor(props) {

        console.log(localStorage.getItem("USERDATA"));
        super(props);
        this.state = {
            toggle: false,
            isHovered: false,
            currImage: JSON.parse(localStorage.getItem("USERDATA")).avatar
        }
        this.toggle = this.toggle.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.handleNewImage = this.handleNewImage.bind(this);
    }

    toggle(event) {
        this.setState(prevState => ({
          toggle: !prevState.toggle
        }));
    }

    handleHover(bool){
        this.setState({
            isHovered: bool
        });
    }

    handleNewImage(img){
        this.setState({
            currImage: img
        });
    }

    render() {

        var image = "url('" + this.state.currImage + "')";

        return (
            <div>
                <div className="profile-picture" 
                    style={{backgroundImage: image}} 
                    onMouseEnter={()=> {this.handleHover(true)}}  
                    onMouseLeave={()=> {this.handleHover(false)}}
                    onClick={this.toggle}>
                {this.state.isHovered &&
                    <div className="profile-picture-hover">
                        Change Avatar
                    </div>
                }              
                </div>
                {this.state.toggle &&
                <AvatarModal toggle={this.toggle} newImage={this.handleNewImage}/>
                }
            </div>
        );
    }
}