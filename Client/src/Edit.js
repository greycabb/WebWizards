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

            'projectData': undefined, // Data about the project

            'projectId': pid, // id of the project


            'bricksById': undefined, // All posible HTML blocks, will be called bricks throughout
            'bricksByName': undefined, // All possible bricks by name (div, span, etc) instead of ID

            'htmlBlockId': undefined, // ID of the root HTML block in the project data

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
            'stackVisited': {},

            'finishedBuildingHeadBody': false,
            'recursiveLayout': undefined
        };

        // Setup functions
        this.setup_getProjectData = this.setup_getProjectData.bind(this); // state.projectdata
        this.setup_getAllPossibleHtmlBlocks = this.setup_getAllPossibleHtmlBlocks.bind(this);
        this.setup_compareProjectUserIdToAuthTokenUserId = this.setup_compareProjectUserIdToAuthTokenUserId.bind(this); // dependent on getProjectData's user ID

        // Build the original project components - root, head, body, base. Maybe make these run when the project gets created
        this.setup_buildHtmlRoot = this.setup_buildHtmlRoot.bind(this); // dependent on getProjectData's content
        this.setup_buildHead = this.setup_buildHead.bind(this); // Root -> head -> body (in order, very important)
        this.setup_buildBody = this.setup_buildBody.bind(this);
        this.setup_createBaseBlock = this.setup_createBaseBlock.bind(this); // used in setup_build...s

        // Editor preparation
        this.makeLayout = this.makeLayout.bind(this); // Create "layout" state
        this.recursiveLayout = this.recursiveLayout.bind(this); // Using the layout state, create the display on the right

        // Set data
        this.updateProject = this.updateProject.bind(this); // Update project, passing in the ID of the base HTML block
        this.createBlock = this.createBlock.bind(this); // Create a new block in the project

        // Get data
        this.getBlock = this.getBlock.bind(this); // Get information about a block

        // Editor functions
        this.pickup = this.pickup.bind(this);
        this.drop = this.drop.bind(this);

        console.log('______________________');
        this.setup_getProjectData();
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
                            that.setState({
                                'finishedBuildingHeadBody': true
                            });
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
                        'buildTimer': null,
                        'finishedBuildingHeadBody': true
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
                                    'htmlBlockId': result.id,
                                    'headData': result
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
    // forSetup: if the getBlockgetBlock() call is
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
                            let layout = that.state.layout;

                            let location = layout;

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
                                layout: layout
                            });
                            //console.log('LAYOUT');
                            //console.log(that.state.layout);


                            // Recursion
                            if (newStack.length > 0) {
                                //console.log('STACK');
                                //console.log(newStack);
                                //console.log('XX');
                                //console.log(newStack[0]);
                                that.getBlock(newStack[0].id, true, newStack[0].location);
                            } else {
                                //console.log('Done!');
                                // Make new layout
                                that.setState({
                                    'recursiveLayout': that.recursiveLayout(layout, true)
                                });
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
                // Cannot fetch block, this is likely to just be a content child
                // Place the current block into the layout
                let layout = that.state.layout;

                let location = layout;

                for (var i = 0; i < locationInLayout.length; i++) {
                    if (location.children[locationInLayout[i]] === undefined) {
                        location.children[locationInLayout[i]] = {
                            children: {

                            }
                        };
                    }
                    location = location.children[locationInLayout[i]];
                }

                // Once at location, assign variables there
                //location.id = '';
                location.blocktype = "text-contents";
                location.children = { "content": id }; // Filled out later from stack

                that.setState({
                    layout: layout
                });

                //console.log(id);
                //console.log(locationInLayout);
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

        let hd = this.state.headData;
        if (hd) {
            this.setState({
                layout: {
                    id: hd.id,
                    blocktype: hd.blocktype,
                    css: hd.css,
                    parentid: hd.parentid,
                    children: {

                    }
                }
            });
        } else {
            this.setState({
                layout: {
                    children: {

                    }
                }
            })
        }

        // Recursively build the layout
        this.getBlock(this.state.htmlBlockId, true, [0]);
    }

    // Update project
    // blockId: the ID of the base <HTML> tag of the project's content
    updateProject(blockId) {
        console.log('Update Project!' + blockId + '>');
        let that = this;

        fetch('https://api.webwizards.me/v1/projects?id=' + this.state.projectId, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'content': [blockId]
            })
        })
            .then(function (response) {
                that.setup_getProjectData();
                that.makeLayout();
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }






    // Click a brick on the left
    pickup(brickName) {

        // Remove highlight class from previously selected bricks
        let clicked = document.querySelectorAll('.pressed-brick');
        for (let i = 0; i < clicked.length; i++) {
            clicked[i].classList.remove('pressed-brick');
        }

        if (brickName === undefined || brickName === this.state.selectedBrick) {
            this.setState({
                'status': '',
                'selectedBrick': undefined
            });
            return;
        }
        if (this.state.bricksByName !== undefined) {
            if (this.state.bricksByName[brickName] !== undefined) {
                console.log(brickName);
                this.setState({
                    'selectedBrick': brickName
                });
            }

            document.getElementById(brickName).classList.add('pressed-brick');

            // debug purposes
            this.setState({
                'status': brickName + ' -> '
            });
        }
    }

    // Place a block into the right, after picking up a brick on the left
    // The type of brick placed is determined by the brick that was picked up on the left, from state
    drop(parentId, index, e) {
        e.stopPropagation();
        console.log('Attempting to drop <' + brick + '> in ' + parentId + ' ' + index);

        let brick = this.state.selectedBrick;
        if (brick && parentId !== undefined && index !== undefined) {
            this.pickup(); // unselect the selected brick
            console.log('drop <' + brick + '> in ' + parentId + ' ' + index);
            this.createBlock(brick, parentId, index);
        }
    }

    // Recursively build the display on the right
    recursiveLayout(current, first) {

        if (!current) {
            return;
        }

        const blockTypesToIgnore = {
            'html': true,
            'body': true,
            'head': true
        };

        if (first === true) {
            if (current.children !== undefined && current.children[0] !== undefined) {
                current = current.children[0];
                first = 0;
            } else {
                return;
            }
        }

        console.log(current);

        let b = (<span></span>);

        let blockname = this.state.bricksByName[current.blocktype];

        let that = this;

        if (blockname != undefined &&
            (blockname.type == 'wrapper' || blockname.type == 'text-wrapper')) {
            let kids = Object.keys(current.children);
            for (var i = 0; i < kids.length; i++) {
                let child = current.children[kids[i]];

                if (blockTypesToIgnore[child.blocktype] !== true) {
                    // Place a dropspace before each child
                    let index = i;
                    b = (<span>
                        {b}
                        <div className="red" onClick={function (e) { that.drop(current.id, index, e) }}>
                            <span className="yellow">-> parent: {current.id.substr(current.id.length - 3)}, index: {index}</span>
                        </div>
                        {this.recursiveLayout(child, i)}
                    </span>);
                } else {
                    b = (<span>{b}{this.recursiveLayout(child, i)}</span>);
                }

                if (i === kids.length - 1) {
                    if (blockTypesToIgnore[child.blocktype] !== true) {
                        // Place a dropspace after the last child
                        let index = i + 1;
                        b = (
                            <span>
                                {b}
                                <div className="purp" onClick={function (e) { that.drop(current.id, index, e) }}>
                                    <span className="yellow">-> parent: {current.id.substr(current.id.length - 3)}, index: {index}</span>
                                </div>
                            </span>
                        );
                    }
                }
            }
            if (blockTypesToIgnore[current.blocktype] !== true) {
                b = (
                    <span>
                        {/* <li className="red">
                            <span className="yellow">-> parent: {current.parentid.substr(current.parentid.length - 3)}, index: 0</span>
                        </li> */}
                        {b}
                    </span>
                );
            }
        }

        if (blockname !== undefined && blockname.type === "content") {
            let content = current.children;
            console.log("current content: " + JSON.stringify(content));
            b = (<span></span>);
        }
        if (current.children[0] !== undefined && current.children[0].blocktype === "text-contents") {
            let content = current.children[0].children.content;
            console.log("Testing " + content);
            b = (<input type="text" className="editor-text-content" value={content} />);
        }

        var blockclass;
        if (blockname !== undefined) {
            if (blockname.type == 'wrapper') {
                blockclass = 'primary-brick';
            }
            if (blockname.type == 'content') {
                blockclass = 'secondary-brick';
            }
            if (blockname.type == 'text-wrapper') {
                blockclass = 'third-brick';
            }
        }
        if (current.blocktype !== 'text') {
            let startTag = '<' + current.blocktype + '>';
            let endTag = '</' + current.blocktype + '>';
            b = (
                <ul onClick={function (e) { that.drop(current.id, (Object.keys(current.children)).length, e) }}>
                    <li className={blockclass}>
                        {startTag}
                        {current.id !== undefined &&
                            <span className="yel">id: {current.id.substr(current.id.length - 3)}, index: {first} </span>
                        }
                        {b}
                        {endTag}
                    </li>
                </ul>
            );

            //b = ({b});
        }
        else {
            b = (<li className={blockclass}>{b}</li>);
            b = (<ul>{b}</ul>);
        }
        return b;
    }




    render() {

        // Recursively build layout...

        // Don't put append or prepends for these 3 base block types


        let that = this;



        var urlstring = "#/project/" + this.state.projectId;

        return (
            <div>
                {this.state.userdata !== null && this.state.userdata.username !== undefined &&
                    <Nav username={this.state.userdata.username} />
                }
                <div className="half-width">
                    <div className="edit-bar">
                        <div><h3>&nbsp;{this.state.status}</h3></div>
                        <Link to="/main"><button className="btn yellow-button">Back</button></Link>
                        {this.state.projectId != undefined && this.state.projectData != undefined &&
                            <span>
                                <a href={urlstring} target="_blank"><button className="btn yellow-button">View Page</button></a>
                                <button className="btn yellow-button">Settings</button>
                                <h2 className="editor-project-title">{this.state.projectData.name}</h2>
                            </span>
                        }
                    </div>
                    {this.state.projectData != undefined &&
                        <PreviewProject projectObject={this.state.projectData} />
                    }

                    {/* Can make each line and the function get generated from 3 arrays instead... primary, secondary, third arrays of each name */}
                    <div>
                        {/* <div className="brick primary-brick disable-select" id="head" onClick={function () { that.pickup('head') }} >head</div> */}
                        {/* <div className="brick primary-brick disable-select" id="title" onClick={function () { that.pickup('title') }} >title</div> */}
                        {/* <div className="brick primary-brick disable-select" id="body" onClick={function () { that.pickup('body') }} >body</div> */}
                        <div className="brick primary-brick disable-select" id="div" onClick={function () { that.pickup('div') }} >div</div>
                        {/* <div className="brick primary-brick disable-select" id="span" onClick={function () { that.pickup('span') }} >span</div> */}
                        <div className="brick primary-brick disable-select" id="p" onClick={function () { that.pickup('p') }} >p</div>
                    </div>
                    <div>
                        <div className="brick secondary-brick disable-select" id="img" onClick={function () { that.pickup('img') }} >img</div>
                        {/* <div className="brick secondary-brick disable-select" id="audio" onClick={function () { that.pickup('audio') }} >audio</div> */}
                        {/* <div className="brick secondary-brick disable-select" id="textContent" onClick={function () { that.pickup('textContent') }} >text content</div> */}
                    </div>
                    <div>
                        <div className="brick third-brick disable-select" id="h1" onClick={function () { that.pickup('h1') }} >h1</div>
                        <div className="brick third-brick disable-select" id="h2" onClick={function () { that.pickup('h2') }} >h2</div>
                        <div className="brick third-brick disable-select" id="h3" onClick={function () { that.pickup('h3') }} >h3</div>
                        <div className="brick third-brick disable-select" id="h4" onClick={function () { that.pickup('h4') }} >h4</div>
                        {/* <div className="brick third-brick disable-select" id="h5" onClick={function () { that.pickup('h5') }} >h5</div> */}
                        {/* <div className="brick third-brick disable-select" id="h6" onClick={function () { that.pickup('h6') }} >h6</div> */}
                    </div>
                </div>
                <div className="half-width draggable-space">
                    <div>
                        {this.state.recursiveLayout === undefined &&
                            <h1>Loading...</h1>
                        }
                        {this.state.recursiveLayout !== undefined &&
                            this.state.recursiveLayout
                        }
                    </div>
                </div>

            </div>

        );
    }
}