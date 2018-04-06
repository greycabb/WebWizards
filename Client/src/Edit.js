import React from 'react';
import { hashHistory, Link } from 'react-router';
import Nav from './Nav';
import PreviewProject from './PreviewProject';

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

            'bricksByName': undefined,
            'bricksById': undefined, // All posible HTML blocks, will be called bricks throughout

            'htmlBlockId': undefined,

            // For building the layout...
            'newLayout': {},
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
            'stackVisited': {},
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
        //this.displayLayout = this.displayLayout.bind(this);

        this.updateProject = this.updateProject.bind(this);
        //this.dropBlock = this.dropBlock.bind(this);
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
                        }
                        that.setup_getAllPossibleHtmlBlocks();
                        return true;
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                        hashHistory.push('/login');
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
                hashHistory.push('/login');
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

                        // rotate the result so that it's a dictionary with names as keys
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
                            'bricksById': result,
                            'bricksByName': brickContainer
                        });

                        // If body not built yet, build it
                        if (that.state.needsHtmlRoot === true) {

                            // build <html> with <head> and <body> inside
                            that.setState({
                                'needsHtmlRoot': false // if <html> has been built
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
                if (that.state.htmlBlockId !== undefined) { // when setup_createBaseBlock(html) completes

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
                if (that.state.headBlockId !== undefined) { // when setup_createBaseBlock(head) completes

                    clearInterval(that.state.buildTimer);
                    that.setState({
                        'buildTimer': null
                    });
                    that.createBlock('title', that.state.headBlockId, 0); // Title

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
                if (that.state.bodyBlockId !== undefined) { // when setup_createBaseBlock(body) completes
                    clearInterval(that.state.buildTimer);
                    that.setState({
                        'buildTimer': null
                    });

                    that.updateProject(that.state.htmlBlockId);
                    that.makeLayout();
                }
            }, 200)
        });
    }

    // Create <html>, <head>, <body> tags when they previously don't exist
    setup_createBaseBlock(slot, parentId, index) {
        let brickId = this.state.bricksByName[slot].id;
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
                        console.log('New block - ' + slot);
                        console.log(result);

                        // Used to verify when the <html>, <head> and <body> blocks have been created
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

    // slot like "title" or whatever
    // parentid is the parent of the block
    // index is the # index child the block is, of the parent
    createBlock(slot, parentId, index) {
        let brickId = this.state.bricksByName[slot].id;
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
                        console.log('New block: ' + slot);
                        console.log(result);
                        that.updateProject(that.state.htmlBlockId);
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





    // Used to get information about blocks, needed for building the display on the right
    // id: id of block to add to layout
    // forSetup: if the getBlock() call is
    // locationInLayout: e.g. if it's [0, 2, 4] then you can get to the block in state.layout at 0: children: { 2: children { 4 }}
    getBlock(id, forSetup, locationInLayout) {
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


                        if (forSetup === true && locationInLayout !== undefined && locationInLayout.length > 0) {


                            //console.log('___________________________');
                            //console.log(locationInLayout);
                            let sv = that.state.stackVisited;


                            if (sv[id] === true) {
                                return;
                            }

                            sv[id] = true;
                            that.setState({
                                'stackVisited': sv
                            });

                            // Remove the current block from the stack
                            let newStack = that.state.stack.slice(0);
                            newStack.shift();

                            // Send children of the current block into the stack:
                            let newChildren = [];


                            let locked = locationInLayout.length <= 1; // Can't move or delete blocks with depth <= 2 (html, head, body)


                            //console.log('CHILDREN of : ' + id);
                            //console.log(result.children);
                            for (var i = 0; i < result.children.length; i++) {
                                let lil = locationInLayout.slice(0);
                                lil.push(i);
                                let newChild = {
                                    'id': result.children[i],
                                    'location': lil, // If parent was [0], then this is [0, i]
                                    'locked': locked
                                };
                                newChildren.push(newChild);
                            }
                            if (newChildren.length > 0) {
                                //console.log("NCL" + newChildren.length);
                                newStack = newChildren.concat(newStack);
                            }

                            that.setState({
                                stack: newStack
                            });


                            // Place the current block into the layout
                            let newLayout = that.state.newLayout;

                            let location = newLayout;

                            for (var i = 0; i < locationInLayout.length; i++) {
                                if (location.children[locationInLayout[i]] === undefined) {
                                    location.children[locationInLayout[i]] = {
                                        children: {

                                        }
                                    };
                                }
                                location = location.children[locationInLayout[i]];
                                //console.log("LL[");
                                //console.log(locationInLayout);
                                //console.log("]");
                            }
                            // Once at location, assign variables there
                            location.id = result.id;
                            location.blocktype = that.state.bricksById[result.blocktype].name;
                            location.css = result.css;
                            location.parentid = result.parentid;
                            location.children = {}; // Filled out later from stack

                            that.setState({
                                newLayout: newLayout
                            });
                            //console.log('LAYOUT');
                            //console.log(that.state.newLayout);


                            // Recursion
                            if (newStack.length > 0) {
                                //console.log('STACK');
                                //console.log(newStack);
                                //console.log('XX');
                                //console.log(newStack[0]);
                                that.getBlock(newStack[0].id, true, newStack[0].location);
                            } else {
                                //console.log('Done!');
                            }
                        }
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                        that.setState({
                            stack: [],
                            stackVisited: {}
                        });
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }


    //______________________
    // Functions



    // Get root block and all of it's children and their children to make the layout on the right
    makeLayout() {

        // Clear stack
        this.setState({
            stack: [],
            stackVisited: {}
        });

        this.setState({
            newLayout: {
                children: {

                }
                // 0: {
                //     id: this.state.htmlBlockId,
                //     blocktype: 'html',
                //     css: [],
                //     parentId: null,

                //     children: {

                //     }
                // }
            }
        });

        // Recursively build the layout
        this.getBlock(this.state.htmlBlockId, true, [0]);

    }




    // Drop a block to specified location
    /*
        1 brickId: id of base HTML brick, such as for head, body, title, etc.
        2 parentId: id of HTML block in project that a new brick is being placed in
    */
    // dropBlock(brickId, parentId, index) {

    //     console.log('Drop!');

    //     let that = this;
    //     if (this.state.projectData === null) {
    //         return;
    //     }
    //     // Create block
    //     console.log('userid: ' + this.state.projectData.userid);
    //     console.log('blocktype: ' + brickId);
    //     console.log('parentid: ' + parentId);
    //     console.log('index: ' + index);

    //     fetch('https://api.webwizards.me/v1/blocks', {
    //         method: 'POST',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //             'Authorization': localStorage.getItem('Authorization')
    //         },
    //         body: JSON.stringify({
    //             'userid': that.state.projectData.userid,
    //             'blocktype': brickId,
    //             'parentid': parentId,
    //             'projectId': that.state.projectId,
    //             'index': index
    //         })
    //     })
    //         .then(function (response) {

    //             if (response.ok) {
    //                 response.json().then(function (result) {
    //                     console.log(result);
    //                     // Save
    //                     that.updateProject({ 'block': parentId })
    //                 });


    //             } else {
    //                 response.text().then(text => {
    //                     console.log(text);
    //                 });

    //             }
    //         })
    //         .catch(err => {
    //             console.log('ERROR: ', err);
    //         });

    //     // Update block by setting parentID
    // }

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
                //that.getBlock(that.state.htmlBlockId);
                that.makeLayout();
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }























    /*
                return (
                    <ul>
                        <li>&lt;html&gt;
                            If there are children, put a <ul> inside with more children
                            <ul>
                                <li>&lt;head&gt;
    
                                </li>
                                <li>&lt;body&gt;
    
                                </li>
                            </ul>
                        </li>
                    </ul>
                );
                */

    render() {

        // Recursively build layout...

        var that = this;

        function recursiveLayout(current, first) {

            console.log('[[[[[RL]]]]]');
            if (first === true) {
                if (current.children !== undefined && current.children[0] !== undefined) {
                    current = current.children[0];
                } else {
                    return;
                }
            }

            console.log(current);

            let b = (<span></span>);

            let kids = Object.keys(current.children);
            console.log(kids);

            var type = that.state.bricksByName[current.blocktype].type;

            if (type == 'wrapper' || type == 'text-wrapper') {
                for (var i = 0; i < kids.length; i++) {
                    let child = current.children[kids[i]];

                    b = (<span>{b}{recursiveLayout(child)}</span>);

                    if (i === current.children.length) {
                        b = (<ul>{b}</ul>);
                    }
                }
            }
            else {
                let content = current.children;
                console.log("current content: " + content);
                b = (<span></span>);
            }

            var type = that.state.bricksByName[current.blocktype].type;
            
            var blockclass;
            if (type == 'wrapper') {
                blockclass = 'primary-brick';
            }
            if (type == 'content') {
                blockclass ='secondary-brick';
            }
            if (type == 'text-wrapper') {
                blockclass = 'third-brick';
            }
            b = (<li className={blockclass}>&lt;{current.blocktype}&gt;{b}</li>);
            //if (first === true) {
                b = (<ul>{b}</ul>);
            //}
            return b;

        }

        var urlstring = "#/project/" + this.state.projectId;

        return (
            <div>
                <Nav username={this.state.userdata.username} />
                <div className="half-width">
                    <div className="edit-bar">
                        <Link to="/main"><button className="btn yellow-button">Back</button></Link>
                        {this.state.projectId != undefined && this.state.projectData != undefined &&
                            <span>
                                <a href={urlstring} target="_blank"><button className="btn yellow-button">View Page</button></a>
                                <h2 className="editor-project-title">{this.state.projectData.name}</h2>
                            </span>
                        }
                    </div>
                    {this.state.projectData != undefined &&
                        <PreviewProject projectObject={this.state.projectData} />
                    }
                    <div>
                        <div className="brick primary-brick disable-select" id="head">head</div>
                        <div className="brick primary-brick disable-select" id="title">title</div>
                        <div className="brick primary-brick disable-select" id="body">body</div>
                        <div className="brick primary-brick disable-select" id="div">div</div>
                        <div className="brick primary-brick disable-select" id="span">span</div>
                    </div>
                    <div>
                        <div className="brick secondary-brick disable-select" id="img">img</div>
                        <div className="brick secondary-brick disable-select" id="audio">audio</div>
                        <div className="brick secondary-brick disable-select" id="textContent">text content</div>
                    </div>
                    <div>
                        <div className="brick third-brick disable-select" id="h1">h1</div>
                        <div className="brick third-brick disable-select" id="h2">h2</div>
                        <div className="brick third-brick disable-select" id="h3">h3</div>
                        <div className="brick third-brick disable-select" id="h4">h4</div>
                        <div className="brick third-brick disable-select" id="h5">h5</div>
                        <div className="brick third-brick disable-select" id="h6">h6</div>
                    </div>
                </div>
                <div className="half-width draggable-space">
                    <div>
                        {this.state.newLayout !== undefined &&
                            recursiveLayout(this.state.newLayout, true)
                        }
                    </div>
                </div>

            </div>

        );
    }
}