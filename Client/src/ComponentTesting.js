import React from 'react';
import { Link, hashHistory } from 'react-router';
import './ComponentTesting.css';
import ColorPickerInput from './ColorPickerInput';
import ImageLibrary from './ImageLibrary';
import PreviewProject from './PreviewProject/PreviewProject';

export default class ComponentTesting extends React.Component {
    constructor(props) {
        super(props);
    }

    colorHandler(color) {
        console.log("picked " + color);
    }

    render() {

        return (
            <div id="testing-div">
                <h1>Color Picker</h1>
                Hello <ColorPickerInput handle={this.colorHandler} default={'#FFFFFF'}/>
                <br />
                <ColorPickerInput handle={this.colorHandler} default={'#bd10e0'}/>
                <h1>Image Library</h1>
                <ImageLibrary />
                <h1>Screenshots</h1>
                <PreviewProject />
            </div>
        );
    }
}