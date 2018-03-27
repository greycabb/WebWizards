import React from 'react';
import { Link, hashHistory } from 'react-router';
import './ImageLibrary.css';

export default class ImageLibrary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: ["Animals"]
        }
    }

    componentWillMount() {
        fetch('https://api.webwizards.me/v1/images')
            .then(function (response) {
                if (response.ok) {
                    console.log(response.json());
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

        var buttons = [];
        for (var i = 0; i < this.state.categories.length; i++) {
            buttons.push(<ImageLibraryButton />);
        }

        return (
            <div id="image-library-container">
                {buttons}
            </div>
        );
    }
}

class ImageLibraryButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                Test
            </div>
        );
    }
}