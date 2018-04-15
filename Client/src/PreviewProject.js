import React from 'react';
import html2canvas from 'html2canvas';
import './PreviewProject.css';

export default class PreviewProject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectObject: this.props.projectObject,
            object: ''
        }
        this.uploadScreenshot = this.uploadScreenshot.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.blockToHtml = this.blockToHtml.bind(this);
        this.blockToHtml(this.props.projectObject.content[0]).then((string) => {
            console.log(string);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.projectObject != this.props.projectObject) {
            this.uploadScreenshot();
        }
    }

    componentDidMount() {
        this.blockToHtml(this.props.projectObject.content[0]).then((string) => {
            this.setState({object: string[0]});
        });
    }

    blockToHtml(id) {
        return new Promise((resolve, reject) => {
            var auth = localStorage.getItem('Authorization');
            fetch('https://api.webwizards.me/v1/blocks?id=' + id, {
                method: 'GET',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {

                    if (response.ok) {
                        var json = response.json().then((json) => {
                            var type = json.blocktype;
                            var css = json.css;
                            var children = json.children;

                            // now get block type information

                            fetch('https://api.webwizards.me/v1/htmlblocks?id=' + type, {
                                method: 'GET',
                                headers: {
                                    'Authorization': auth,
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then((response) => {

                                    if (response.ok) {
                                        var json = response.json().then((blockJson) => {
                                            // what to do with block type information
                                            if (blockJson.type == "wrapper" || blockJson.type == "textwrapper") {
                                                // Will require recursive call for potential children elements
                                                var cssString = "";
                                                if (css != null && css.length > 0) {
                                                    cssString = ' style="';
                                                    for (var i = 0; i < css.length; i ++) {
                                                        cssString += (css[i].attribute + ": " + css[i].value + "; ");
                                                    }
                                                    cssString += '"';
                                                }
                                                var string = ""; // what is returned to the user when asked for code
                                                var displayedString = "" // what is really displayed
                                                if (blockJson.name == "html") {
                                                    displayedString += "<div style=\"width:100%; height: 100%; top: 0; left: 0; position: relative\">&nbsp;"
                                                } 
                                                if (blockJson.name == "body") {
                                                    displayedString += "<div" + cssString + ">&nbsp;";
                                                }
                                                if (blockJson.name != "head" && blockJson.name != "html" && blockJson.name != "body") {
                                                    displayedString += '<' + blockJson.name + cssString + '>';
                                                }
                                                string = '<' + blockJson.name + cssString + '>';
                                                if (children != null && children.length > 0) {
                                                    for (var i = 0; i < children.length; i ++) {
                                                        this.blockToHtml(children[i]).then((result) => {

                                                            displayedString += result[0]
                                                            string += result[1];

                                                            if (blockJson.name == "html" || blockJson.name == "body") {
                                                                displayedString += "</div>"
                                                            } 
                                                            if (blockJson.name != "head" && blockJson.name != "html" && blockJson.name != "body") {
                                                                displayedString += '<' + blockJson.name + cssString + '>';
                                                            }
                                                            string += '</' + blockJson.name + '>';

                                                            resolve([displayedString, string]);
                                                            //return string;
                                                        });
                                                    }
                                                }
                                                else {
                                                    string += '</' + blockJson.name + '>';
                                                    if (blockJson.name == "html" || blockJson.name == "body") {
                                                        displayedString += "</div>"
                                                    }
                                                    resolve([displayedString, string]);
                                                    //return string;
                                                }
                                            }
                                            else if (blockJson.type == "content") {
                                                resolve([children[0], children[0]]);
                                            }
                                            else {
                                                // Will not require recursive call
                                                var cssString = "";
                                                if (css != null && css.length > 0) {
                                                    cssString = ' style="';
                                                    for (var i = 0; i < css.length; i ++) {
                                                        cssString += (css[i].attribute + ": " + css[i].value + "; ");
                                                    }
                                                }
                                                var string = '<' + blockJson.name + cssString + '/>';
                                                resolve([displayedString, string]);
                                            }
                                        });
                                    } else {
                                        reject(response.text());
                                    }
                                })
                                .catch(err => {
                                    reject(err);
                                });

                                
                        });
                    } else {
                        console.log(response.text());
                    }
                })
                .catch(err => {
                    console.log('caught it!', err);
                });
        });
    }

    uploadScreenshot() {
        var that = this;
        html2canvas(this.refs.container, {width: 540, height: 360}).then((canvas) => {
            var data = canvas.toDataURL('image/jpeg', 0.9);
            var src = encodeURI(data);
            var auth = localStorage.getItem('Authorization');
            fetch('https://api.webwizards.me/v1/projects?id=' + this.props.projectObject.id, {
            method: 'PATCH',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'img': src
            })
        })
            .then((response) => {

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
            <div id="preview-container-container">
                <div id="preview-container" ref="container" dangerouslySetInnerHTML={{ __html: this.state.object }}>
                </div>
            </div>
        );
    }
}