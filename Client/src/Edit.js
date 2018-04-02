import React from 'react';
import { hashHistory } from 'react-router';
import Nav from './Nav';
//import CreateBanner from './CreateBanner';

export default class EditPage extends React.Component {
    constructor(props) {
        super(props);

        // 1. Get auth token
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        let auth = localStorage.getItem('Authorization');

        if (!ud || !auth || !this.props.location.query || !this.props.location.query.project) {
            hashHistory.push('/login');
        }

        let pid = this.props.location.query.project;

        this.state = {
            'error': undefined,
            'userdata': ud,

            'username': ud.username,
            'selectedBrick': undefined, // Which block on the left is selected (ID)

            'projectData': undefined,

            'projectId': pid,

            'bricks': undefined // All posible HTML blocks, will be called bricks throughout
        };



        this.getProjectData = this.getProjectData.bind(this);
        this.translateProjectData = this.translateProjectData.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.updateProject = this.updateProject.bind(this);
        //this.do = this.do.bind(this);
        //this.undo = this.undo.bind(this);
        //this.componentDidMount2 = this.componentDidMount2.bind(this);
        this.componentDidMount3 = this.componentDidMount3.bind(this);
        //this.getAuthData = this.getAuthData.bind(this);
        this.getAllPossibleHtmlBlocks = this.getAllPossibleHtmlBlocks.bind(this);
        this.dropBlock = this.dropBlock.bind(this);
        this.compareProjectUserIdToAuthTokenUserId = this.compareProjectUserIdToAuthTokenUserId.bind(this);

        console.log('______________________');

        this.getProjectData();
        this.getAllPossibleHtmlBlocks();
    }

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    compareProjectUserIdToAuthTokenUserId() {

        let that = this;

        fetch('https://api.webwizards.me/v1/users/me', {
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
                        //console.log(result);

                        // Check if project creator's user ID is the same as the ID of the authorized user
                        if (that.state.projectData.userid === result.id) {
                            that.componentDidMount3();
                        } else {
                            // Kick to main page
                            hashHistory.push('/main');
                        }
                    });

                } else {
                    response.text().then(text => {
                        console.log(text);
                        return false;
                    });
                }
            })
            .catch(err => {
                console.log('caught it!', err);
                return false;
            });
    }

    componentDidMount3() {
        // Check if Head, Body are there
        if (this.state.projectData.content === null) {
            console.log('Missing head, body');
        } else {
            console.log('CDM3');

            // Load project contents on the right

            // Unhide the left content bricks
        }

    }

    //______________________
    // Functions

    // Get all possible HTML blocks, putting them as bricks on left
    getAllPossibleHtmlBlocks() {
        let that = this;
        // 2. Project creator user ID compared to auth token's user ID
        fetch('https://api.webwizards.me/v1/htmlblocks', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        //console.log(result);

                        let brickContainer = {};

                        for (var i = 0; i < result.length; i++) {
                            let current = result[i];
                            brickContainer[current.name] = {
                                'id': i,
                                'translation': current.translation,
                                'description': current.description,
                                'type': current.type
                            }
                        }
                        //console.log(brickContainer);
                        that.setState({
                            'bricks': brickContainer
                        });
                    });

                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            });

    }

    // API call for getting project content JSON
    getProjectData() {

        let that = this;

        // Query parameter: project: project ID
        let pid = this.state.projectId;

        // Call
        fetch('https://api.webwizards.me/v1/projects?id=' + pid, {
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

                        that.setState({
                            projectData: result
                        });
                        if (result.content.length === 0) {
                            console.log('A');
                            that.compareProjectUserIdToAuthTokenUserId();
                            that.buildHeadBody();
                        } else {
                            console.log('B');
                            that.compareProjectUserIdToAuthTokenUserId();
                        }
                        return true;
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            });
    }

    // Create head and body if content of project is empty
    buildHeadBody() {
        console.log('Build head and body!');

        let that = this;

        let timer = setInterval(function () {
            console.log('try');
            if (that.state.projectData !== undefined && that.state.projectData.content.length === 0 && that.state.bricks !== undefined) {
                console.log('Drop blocks!');
                that.dropBlock(that.state.bricks['head'].id, '', 0);
                clearInterval(timer);
                //that.dropBlock(that.state.bricks['body'].id, null);
            }
        }, 1000);
    }

// Drop a block to specified location
/*
    1 brickId: id of base HTML brick, such as for head, body, title, etc.
    2 parentId: id of HTML block in project that a new brick is being placed in
*/
dropBlock(brickId, parentId, index) {

    console.log('Drop!');

    let that = this;
    if (this.state.projectData === null) {
        return;
    }
    // Create block
    console.log('userid: ' + this.state.projectData.userid);
    console.log('blocktype: ' + brickId);
    console.log('parentid: ' + parentId);
    console.log('index: ' + index);

    fetch('https://api.webwizards.me/v1/blocks', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
            'userid': that.state.projectData.userid,
            'blocktype': brickId,
            'parentid': parentId,
            'index': index
        })
    })
        .then(function (response) {

            if (response.ok) {
                response.json().then(function (result) {
                    console.log(result);
                    // Save
                    that.updateProject({ 'block': null })
                });


            } else {
                response.text().then(text => {
                    console.log(text);
                });

            }
        })
        .catch(err => {
            console.log('caught it!', err);
        });

    // Update block by setting parentID
}

// Update project (co = an object with keys)
updateProject(co) {
    console.log('Update Project!' + co.block + '>');
    let name = null;
    let block = null;

    if (co.name !== undefined) {
        name = co.name;
    }
    if (co.block !== undefined) {
        block = co.block;
    }
    fetch('https://api.webwizards.me/v1/projects?id=' + this.state.projectId, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
            'content': block
        })
    });
}



// Convert project JSON -> HTML, for the preview
translateProjectData() {

}

// Translate project JSON -> the stuff on the right
updateContent() {

}

























render() {
    return (
        <div>
            <Nav username={this.state.username} />
            <div className="half-width">
                <div>
                    <div className="brick magenta-brick" id="head">head</div>
                    <div className="brick magenta-brick" id="title">title</div>
                    <div className="brick magenta-brick" id="body">body</div>
                    <div className="brick magenta-brick" id="div">div</div>
                    <div className="brick magenta-brick" id="span">span</div>
                </div>
                <div>
                    <div className="brick blue-brick" id="img">img</div>
                    <div className="brick blue-brick" id="audio">audio</div>
                    <div className="brick blue-brick" id="textContent">text content</div>
                </div>
                <div>
                    <div className="brick green-brick" id="h1">h1</div>
                    <div className="brick green-brick" id="h2">h2</div>
                    <div className="brick green-brick" id="h3">h3</div>
                    <div className="brick green-brick" id="h4">h4</div>
                    <div className="brick green-brick" id="h5">h5</div>
                    <div className="brick green-brick" id="h6">h6</div>
                </div>
                <div>
                    <div className="brick orange-brick" id="unknown">&lt;&gt;</div>
                </div>
            </div>
            <div className="half-width">
                <div>
                </div>
            </div>

        </div>

    );
}
}