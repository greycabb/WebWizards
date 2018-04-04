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

        // If missing userdata, auth token, or query parameter "location", kick to login page
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

        // Setup functions
        this.setup_getProjectData = this.setup_getProjectData.bind(this);
        this.setup_getAllPossibleHtmlBlocks = this.setup_getAllPossibleHtmlBlocks.bind(this);
        this.setup_compareProjectUserIdToAuthTokenUserId = this.setup_compareProjectUserIdToAuthTokenUserId.bind(this); // dependent on getProjectData's user ID
        this.setup_buildHeadBody = this.setup_buildHeadBody.bind(this); // dependent on getProjectData's content

        this.updateProject = this.updateProject.bind(this);

        this.dropBlock = this.dropBlock.bind(this);

        console.log('______________________');

        this.setup_getProjectData(); // state.projectdata
        this.setup_getAllPossibleHtmlBlocks(); // state.bricks
    }

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    //____________________________________________________________________________
    // Part 1: Setup
    //      On load, get project data and all possible HTML blocks (aka bricks)

    //_____________
    // API call for getting project content JSON
    setup_getProjectData() {

        let that = this;

        // Query parameter: project: project ID
        let pid = this.state.projectId;

        // Get the project's data
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

                        // Set projectData state
                        that.setState({
                            projectData: result
                        });

                        that.setup_compareProjectUserIdToAuthTokenUserId();

                        // If <html> and <head> and <body> are missing
                        if (result.content.length === 0) {
                            console.log('Setup 1 -> A: Missing html, head, body');

                            that.buildHeadBody();
                        } else {
                            console.log('Setup 1 -> B: There is html, head, body already');
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
                console.log('ERROR: ', err);
            });
    }

    //_____________
    // Called during setup_getProjectData() after the API call for getting project data completes
    setup_compareProjectUserIdToAuthTokenUserId() {

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
                        // Check if project creator's user ID is the same as the ID of the authorized user
                        if (that.state.projectData.userid === result.id) {
                            // Authentication succeeded
                            console.log('Setup 1.5: Authentication succeeded');
                        } else {
                            // Kick to main page
                            console.log('Setup 1.5: Authentication failed!')
                            hashHistory.push('/main');
                        }
                    });

                } else {
                    hashHistory.push('/main');
                    response.text().then(text => {
                        console.log(text);
                        return false;
                    });
                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
                return false;
            });
    }

    //_____________
    // Get all possible HTML blocks, putting them as bricks on left
    setup_getAllPossibleHtmlBlocks() {
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
                console.log('ERROR: ', err);
            });

    }

    //______________________
    // Functions





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
                'projectId': that.state.projectId,
                'index': index
            })
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        console.log(result);
                        // Save
                        that.updateProject({ 'block': parentId })
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