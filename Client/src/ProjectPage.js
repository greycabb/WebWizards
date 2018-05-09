import React from 'react';
import './ProjectPage.css';

export default class ProjectPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            object: '',
            error: ''
        }
        this.componentWillMount = this.componentWillMount.bind(this);
        //this.componentDidMount = this.componentDidMount.bind(this);
        this.blockToHtml = this.blockToHtml.bind(this);

        //Get project object of id this.props.params.id
    }

    componentWillMount() {
        document.title = "Project Page"
        var that = this;

        // Get the project's data
        fetch('https://api.webwizards.me/v1/projects?id=' + this.props.params.id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            }
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {

                        console.log(result);

                        that.blockToHtml(result.content[0], false).then((string) => {
                            console.log(string);
                            that.setState({object: string});
                        });
            
                    });


                } else {
                    response.text().then(text => {
                        that.setState({error: text});
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    /*componentDidMount() {
        this.blockToHtml(this.state.projectData).then((string) => {
            this.setState({object: string});
        });
    } */

    
    
    //Should return an array with start tag and end tag
    //Ex: ["<div>", "</div>"]
    generateHtmlString(blockType, css, attributes, blockId) {
        if (blockType != "text-content" && blockType != "title") {

            //Generate attributes string
            var attributeString = "";
            if (attributes != null && attributes.length > 0) {
                attributeString += " ";
                attributeString += attributes.join(" ");
            }

            //Generate css string
            var cssString = ' id="block-' + blockId + '"';
            if (css != null && css.length > 0) {
                cssString = ' style="';
                if (blockType == "body" || blockType == "html") {
                    cssString += "width: 100%; height: 100%;"
                }
                for (var i = 0; i < css.length; i++) {
                    cssString += (css[i].attribute + ": " + css[i].value + "; ");
                }
                cssString += '"';
            }
            else {
                if (blockType == "body" || blockType == "html") {
                    cssString += " style=\"width: 100%; height: 100%;\"";
                }
            }

            var startTag = "";
            var endTag = "";

            //We want to convert head, body, title, and html tags to div tags to be previewable
            if (blockType == "head" || blockType == "body" || blockType == "html") {
                startTag = "<div" + cssString + ">";
                endTag = "</div>";
            }
            else if (blockType == "img") {
                startTag = "<" + blockType + attributeString + cssString + "/>";
                endTag = "";
            }
            else {
                startTag = "<" + blockType + attributeString + cssString + ">";
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
                            let attributes = json.attributes;
                            let id = json.id;

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
                                            let blockTags = this.generateHtmlString(blockInfo.name, css, attributes, id);

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
                                            else if (blockInfo.name == "title") {
                                                for (let i = 0; i < children.length; i ++) {
                                                    this.blockToHtml(children[i], true).then((result) => {
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

                                                //Resolve with string
                                                // Sanitize
                                                let sanitizeHtml = require('sanitize-html');
                                                
                                                let sanitizedTextContent;
                                                if (children[0] === undefined) {
                                                    sanitizedTextContent = '';
                                                } else {
                                                    sanitizedTextContent = sanitizeHtml(children[0], {
                                                        allowedTags: ['b', 'i', 'em', 'strong'],//'a'
                                                        allowedAttributes: {
                                                            //'a': ['href']
                                                        }
                                                    });
                                                }

                                                if (isTitle) {
                                                    console.log("reached title");
                                                    console.log(sanitizedTextContent);
                                                    if (sanitizedTextContent === '') {
                                                        sanitizedTextContent = 'Untitled';
                                                    }
                                                    document.title = sanitizedTextContent;
                                                    resolve("");
                                                }
                                                
                                                resolve(sanitizedTextContent);
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

    render() {

        return (
            <div>
                {this.state.error.length > 0} {
                    <div>
                        {this.state.error}
                    </div>
                }
                <div ref="container" className="full-page-container" dangerouslySetInnerHTML={{ __html: this.state.object }}>
                </div>
            </div>
        );
    }
}