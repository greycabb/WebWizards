import React from 'react';
import './ImageLibrary.css';

export default class ImageLibrary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            object: {},
            categories: []
        }
        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
        fetch('https://api.webwizards.me/v1/images').then((response) => {
            if(response.ok) {
                return response.json();
            } 
        }).then((object) => {
            this.setState({
                object: object
            })
        })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    render() {

        var buttons = [];
        var categories = Object.keys(this.state.object);
        for (var i = 0; i < categories.length; i++) {
            var current = categories[i];
            buttons.push(<ImageLibraryButton key={current} category={current} images={this.state.object[current]}/>);
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
            <button className="btn yellow-button">
                {this.props.category}
            </button>
        );
    }
}