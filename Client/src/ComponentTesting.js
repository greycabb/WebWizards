import React from 'react';
import { Link, hashHistory } from 'react-router';
import './ComponentTesting.css';
import ColorPickerInput from './ColorPickerInput';

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
                Hello <ColorPickerInput handle={this.colorHandler}/><br />
                <ColorPickerInput default={'#000000'} handle={this.colorHandler}/>
                <h1>Image Library</h1>
            </div>
        );
    }
}