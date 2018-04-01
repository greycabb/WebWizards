import React from 'react';
import { Link, hashHistory } from 'react-router';
import './ComponentTesting.css';
import ColorPickerInput from './ColorPickerInput';
import ImageLibrary from './ImageLibrary';
import PreviewProject from './PreviewProject/PreviewProject';

export default class ComponentTesting extends React.Component {
    constructor(props) {
        super(props);
        localStorage.setItem("Authorization", "Bearer 9Wxg-nt7_YBGssegRZkuUS3mx1udDC-AJs2XzncSuUjajVEurg7arAl1IDxkdQGTYaJotjz7OsAaXKohaP6hwQ==");
        this.state = {
            edited: "2018-03-31T18:18:09.427Z"
        }
        this.updateTime = this.updateTime.bind(this);
    }

    colorHandler(color) {
        console.log("picked " + color);
    }

    updateTime() {
        this.setState({
            edited: Date.now()
        });
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
                <PreviewProject projectObject={ {
                        "id": "5aab3e5478dd4f000140e2a4",
                        "userid": "5a9472765865db00019d0a70",
                        "name": "A new project name",
                        "content":[
                            "5aab3eb478dd4f000140e2a5"
                        ],
                        "created": "2018-03-31T18:18:09.427Z",
                        "edited": this.state.edited,
                        "private": "n"
                    }} />
                <button onClick={this.updateTime}>Update Time</button>
            </div>
        );
    }
}