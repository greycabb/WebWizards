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
        this.blockToHtml(this.props.projectObject.content[0], false).then((string) => {
            console.log(string);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.projectObject != this.props.projectObject) {
            this.uploadScreenshot();
            this.blockToHtml(this.props.projectObject.content[0], false).then((string) => {
                console.log(string);
                this.setState({object: string});
            });
        }
    }

    componentDidMount() {
        this.blockToHtml(this.props.projectObject.content[0], false).then((string) => {
            console.log(string);
            this.setState({object: string});
        });
    }

    //Should return an array with start tag and end tag
    //Ex: ["<div>", "</div>"]
    generateHtmlString(blockType, css) {
        if (blockType != "text-content" && blockType != "title") {
            //Generate css string first
            var cssString = "";
            if (css != null && css.length > 0) {
                cssString = ' style="';
                for (var i = 0; i < css.length; i ++) {
                    cssString += (css[i].attribute + ": " + css[i].value + "; ");
                }
                cssString += '"';
            }
            
            var startTag = "";
            var endTag = "";

            //We want to convert head, body, title, and html tags to div tags to be previewable
            if (blockType == "head" || blockType == "body" || blockType == "html") {
                startTag = "<div" + cssString + ">";
                endTag = "</div>";
            }
            else {
                startTag = "<" + blockType + cssString + ">";
                endTag = "</" + blockType + ">";
            }
            return [startTag, endTag];
        }
        else {
            return ["", ""];
        }
    }

    // Recursive calls
    blockToHtml(id, isTitle) {
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
                        let json = response.json().then((json) => {
                            let type = json.blocktype;
                            let css = json.css;
                            let children = json.children;

                            //Need to grab information on current block type
                            fetch('https://api.webwizards.me/v1/htmlblocks?id=' + type, {
                                method: 'GET',
                                headers: {
                                    'Authorization': auth,
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then((response) => {

                                    if (response.ok) {
                                        
                                        let json = response.json().then((blockInfo) => {

                                            //Generate a string of this block
                                            let blockTags = this.generateHtmlString(blockInfo.name, css);

                                            // An array of child tags 
                                            let childTags = Array(children.length);

                                            //Does not have children and is not a text content block
                                            let counter = 0;
                                            if (blockInfo.name != "text-content" && blockInfo.name != "title" && children != null && children.length > 0) {
                                                for (let i = 0; i < children.length; i ++) {
                                                    this.blockToHtml(children[i], false).then((result) => {
                                                        childTags[i] = result;
                                                        counter ++;
                                                        //We have reached the end
                                                        if (counter == children.length) {
                                                            //Combine strings
                                                            let combinedString = blockTags[0];
                                                            combinedString += childTags.join("");
                                                            combinedString += blockTags[1];
                                                            console.log(combinedString);
                                                            //Resolve with string
                                                            resolve(combinedString);
                                                        }
                                                    });
                                                }
                                            }
                                            else if (blockInfo.name == "text-content") {
                                                if (isTitle) {
                                                    document.title = children[0];
                                                    resolve("");
                                                }
                                                //Resolve with string
                                                resolve(children[0]);
                                            }
                                            else {
                                                resolve(blockTags[0] + blockTags[1]);
                                            }
                                        });
                                    }

                                });

                        });
                    }
                    // response is not ok
                    else {
                        reject(response.text());
                    }
                })
                .catch(err => {
                    reject(err);
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