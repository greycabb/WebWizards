import React from 'react';
import html2canvas from 'html2canvas';
import './PreviewProject.css';

export default class PreviewProject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            testObject: <div style={{backgroundColor: 'pink'}}>Hello</div>
            
        }
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        html2canvas(this.refs.container, {width: 540, height: 360}).then((canvas) => {
            console.log(canvas);
            var data = canvas.toDataURL('image/jpeg', 0.9);
            var src = encodeURI(data);
            this.refs.screenshot.src = src;
        });
    }

    render() {

        return (
            <div id="preview-container" ref="container">
                {this.state.testObject}
             <img src="" ref="screenshot" />
            </div>
        );
    }
}