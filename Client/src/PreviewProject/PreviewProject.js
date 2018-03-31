import React from 'react';
import html2canvas from 'html2canvas';
import './PreviewProject.css';

export default class PreviewProject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            testObject: <div style={{backgroundColor: 'red'}}>Hello</div>
            
        }
        this.uploadScreenshot = this.uploadScreenshot.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.projectObject != this.props.projectObject) {
            this.uploadScreenshot();
        }
    }

    blockToHtml() {

    }

    uploadScreenshot() {
        var that = this;
        html2canvas(this.refs.container, {width: 540, height: 360}).then((canvas) => {
            var data = canvas.toDataURL('image/jpeg', 0.9);
            var src = encodeURI(data);
            this.refs.screenshot.src = src;
            var auth = localStorage.getItem('Authorization');
            fetch('https://api.webwizards.me/v1/projects?id=' + this.props.projectObject.id, {
            method: 'PATCH',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': "new name",
                'img': src
            })
        })
            .then(function (response) {

                if (response.ok) {
                   console.log("screenshot saved");
                } else {
                    console.log(response.text());
                }
            })
            .catch(err => {
                console.log('caught it!', err);
            });
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