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
                <ColorPickerInput handle={this.colorHandler}/>
            </div>
        );
    }
}