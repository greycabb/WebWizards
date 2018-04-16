import React from 'react';
import './ProjectPage.css';

export default class ProjectPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            object: ''
        }
        this.componentWillMount = this.componentWillMount.bind(this);
        //this.componentDidMount = this.componentDidMount.bind(this);
        this.blockToHtml = this.blockToHtml.bind(this);

        //Get project object of id this.props.params.id
    }

    componentWillMount() {
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

    render() {

        return (
            <div ref="container" className="full-page-container" dangerouslySetInnerHTML={{ __html: this.state.object }}>
            </div>
        );
    }
}