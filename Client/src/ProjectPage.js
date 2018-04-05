import React from 'react';

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

                        that.blockToHtml(result.content[0]).then((string) => {
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
                                                var string = '<' + blockJson.name + cssString + '>';
                                                if (children != null && children.length > 0) {
                                                    for (var i = 0; i < children.length; i ++) {
                                                        this.blockToHtml(children[i]).then((result) => {
                                                            string += result;
                                                            string += '</' + blockJson.name + '>';
                                                            resolve(string);
                                                            //return string;
                                                        });
                                                    }
                                                }
                                                else {
                                                    string += '</' + blockJson.name + '>';
                                                    resolve(string);
                                                    //return string;
                                                }
                                            }
                                            else if (blockJson.type == "content") {
                                                resolve(children[0]);
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
                                                resolve(string);
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

    render() {

        return (
            <div ref="container" dangerouslySetInnerHTML={{ __html: this.state.object }}>
            </div>
        );
    }
}