import React from 'react';
import { hashHistory } from 'react-router';
import './AvatarModal.css';
import OutsideAlerter from './OutsideAlerter';
import './CreateModal.css';

const basicAvatarUrls = [
    "https://webwizards.me/img/Avatars/Bunny.png",
    "https://webwizards.me/img/Avatars/Cat.png",
    "https://webwizards.me/img/Avatars/Cow.png",
    "https://webwizards.me/img/Avatars/Duck.png",
    "https://webwizards.me/img/Avatars/Lizard.png"
];

const specialAvatarUrls = {
    "apprentice": "https://webwizards.me/img/Avatars/Apprentice.png"
};

export default class AvatarModal extends React.Component {
    constructor(props) {
        super(props);

        var availableImgs = [];

        for (let i = 0; i < basicAvatarUrls.length; i++) {
            availableImgs.push(<img src={basicAvatarUrls[i]} key={[i]} width="100px" onClick={() => this.handleImgChange(basicAvatarUrls[i])} className="avatar-img-preview"/>);
        }

        var ud = JSON.parse(localStorage.getItem('USERDATA'));

        if (ud.points > 49) {
            availableImgs.push(<img src={specialAvatarUrls.apprentice} key={"apprentice"} width="100px" onClick={() => this.handleImgChange(specialAvatarUrls.apprentice)} className="avatar-img-preview"/>);
        }

        this.state = {
            imgs: availableImgs
        }
        this.handleImgChange = this.handleImgChange.bind(this);
    }

    handleImgChange(url) {

        var that = this;

        console.log(url);

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'avatar': url,
                'points': -1
            })
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        console.log(result);
                        var ud = JSON.parse(localStorage.getItem('USERDATA'));
                        ud.avatar = url;
                        localStorage.setItem('USERDATA', JSON.stringify(ud));
                        that.props.newImage(url);
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup" className="avatar-modal">
                            {this.state.imgs}
                            <p>
                                Unlock more avatars by levelling up!
                            </p>
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}