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
            'userdata': ud, // first name, last name, etc., gotten from local storage

            'selectedBrick': undefined, // Which block on the left is selected (ID)

            'projectData': undefined,

            'projectId': pid,

            'bricks': undefined, // All posible HTML blocks, will be called bricks throughout

            'htmlBlockId': undefined,

            // For building the layout...
            'layout': {},
            /* Example layout:
                {
                    0: {
                        type: 'html',
                        id: '34545',
                        attributes: '',
                        locked: true,
                        position: [0]

                        children: {
                            0: {
                                type: 'head',
                                id: '34545',
                                attributes: '',
                                locked: true,
                                position: [0, 0]

                                children: {
                                    0: {

                                    }
                                }
                            },
                            1: {
                                type: 'body',
                                id: '34545',
                                attributes: '',
                                locked: true,
                                position: [0, 1]

                                children: {

                                }
                            }
                        }
                    }
                }
            */
            'stack': [],
            'indexMapOfCurrent': [] // e.g. [0, 2, 3, 2, 1] for placing at layout[2][3][2][1]

        };

        // Setup functions
        this.setup_getProjectData = this.setup_getProjectData.bind(this);
        this.setup_getAllPossibleHtmlBlocks = this.setup_getAllPossibleHtmlBlocks.bind(this);
        this.setup_compareProjectUserIdToAuthTokenUserId = this.setup_compareProjectUserIdToAuthTokenUserId.bind(this); // dependent on getProjectData's user ID

        // Project bodybuild
        this.setup_buildHtmlRoot = this.setup_buildHtmlRoot.bind(this); // dependent on getProjectData's content
        this.setup_buildHead = this.setup_buildHead.bind(this); // Root -> head -> body (in order, very important)
        this.setup_buildBody = this.setup_buildBody.bind(this);
        this.setup_createBaseBlock = this.setup_createBaseBlock.bind(this);

        this.createBlock = this.createBlock.bind(this);
        this.makeLayout = this.makeLayout.bind(this);

        this.updateProject = this.updateProject.bind(this);
        this.dropBlock = this.dropBlock.bind(this);
        this.getBlock = this.getBlock.bind(this);

        console.log('______________________');

        this.setup_getProjectData(); // state.projectdata
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
                            that.setState({
                                'needsHtmlRoot': true
                            });
                        } else {
                            console.log('Setup 1 -> B: There is html, head, body already');
                            that.setState({
                                'htmlBlockId': result.content[0]
                            });
                            that.getBlock(that.state.htmlBlockId);
                            that.makeLayout();
                        }
                        that.setup_getAllPossibleHtmlBlocks();
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

                        // If body not built yet, build it
                        if (that.state.needsHtmlRoot === true) {
                            that.setState({
                                'needsHtmlRoot': false
                            });
                            that.setup_buildHtmlRoot();
                        } else {
                            that.makeLayout();
                        }
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
    // Called during setup_getAllPossibleHtmlBlocks after the API call if content of project is empty
    setup_buildHtmlRoot() {
        console.log('1. Build HTML root!');

        // Create new <html> element
        this.setup_createBaseBlock('html', null, 0);

        let that = this;
        this.setState({
            'buildTimer': setInterval(function () {
                if (that.state.htmlBlockId !== undefined) {

                    clearInterval(that.state.buildTimer);
                    that.setState({
                        'buildTimer': null
                    });

                    // Set html block ID as the content of the project
                    that.updateProject(that.state.htmlBlockId);

                    // Build head
                    that.setup_buildHead();

                }
            }, 200)
        });
    }
    setup_buildHead() {
        console.log('2. Build head!');

        // Create new <head> element
        this.setup_createBaseBlock('head', this.state.htmlBlockId, 0);

        let that = this;
        this.setState({
            'buildTimer': setInterval(function () {
                if (that.state.headBlockId !== undefined) {

                    clearInterval(that.state.buildTimer);
                    that.setState({
                        'buildTimer': null
                    });

                    that.setup_buildBody();
                }
            }, 200)
        });
    }
    setup_buildBody() {
        console.log('3. Build body!');
        let slot = 'body';

        // Create new <head> element
        this.setup_createBaseBlock('body', this.state.htmlBlockId, 1);

        let that = this;
        this.setState({
            'buildTimer': setInterval(function () {
                if (that.state.bodyBlockId !== undefined) {
                    clearInterval(that.state.buildTimer);
                    that.setState({
                        'buildTimer': null
                    });

                    that.updateProject(that.state.htmlBlockId);
                }
            }, 200)
        });
    }

    // id: id of block to add to layout
    // 
    getBlock(id, forSetup, locationInLayout) {
        //console.log('GetBlock');
        let that = this;
        fetch('https://api.webwizards.me/v1/blocks?id=' + id, {
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

                        if (forSetup === true && locationInLayout !== undefined && locationInLayout.length > 0) {

                            // Remove the id of the current block from the stack
                            let newStack = that.state.stack.splice(0, 1);

                            // Send children of the current block into the stack
                            let newChildren = [];

                            

                            for (var i = 0; i < result.children.length; i++) {
                                let locked = locationInLayout.length <= 1; //
                                let lil = locationInLayout.slice();
                                let newChild = {
                                    'id': result.children[i],
                                    'location': lil.push(i), // If parent was [0], then this is [0, i]
                                    'locked': locked
                                }
                                newChildren[i] = newChild;
                            }
                            if (newChildren.length > 0) {
                                // Put children of block into the front of the stack
                                //newStack.unshift(newChildren);
                                newStack = newChildren.concat(newStack);
                            }
                            that.setState({
                                stack: newStack
                            });

                            // Place the current block into the layout
                            let newLayout = that.state.newLayout;

                            let location = newLayout[0];

                            for (var i = 1; i <= locationInLayout.length; i++) {
                                if (location.children[i] === undefined) {
                                    location.children[i] = {
                                        children: {

                                        }
                                    };
                                }
                                location = location.children[i];
                                console.log("LL[");
                                    console.log(location);
                                    console.log("]");
                            }
                            // Once at location, assign variables there
                            location.id = result.id;
                            location.blocktype = result.blocktype;
                            location.css = result.css;
                            location.parentid = result.parentid;
                            location.children = { }; // Filled out later from stack

                            that.setState({
                                newLayout: newLayout
                            });
                            console.log('LAYOUT');
                            console.log(that.state.newLayout);


                            // Recursion
                            if (that.state.stack.length > 0) {
                                console.log('STACK');
                                console.log(that.state.stack);
                                that.getBlock(that.state.stack[0].id, true, that.state.stack[0].location);
                            } else {
                                console.log('Done!');
                            }




                            // let newChildren = {
                            //     // 0, 1, 2, etc. (indices)
                            // };
                            // for (var i = 0; i < result.children.length; i++) {
                            //     let newChild = {
                            //         id: result.children[i],
                            //         parent: result.id
                            //     }
                            //     newChildren[i] = newChild;
                            // }

                            // newStack = newStack.concat(result.children);
                            // that.setState({
                            //     stack: newStack
                            // });
                        }
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                        that.state.stack = [];
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    // 
    setup_createBaseBlock(slot, parentId, index) {
        let brickId = this.state.bricks[slot].id;
        let that = this;
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
                        switch (slot) {
                            case 'html':
                                that.setState({
                                    'htmlBlockId': result.id
                                });
                                break;
                            case 'head':
                                that.setState({
                                    'headBlockId': result.id
                                });
                                break;
                            case 'body':
                                that.setState({
                                    'bodyBlockId': result.id
                                });
                                break;
                        }
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



    // Get root block
    makeLayout() {

        // Clear stack
        this.setState({
            stack: []
        });

        this.setState({
            newLayout: {
                0: {
                    children: {

                    }
                }
            }
        });

        // Recursively build the layout
        this.getBlock(this.state.htmlBlockId, true, [0]);

    }





    // Create block then return ID of block
    createBlock() {

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
    updateProject(block) {
        console.log('Update Project!' + block + '>');
        let that = this;

        fetch('https://api.webwizards.me/v1/projects?id=' + this.state.projectId, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'content': [block]
            })
        })
            .then(function (response) {

                that.setup_getProjectData();
                that.getBlock(that.state.htmlBlockId);
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

























    render() {
        return (
            <div>
                <Nav username={this.state.userdata.username} />
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