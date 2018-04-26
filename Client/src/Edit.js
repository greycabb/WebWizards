import React from 'react';
import { hashHistory, Link } from 'react-router';
import Nav from './Nav';
import PreviewProject from './PreviewProject';
import CSSModal from './CSSModal';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Block from './Block';
import DropSlot from './DropSlot';
import Trash from './Trash';
import ExistingBlock from './ExistingBlock';
import ExistingDropSlot from './ExistingDropSlot';

class EditPage extends React.Component {
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

            styleToggled: false,

            styleToggledBlock: undefined,

            'error': undefined,
            'userdata': ud, // first name, last name, etc., gotten from local storage

            'selectedBrick': undefined, // Which block on the left is selected (ID)
            'selectedBlock': undefined, // Which block on the right is selected

            'projectData': undefined, // Data about the project
            'projectId': pid, // id of the project

            'bricksById': undefined, // All posible HTML blocks, will be called bricks throughout
            'bricksByName': undefined, // All possible bricks by name (div, span, etc) instead of ID

            'htmlBlockId': undefined, // ID of the root HTML block in the project data

            'layout': {}, // Layout of the right display

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
            'stack': [], // For building the layout
            'stackVisited': {}, // Also for building the layout

            'finishedBuildingHeadBody': false, // If html, head, body tags exist in the project content
            'recursiveLayout': undefined // JSX content of the right display, built from layout
        };

        // Setup functions
        this.setup_getProjectData = this.setup_getProjectData.bind(this); // state.projectdata
        this.setup_compareProjectUserIdToAuthTokenUserId = this.setup_compareProjectUserIdToAuthTokenUserId.bind(this); // dependent on getProjectData's user ID
        this.setup_getAllPossibleHtmlBlocks = this.setup_getAllPossibleHtmlBlocks.bind(this);

        // Build the original project components - root, head, body, base. Maybe make these run when the project gets created
        this.setup_buildHtmlRoot = this.setup_buildHtmlRoot.bind(this); // dependent on getProjectData's content
        this.setup_buildHead = this.setup_buildHead.bind(this); // Root -> head -> body (in order, very important)
        this.setup_buildBody = this.setup_buildBody.bind(this);
        this.setup_createBaseBlock = this.setup_createBaseBlock.bind(this); // used in setup_build...s

        // Editor preparation
        this.makeLayout = this.makeLayout.bind(this); // Create "layout" state
        this.recursiveLayout = this.recursiveLayout.bind(this); // Using the layout state, create the display on the right

        // Setting data
        this.updateProject = this.updateProject.bind(this); // Update project, passing in the ID of the base HTML block
        this.createBlock = this.createBlock.bind(this); // Create a new block in the project

        // Getting data
        this.getBlock = this.getBlock.bind(this); // Get information about a block

        // Editor functions
        this.pickup = this.pickup.bind(this);
        this.drop = this.drop.bind(this);

        this.cssModalToggleOn = this.cssModalToggleOn.bind(this);
        this.cssModalToggleOff = this.cssModalToggleOff.bind(this);
        this.handleProjectUpdates = this.handleProjectUpdates.bind(this);

        this.deleteBlock = this.deleteBlock.bind(this);
        this.moveBlock = this.moveBlock.bind(this);

        console.log('______________________');
        this.setup_getProjectData();
    }

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    //____________________________________________________________________________
    // Part 1: Setup
    //      On load, get project data and all possible HTML blocks (aka bricks)

    //____________________________________________________________________________
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
                            //console.log('Setup 1 -> B: There is html, head, body already');
                            that.setState({
                                'htmlBlockId': result.content[0]
                            });
                            that.getBlock(that.state.htmlBlockId);
                            if (that.state.bricksByName !== undefined) {
                                that.makeLayout();
                            }
                        }
                        if (that.state.bricksByName === undefined) {
                            that.setup_getAllPossibleHtmlBlocks();
                        }
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

    //____________________________________________________________________________
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
                        if (that.state.projectData.userid !== result.id) {
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

    //____________________________________________________________________________
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
                        console.log(result);

                        let brickContainer = {};

                        // rotate the result so that it's a dictionary with names as keys
                        for (var i = 0; i < result.length; i++) {
                            let current = result[i];
                            brickContainer[current.name] = {
                                'id': i,
                                'translation': current.translation,
                                'description': current.description,
                                'type': current.type,
                                'unallowed_children': current.unallowed_children
                            }
                        }
                        console.log(brickContainer);
                        that.setState({
                            'bricksById': result,
                            'bricksByName': brickContainer
                        });
                        console.log(result);

                        // If body not built yet, build it
                        if (that.state.needsHtmlRoot === true) {

                            // build <html> with <head> and <body> inside
                            that.setState({
                                'needsHtmlRoot': false // if <html> has been built
                            });
                            that.setup_buildHtmlRoot();
                        } else {
                            that.setState({
                                'finishedBuildingHeadBody': true
                            });
                            that.makeLayout();  // If HTML root already exists, make the layout on the right
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

    //____________________________________________________________________________
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
    //____________________________________________________________________________
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
    //____________________________________________________________________________
    setup_buildBody() {
        console.log('3. Build body!');

        // Create new <body> element
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
                    //that.makeLayout(); // Now make the layout on the right
                }
            }, 200)
        });
    }

    //____________________________________________________________________________
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

    //____________________________________________________________________________
    // Get root block and all of it's children and their children to make the layout on the right
    makeLayout() {

        if (this.state.projectData === undefined) {
            return;
        }

        // Clear stack
        this.setState({
            stack: [],
            stackVisited: {}
        });

        // let hd = this.state.headData;
        // if (hd) {
        //     this.setState({
        //         layout: {
        //             id: hd.id,
        //             blocktype: hd.blocktype,
        //             css: hd.css,
        //             parentid: hd.parentid,
        //             children: {

        //             }
        //         }
        //     });
        // } else {
        this.setState({
            layout: {
                children: {

                }
            }
            // })
        });

        // Recursively build the layout
        this.getBlock(this.state.htmlBlockId, true, [0]);
    }

    //____________________________________________________________________________
    // Recursively build the display on the right
    recursiveLayout(current, first, parentTagName) {

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

        let b = (<span></span>);

        let blockname = this.state.bricksByName[current.blocktype];

        let that = this;

        // If the current child's block type is an unallowed child of the parent's block type
        let badStyleClass = '';
        let badStyleMessage = '';
        if (parentTagName !== undefined) {
            console.log(that.state.bricksByName[parentTagName].unallowed_children);
            console.log(current.blocktype);
            if (that.state.bricksByName[parentTagName].unallowed_children.includes(current.blocktype)) {
                badStyleClass = 'bad-style-block';
                badStyleMessage = 'Oh no! "' + current.blocktype + '"' + " shouldn't be placed inside " + '"' + parentTagName + '"!';
            }
        }

        if (blockname != undefined &&
            (blockname.type == 'wrapper' || blockname.type == 'textwrapper')) {
            let kids = Object.keys(current.children);

            // No children
            if (kids.length === 0) {


                b = (<span>
                    {b}
                    <ExistingDropSlot handle={function () { that.moveBlock(current.id, 0) } }>
                        <DropSlot handle={function () { that.drop(current.id, 0) } }>
                            <div className="drop-slot-space">
                                &nbsp;
                            </div>
                        </DropSlot>
                    </ExistingDropSlot>
                </span>);
            } else {

                // Has children
                for (var i = 0; i < kids.length; i++) {
                    let child = current.children[kids[i]];

                    if (blockTypesToIgnore[child.blocktype] !== true) {
                        // Place a dropspace before each child
                        let index = i;
                        b = (<span>
                            {b}
                            <ExistingDropSlot handle={function () { that.moveBlock(current.id, index) } }>
                                <DropSlot handle={function () { that.drop(current.id, index) } }>
                                    <div className="drop-slot-space">
                                        &nbsp;
                                </div>
                                </DropSlot>
                            </ExistingDropSlot>
                            {this.recursiveLayout(child, i, current.blocktype)}
                        </span>);
                    } else {
                        b = (<span>{b}{this.recursiveLayout(child, i, current.blocktype)}</span>);
                    }

                    if (i === kids.length - 1) {
                        if (blockTypesToIgnore[child.blocktype] !== true) {
                            // Place a dropspace after the last child
                            let index = i + 1;
                            /*
                            b = (
                                <span>
                                    {b}
                                    <DropSlot handle={function () { that.drop(current.id, index) }}>
                                        <div className="red">
                                            <span className="yellow">-> parent: {current.id.substr(current.id.length - 3)}, index: {index}</span>
                                        </div>
                                    </DropSlot>
                                </span>
                            ); */
                            b = (<span>
                                {b}
                                <ExistingDropSlot handle={function () { that.moveBlock(current.id, index) } }>
                                    <DropSlot handle={function () { that.drop(current.id, index) } }>
                                        <div className="drop-slot-space">
                                            &nbsp;
                                    </div>
                                    </DropSlot>
                                </ExistingDropSlot>
                            </span>);
                        }
                    }
                }
            }
            // if (blockTypesToIgnore[current.blocktype] !== true) {
            //     b = (
            //         <span>
            //             {/* <li className="red">
            //                 <span className="yellow">-> parent: {current.parentid.substr(current.parentid.length - 3)}, index: 0</span>
            //             </li> */}
            //             {b}
            //         </span>
            //     );
            // }
        }

        if (blockname !== undefined && blockname.type === "content") {
            let content = current.children;
            console.log("current content: " + JSON.stringify(content));
            b = (<span></span>);
        }
        // if (current.children[0] !== undefined && current.children[0].blocktype === "text-content") {
        //     let content = current.children[0].children.content;
        //     console.log("Testing " + content);
        //     b = (<input type="text" className="editor-text-content" value={content} />);
        // }

        var blockclass;
        if (blockname !== undefined) {
            //console.log(blockname.type);
            if (blockname.type == 'wrapper') {
                blockclass = 'primary-brick layout-block';
            }
            if (blockname.type == 'text-content' || blockname.type == 'image') {
                blockclass = 'secondary-brick layout-block';
            }
            if (blockname.type == 'textwrapper') {
                blockclass = 'third-brick layout-block';
            }
        }
        if (current.blocktype !== 'text-content') {
            let startTag = '<' + current.blocktype + '>';
            // if (current.id !== undefined) {
            //     startTag = startTag + '     ' + current.id;//.slice(-2);
            // }
            let endTag = '</' + current.blocktype + '>';
            if (current.blocktype === undefined) {
                setTimeout(function () {
                    that.makeLayout();
                }, 300);
                return;
            }

            b = (
                <ul className="layout-block">
                    {(['head', 'html', 'body', 'title'].includes(current.blocktype)) &&
                        <li className={blockclass + ' ' + badStyleClass}>
                            <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) } }>
                                <div className="bad-style">{badStyleMessage}</div>
                                {startTag}
                                {/*current.id !== undefined &&
                                            <span className="yel">id: {current.id.substr(current.id.length - 3)}, index: {first} </span>
                                        */}
                            </div>
                            {b}
                            <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) } }>
                                {endTag}
                            </div>
                        </li>
                    }

                    {!(['head', 'body', 'title', 'html'].includes(current.blocktype)) &&
                        <ExistingDropSlot handle={function (e) { that.moveBlock(current.id, (Object.keys(current.children)).length, e) } }>
                            {/* <DropSlot handle={function (e) { that.drop(current.id, (Object.keys(current.children)).length, e) }}> */}
                            <ExistingBlock id={current.id} handle={function (id) { that.pickupBlock(id, current.parentid, current.index) } }>
                                <li className={blockclass + ' ' + badStyleClass}>
                                    <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) } }>
                                        <div className="bad-style">{badStyleMessage}</div>
                                        {startTag}
                                    </div>
                                    {b}
                                    <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) } }>
                                        {endTag}
                                    </div>
                                </li>
                            </ExistingBlock>
                            {/* </DropSlot> */}
                        </ExistingDropSlot>

                    }
                </ul>
            );

            //b = ({b});
        }
        else {
            let text = '';
            console.log(current);
            if (current.textContent !== undefined) {
                text = current.textContent;
            }

            // Expand block to show all text and allow user to type
            function expandEditText(blockId, newText) {
                let blockShow = document.getElementById('expanded-edit-text-' + blockId);
                let blockHide = document.getElementById('collapsed-edit-text-' + blockId);
                blockHide.classList.add('hidden')
                blockShow.classList.remove('hidden');
            }
            // Collapse text to be what it was before
            function collapseEditText(blockId, newText) {
                let blockHide = document.getElementById('expanded-edit-text-' + blockId);
                let blockShow = document.getElementById('collapsed-edit-text-' + blockId);
                if (newText) {
                    document.getElementById('input-preview-edit-text-' + blockId).value = newText;
                }
                blockHide.classList.add('hidden')
                blockShow.classList.remove('hidden');
            }

            let cIndex = current.index;

            console.log('cindex ' + cIndex);

            // Change text of block in database
            function saveEditedText(blockId) {
                let value = document.getElementById('input-edit-text-' + blockId).value;
                console.log(value);
                if (value.length > 1000) {
                    return;
                }
                // sanitize this?
                collapseEditText(blockId, value);


                fetch('https://api.webwizards.me/v1/blocks?id=' + blockId, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        'children': [value],
                        'index': -1 // don't change index
                    })
                })
                    .then(function (response) {
                        //that.getBlock(blockId);
                        //that.setup_getProjectData();
                        //that.updateProject(that.state.htmlBlockId);
                        that.handleProjectUpdates();
                    })
                    .catch(err => {
                        console.log('ERROR: ', err);
                    });
            }

            let currentId = current.id;

            b = (
                <ul className="layout-block">
                    <ExistingBlock id={currentId} handle={function (id) { that.pickupBlock(id, current.parentid, current.index) } }>
                        <li className={blockclass}>
                            {b}
                            {/* Collapsed div */}
                            <div id={'collapsed-edit-text-' + currentId}>
                                <input type="text" id={'input-preview-edit-text-' + currentId} readOnly value={text} title="Click to change text" className="editor-text-content"
                                    onClick={function () {
                                        expandEditText(currentId);
                                    } } />
                            </div>
                            {/* Expanded div */}
                            <div id={'expanded-edit-text-' + currentId} className="hidden">
                                <textarea rows="4" cols="20" maxLength="1000" className="editor-text-content editor-text-expanded" id={'input-edit-text-' + currentId} defaultValue={text} />

                                {/* Save edited text to DB*/}
                                <div className="edit-text-button btn-success" onClick={function () {
                                    saveEditedText(currentId);
                                } }>Save</div>

                                {/* Cancel editing text */}
                                <div className="edit-text-button btn-danger" onClick={function () {
                                    collapseEditText(currentId);
                                } }>Cancel</div>
                            </div>
                        </li>
                    </ExistingBlock>
                </ul>
            );
        }
        return b;
    }



    //____________________________________________________________________________
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
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    //____________________________________________________________________________
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




    //____________________________________________________________________________
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

                            // Place the current block into the layout
                            let layout = that.state.layout;
                            let location = layout;

                            // Remove the current block from the stack
                            let newStack = that.state.stack.slice(0);
                            newStack.shift();

                            let sv = that.state.stackVisited;

                            if (sv[id] === true) {
                                return;
                            }

                            sv[id] = true;
                            that.setState({
                                'stackVisited': sv
                            });

                            // Send children of the current block into the stack:
                            let newChildren = [];

                            let locked = locationInLayout.length <= 1; // Can't move or delete blocks with depth <= 2 (html, head, body)

                            //console.log('CHILDREN of : ' + id);
                            //console.log(result.children);

                            let textContent = null;

                            if (that.state.bricksById[result.blocktype].name !== 'text-content') {
                                for (var i = 0; i < result.children.length; i++) {
                                    let lil = locationInLayout.slice(0);
                                    lil.push(i);
                                    let newChild = {
                                        'id': result.children[i],
                                        'location': lil, // If parent was [0], then this is [0, i]
                                        'locked': locked,
                                        'index': i
                                    };
                                    newChildren.push(newChild);
                                }
                            } else {
                                if (result.children.length > 0) {
                                    textContent = result.children[0];
                                } else {
                                    textContent = '';
                                }
                            }
                            if (newChildren.length > 0) {
                                newStack = newChildren.concat(newStack);
                            }

                            that.setState({
                                stack: newStack
                            });

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
                            location.blocktypeid = result.blocktype
                            location.css = result.css;
                            location.attributes = result.attributes;
                            location.parentid = result.parentid;
                            location.index = result.index;
                            location.children = {}; // Filled out later from stack

                            if (textContent != null) {
                                location.textContent = textContent;
                            }

                            that.setState({
                                layout: layout
                            });

                            // Recursion
                            if (newStack.length > 0) {
                                that.getBlock(newStack[0].id, true, newStack[0].location);
                            } else {
                                //console.log('Done!');
                                // Make new layout for the right display
                                that.setState({
                                    'recursiveLayout': that.recursiveLayout(layout, true)
                                });
                            }
                        } else {
                            console.log(result);
                            return result;
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
                location.blocktype = "text-content";
                location.children = { "content": id }; // Filled out later from stack

                that.setState({
                    layout: layout
                });

                //console.log(id);
                //console.log(locationInLayout);
                console.log('ERROR: ', err);
            });
    }

    //____________________________________________________________________________
    // Click a block on the right, to move it or delete it in trash can
    pickupBlock(blockId, blockParentId, blockIndex) {
        console.log('Picked up block ' + blockId);
        if (blockId === undefined) {
            console.log('Cancelled pickup');
            this.setState({
                'selectedBrick': undefined,
                'selectedBlock': undefined
            });
            return;
        }
        this.setState({
            'selectedBrick': undefined,
            'selectedBlock': blockId,
            'block_originalParentId': blockParentId,
            'block_originalIndex': blockIndex
        });
    }



    //____________________________________________________________________________
    // Click a brick on the left
    pickup(brickName) {
        this.setState({
            'selectedBlock': undefined
        });

        if (brickName === undefined || brickName === this.state.selectedBrick) {
            this.setState({
                'selectedBrick': undefined
            });
            return;
        }
        if (this.state.bricksByName !== undefined) {
            if (this.state.bricksByName[brickName] !== undefined) {
                console.log(brickName);
                this.setState({
                    'selectedBrick': brickName,
                    'selectedBlock': undefined
                });
            }
        }
    }

    //____________________________________________________________________________
    // Place a block into the right, after picking up a brick on the left
    // The type of brick placed is determined by the brick that was picked up on the left, from state
    drop(parentId, index) {
        if (this.state.selectedBrick === undefined) {
            console.log('sb undefined');
            if (this.state.selectedBlock !== undefined) {
                console.log('move');
                // If a block is selected, call moveBlock instead
                this.moveBlock(parentId, index);
            }
            this.setState({
                'selectedBrick': undefined,
                'selectedBlock': undefined
            });

            return;
        }

        let brick = this.state.selectedBrick;
        console.log('Attempting to drop <' + brick + '> in ' + parentId + ' ' + index);


        if (brick && parentId !== undefined && index !== undefined) {
            this.pickup(); // unselect the selected brick
            console.log('drop <' + brick + '> in ' + parentId + ' ' + index);
            this.createBlock(brick, parentId, index);
        }
    }


    cssModalToggleOn(currBlock) {

        // Only do something if modal is not already up
        if (!this.state.styleToggled) {
            console.log(currBlock);
            this.setState({
                styleToggled: true,
                styleToggledBlock: currBlock
            });
        }
    }

    cssModalToggleOff() {
        this.setState({
            styleToggled: false,
            styleToggledBlock: undefined
        });
    }

    handleProjectUpdates(newBlock) {
        var that = this;
        var d = new Date();
        var timeEdited = d.toLocaleString();
        fetch('https://api.webwizards.me/v1/projects?id=' + that.state.projectId, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body:
            JSON.stringify({
            })
        })
            .then(function (response) {

                if (response.ok) {
                    console.log(response);
                    fetch('https://api.webwizards.me/v1/projects?id=' + that.state.projectId, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('Authorization')
                        }
                    })
                        .then(function (response2) {

                            if (response.ok) {
                                console.log(response2);
                                response2.json().then(function (result2) {
                                    console.log(result2);

                                    // Set projectData state
                                    that.setState({
                                        projectData: result2
                                    });
                                });
                            } else {
                                response2.text().then(text => {
                                    console.log(text);
                                });

                            }
                        })
                        .catch(err => {
                            console.log('caught it!', err);
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

    // Deleting a block from the right layout
    deleteBlock() {
        let blockId = this.state.selectedBlock;
        this.setState({
            'selectedBrick': undefined,
            'selectedBlock': undefined
        });
        if (blockId === undefined) {
            console.log('Cancelled delete');
            return;
        }
        let that = this;
        fetch('https://api.webwizards.me/v1/blocks?id=' + blockId, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            }
        })
            .then(function (response) {
                that.setup_getProjectData();
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    // Move block
    moveBlock(newParentId, newIndex) {

        console.log('_______________');
        console.log('Move block: ');
        console.log('Block id: ' + this.state.selectedBlock);
        console.log('newParentId: ' + newParentId);
        console.log('newIndex:' + newIndex);
        console.log('_______________');

        let originalParentId = this.state.block_originalParentId;
        let originalIndex = this.state.block_originalIndex;

        if (originalParentId === newParentId) {
            if (newIndex > originalIndex) {
                // Reduce index by 1 for correctness
                newIndex -= 1;
            } else if (newIndex === originalIndex) {
                // Same parent, same index, so do nothing
                return;
            }
        }

        if (this.state.selectedBrick !== undefined || this.state.selectedBlock === undefined) {
            console.log('Cancelled move');
            this.setState({
                'selectedBrick': undefined,
                'selectedBlock': undefined
            });
            return;
        }

        let that = this;

        if (!newParentId) {
            console.log('No parent id!');
            return;
        }



        fetch('https://api.webwizards.me/v1/blocks?id=' + this.state.selectedBlock, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'parentid': newParentId,
                'index': newIndex
            })
        })
            .then(function (response) {

                console.log('_________');
                console.log('VVVVVV');

                that.handleProjectUpdates();
                that.setup_getProjectData();
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    hoverDropSlot() {
        console.log("hovering");
    }



    //____________________________________________________________________________
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
                        {/*<div><h3>&nbsp;{this.state.status}</h3></div>*/}
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

                    {this.state.bricksByName !== undefined &&
                        <div>
                            <div>
                                <Block name={"div"} handler={that.pickup} title={this.state.bricksByName['div'].description}/>
                                <Block name={"p"} handler={that.pickup} title={this.state.bricksByName['p'].description}/>
                            </div>
                            <div>
                                <Block name={"img"} handler={that.pickup} title={this.state.bricksByName['img'].description}/>
                                <Block name={"text-content"} handler={that.pickup} title={this.state.bricksByName['text-content'].description}>
                                    <input type="text" name="lname" disabled value="text" className="short-text-box" />
                                </Block>
                            </div>
                            <div>
                                <Block name={"h1"} handler={that.pickup} title={this.state.bricksByName['h1'].description}/>
                                <Block name={"h2"} handler={that.pickup} title={this.state.bricksByName['h2'].description}/>
                                <Block name={"h3"} handler={that.pickup} title={this.state.bricksByName['h3'].description}/>
                                <Block name={"h4"} handler={that.pickup} title={this.state.bricksByName['h4'].description}/>
                            </div>
                            <div>
                                <ul>
                                    <li>
                                        <Block name={"ul"} handler={that.pickup} title={this.state.bricksByName['ul'].description}/>
                                        <Block name={"ol"} handler={that.pickup} title={this.state.bricksByName['ol'].description}/>
                                        <ul>
                                            <li><Block name={"li"} handler={that.pickup} title={this.state.bricksByName['li'].description}/></li>
                                        </ul>
                                    </li>
                                    
                                </ul>
                            </div>
                    </div>
                    }
                </div>
                <div className="half-width draggable-space">
                    <div>
                        {this.state.recursiveLayout === undefined &&
                            <h1>Loading...</h1>
                        }
                        {this.state.recursiveLayout !== undefined &&
                            this.state.recursiveLayout
                        }
                        <Trash handle={that.deleteBlock} />
                    </div>
                </div>

                {this.state.styleToggled &&
                    <div>
                        <CSSModal currBlock={this.state.styleToggledBlock} toggle={this.cssModalToggleOff} handleChange={this.handleProjectUpdates} />
                    </div>
                }

            </div>

        );
    }
}

export default DragDropContext(HTML5Backend)(EditPage);