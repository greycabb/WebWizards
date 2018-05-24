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
import SettingsModal from './SettingsModal';
import OutsideAlerter from './OutsideAlerter';

import img from './img/ProfilePictures/Cow.png';
import editimg from './img/edit.png';

import pickupSound from './sound/pickup.mp3';
import dropSound from './sound/drop.mp3';

class EditPage extends React.Component {
    constructor(props) {
        super(props);

        // 1. Get auth token
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        let auth = localStorage.getItem('Authorization');

        // If missing userdata, auth token, or query parameter "location", kick to login or main
        if (!ud || !auth) {
            hashHistory.push('/login');
        }
        if (!this.props.location.query || !this.props.location.query.project) {
            hashHistory.push('/main');
        }

        this.state = {

            settingsToggled: false, // Settings modal visible

            styleToggled: false, // CSS style modal visible
            styleToggledBlock: undefined, // Another CSS style modal visible

            // Check if user is on a mobile device - the editor doesn't work on mobile
            'mobileView': (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)), // If on mobile

            'error': undefined,
            'userdata': ud, // first name, last name, etc., gotten from local storage

            'selectedBrick': undefined, // Which block on the left is selected (ID)
            'selectedBlock': undefined, // Which block on the right is selected

            'projectData': undefined, // Data about the project
            'projectId': this.props.location.query.project, // id of the project from query parameter

            'bricksById': undefined, // All posible HTML blocks, will be called bricks throughout
            'bricksByName': undefined, // All possible bricks by name (div, span, etc) instead of ID

            'htmlBlockId': undefined, // ID of the root HTML block in the project data

            'layout': {}, // Layout of the right display
            'lockedEditor': true, // When API calls haven't completed, lock actions on the editor

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
                            }
                        }
                    }
                }
            */
            'stack': [], // For building the layout: order of blocks to go through
            'stackVisited': {}, // Also for building the layout: which blocks have already been visited in the stack

            'finishedBuildingHeadBody': false, // If html, head, body tags exist in the project content
            'recursiveLayout': undefined, // JSX content of the right display, built from layout
            'layoutBlockLocations': {} // A dictionary. Key: ID of different blocks, value: array of 
        };

        // 1. Setup functions
        this.setup_getProjectData = this.setup_getProjectData.bind(this); // state.projectdata
        this.getBlock = this.getBlock.bind(this); // Get information about a block

        this.setup_compareProjectUserIdToAuthTokenUserId = this.setup_compareProjectUserIdToAuthTokenUserId.bind(this); // dependent on getProjectData's user ID
        this.setup_getAllPossibleHtmlBlocks = this.setup_getAllPossibleHtmlBlocks.bind(this);

        // 1.5. Build the original project components - root, head, body, base. Maybe make these run when the project gets created
        this.setup_buildHtmlRoot = this.setup_buildHtmlRoot.bind(this); // dependent on getProjectData's content
        this.setup_buildHead = this.setup_buildHead.bind(this); // Root -> head -> body (in order, very important)
        this.setup_buildBody = this.setup_buildBody.bind(this);
        this.setup_createBaseBlock = this.setup_createBaseBlock.bind(this); // used in setup_build...s

        // 2. Editor preparation - making the layout on the right... makeLayout then recursiveLayout
        this.resetLayout = this.resetLayout.bind(this); // Clear the layout before making it, or when an error occurs
        this.makeLayout = this.makeLayout.bind(this); // Create "layout" state
        this.recursiveLayout = this.recursiveLayout.bind(this); // Using the layout state, create the display on the right

        // 3. Update project
        this.updateProject = this.updateProject.bind(this); // Update project, passing in the ID of the base HTML block
        this.handleProjectUpdates = this.handleProjectUpdates.bind(this); // Updating project

        // 4. Editor functions
        this.pickup = this.pickup.bind(this); // Grab a block for creating, deleting or moving
        this.drop = this.drop.bind(this); // Perform an action after picking up a block - create, delete, or move
        this.repairLayoutIndices = this.repairLayoutIndices.bind(this); // Change indexes of children in layout when changed

        this.createBlock = this.createBlock.bind(this); // Create a new block in the project
        this.deleteBlock = this.deleteBlock.bind(this); // Delete block
        this.moveBlock = this.moveBlock.bind(this); // Move block somewhere else
        this.changeTextContent = this.changeTextContent.bind(this); // Change text of a text content block

        // 5. CSS & settings modals
        this.cssModalToggleOn = this.cssModalToggleOn.bind(this);
        this.cssModalToggleOff = this.cssModalToggleOff.bind(this);

        this.settingToggle = this.settingToggle.bind(this);
        this.settingsHandler = this.settingsHandler.bind(this);

        // 6. Player progress
        this.increasePointsBy = this.increasePointsBy.bind(this);

        // 7. Make editor usable/unusable, since it's API call based
        this.lockEditor = this.lockEditor.bind(this);
        this.unlockEditor = this.unlockEditor.bind(this);

        //console.log('______________________');
        this.setup_getProjectData();
    }

    componentDidMount() {
        console.log('=======Start=======');
        document.title = 'Web Wizards';
    }

    //____________________________________________________________________________
    // Part 1: Setup
    //      On load, get project data and all possible HTML blocks (aka bricks)

    //____________________________________________________________________________
    // API call for getting project content JSON
    setup_getProjectData() {

        let that = this;

        // Query parameter: project ID
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
                        //console.log(result);

                        // Set projectData state
                        that.setState({
                            projectData: result
                        });
                        // document.title = result.name + ' - Web Wizards';

                        // Make sure the user is editing one of their own projects
                        that.setup_compareProjectUserIdToAuthTokenUserId();

                        // If <html> block is missing
                        if (result.content.length === 0) {
                            //console.log('Setup 1 -> A: Missing html, head, body');
                            that.setState({
                                'needsHtmlRoot': true
                            });
                        } else {
                            //console.log('Setup 1 -> B: There is html, head, body already');
                            that.setState({
                                'htmlBlockId': result.content[0]
                            });

                            // Get Start getting all blocks' data
                            that.getBlock(that.state.htmlBlockId);

                            // Make the right layout
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
                        // on error getting project data, kick to main page
                        console.log(text);
                        hashHistory.push('/main');
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
                hashHistory.push('/main');
            });
    }

    //____________________________________________________________________________
    // Called during setup_getProjectData() after the API call for getting project data completes
    // Verifies that the authorized user's user ID is the same as the edited project's user ID
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
    // Get all possible HTML blocks, creating a dictionary of blocks
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
                        for (let i = 0; i < result.length; i++) {
                            let current = result[i];
                            brickContainer[current.name] = {
                                'id': i,
                                'translation': current.translation,
                                'description': current.description,
                                'type': current.type,
                                'unallowed_children': current.unallowed_children,
                                'self_closing': current.self_closing
                            }
                        }
                        //console.log(brickContainer);
                        that.setState({
                            'bricksById': result,
                            'bricksByName': brickContainer
                        });
                        //console.log(result);

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
                        // console.log('   New block - ' + slot);
                        // console.log(result);

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

    // Clears everything on the right layout
    resetLayout() {
        // Clear stack
        this.setState({
            stack: [],
            stackVisited: {},
            layoutBlockLocations: {},
            layout: {
                children: {

                }
            }
        });
    }

    //____________________________________________________________________________
    // Get root block and all of it's children and their children to make the layout on the right
    makeLayout() {

        if (this.state.projectData === undefined) {
            return;
        }

        // Clear stack
        this.resetLayout();

        // Recursively build the layout
        this.getBlock(this.state.htmlBlockId, true, [0]);
    }

    //____________________________________________________________________________
    // Recursively build the display on the right
    //      current: ID of the current block which is the first element in the stack state
    //      first: if block is the HTML block root of the layout
    //      parentTagName: name of the parent of the current block. Used for checking if the block's parent is fine with having the current block's type as a child
    recursiveLayout(current, first, parentTagName) {

        if (!current) {
            return;
        }
        let locationInLayout = current.locationInLayout;

        // Ignore html, head, body
        const blockTypesToIgnore = {
            'html': true,
            'head': true,
            'body': true
        };

        // the overall block doesn't have anything in it, but its 0th child is the HTML root.
        if (first === true) {
            if (current.children !== undefined && current.children[0] !== undefined) {
                current = current.children[0];
                first = 0;
            } else {
                return;
            }
        }

        // Will contain the block's contents
        let b = (<span></span>);

        // Label for the block
        let blockname = this.state.bricksByName[current.blocktype];

        let that = this;

        // If the current child's block type is an unallowed child of the parent's block type
        let badStyleClass = ''; // Red outline box
        let badStyleMessage = ''; // "Oh no! [blocktype] shouldn't be placed inside [parent blocktype]'

        if (parentTagName !== undefined) {
            if (that.state.bricksByName[parentTagName].unallowed_children.includes(current.blocktype)) {
                badStyleClass = 'bad-style-block';
                badStyleMessage = 'Oh no! "' + current.blocktype + '"' + " shouldn't be placed inside " + '"' + parentTagName + '"!';
            }
        }

        // Copy children since we're modifying it
        let currentChildren = Object.assign({}, current.children);

        if (blockname != undefined &&
            (blockname.type == 'wrapper' || blockname.type == 'textwrapper')) {

            // After all children, the last slot is a slot that doesn't do any recursion, but allows blocks to be inserted here
            if (current.blocktype !== 'html') {
                currentChildren[Object.keys(currentChildren).length] = {
                    'emptySlot': true
                };
            }

            let kids = Object.keys(currentChildren);

            // Has children
            for (let i = 0; i < kids.length; i++) {
                let child = currentChildren[kids[i]];

                if (blockTypesToIgnore[child.blocktype] !== true) {
                    // Place a dropspace before each child
                    let index = i;
                    b = (<span>
                        {b}
                        <ExistingDropSlot handle={function () { that.moveBlock(current.id, index, locationInLayout) }}>
                            <DropSlot handle={function () { that.drop(current.id, index, locationInLayout) }}>
                                <div className="drop-slot-space">
                                    &nbsp;
                                </div>
                            </DropSlot>
                        </ExistingDropSlot>
                        {child.emptySlot !== true &&
                            this.recursiveLayout(child, i, current.blocktype)
                        }
                    </span>);
                } else {
                    b = (<span>{b}{this.recursiveLayout(child, i, current.blocktype)}</span>);
                }
            }
        }

        if (blockname !== undefined && blockname.type === "content") {
            let content = current.children;
            //console.log("current content: " + JSON.stringify(content));
            b = (<span></span>);
        }

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
            let startTag = '<' + current.blocktype + '>';// + current.id.slice(-2);
            let endTag = '</' + current.blocktype + '>';

            if (current.blocktype === 'img' || that.state.bricksByName[current.blocktype] !== undefined && that.state.bricksByName[current.blocktype].self_closing === true) {
                startTag = '<' + current.blocktype + ' />';
                endTag = '';
            }


            if (current.blocktype === undefined) {
                setTimeout(function () {
                    that.makeLayout();
                }, 300);
                return;
            }

            let isHeadBodyTitleOrHtml = (['head', 'body', 'title', 'html'].includes(current.blocktype));

            //console.log(current);

            function showStyles() {
                let block = document.getElementById("img-" + current.id);
                block.classList.remove('edit-img-hidden');
            }

            function hideStyles() {
                let block = document.getElementById("img-" + current.id);
                block.classList.add('edit-img-hidden')
            }

            b = (
                <ul className="layout-block">
                    <li className={blockclass + ' ' + badStyleClass} id={'layoutBlock_' + current.id}>

                        {/* <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) }}>
                            <div className="bad-style">{badStyleMessage}</div>
                            {startTag}
                        </div> */}

                        <div className="bad-style">{badStyleMessage}</div>
                        <div className="disable-select tag-block-span" onMouseOver={showStyles} onMouseLeave={hideStyles} onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) }}>

                            <div className="start-tag">{startTag}</div>
                            <img src={editimg} id={"img-" + current.id} className="edit-img edit-img-hidden" draggable="false" onClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) }} />

                        </div>
                        {((!isHeadBodyTitleOrHtml || current.blocktype === 'title') && Object.keys(current.children).length === 0 && (current.blocktype === 'li' || that.state.bricksByName[current.blocktype].type === 'textwrapper')) &&
                            <button className="black-text" onClick={function (e) { e.stopPropagation(); that.createBlock('text-content', current.id, 0, false, true); }}>Write...</button>
                        }
                        {b}
                        {(current.blocktype === 'ul' || current.blocktype === 'ol') &&
                            <button className="black-text" onClick={function (e) { e.stopPropagation(); that.createBlock('li', current.id, Object.keys(current.children).length, false, true); }}>Add &lt;li&gt;</button>
                        }
                        {endTag.length > 0 &&
                            <div className="disable-select tag-block-span" onDoubleClick={function (e) { let curcontent = current; that.cssModalToggleOn(curcontent) }}>
                                {endTag}
                            </div>
                        }
                    </li>
                </ul>
            );

            if (!isHeadBodyTitleOrHtml) {
                b = (
                    <ExistingBlock id={current.id} handle={function (id) { that.pickupBlock(id, current.parentid, current.index, locationInLayout) }}>
                        {b}
                    </ExistingBlock>
                );
            }
        }
        else {
            let text = '';
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

            // Change text of block in database
            function saveEditedText(blockId) {
                let expandedDiv = document.getElementById('expanded-edit-text-' + blockId)
                let value = document.getElementById('input-edit-text-' + blockId);

                // Make sure the block's input area exists (value), and the expanded div is not hidden
                if (!value || expandedDiv.classList.contains('hidden')) {
                    return;
                }

                that.lockEditor();

                value = value.value;

                console.log(value);
                if (value.length > 1000) {
                    return;
                }
                // sanitize this?
                collapseEditText(blockId, value);

                that.changeTextContent(blockId, value)


            }

            let currentId = current.id;

            b = (

                <div>
                    <ul className="layout-block">
                        <ExistingBlock id={currentId} handle={function (id) { that.pickupBlock(id, current.parentid, current.index, locationInLayout) }}>
                            <li className={blockclass} id={'layoutBlock_' + current.id}>
                                {b}
                                {/* Collapsed div */}
                                <div id={'collapsed-edit-text-' + currentId}>
                                    <input type="text" id={'input-preview-edit-text-' + currentId} readOnly value={text} title="Click to change text" className="editor-text-content"
                                        onClick={function () {
                                            expandEditText(currentId);
                                            that.setState({
                                                forbidDrag: true
                                            });
                                        }} />
                                </div>
                            </li>
                        </ExistingBlock>
                    </ul>
                    {/* Expanded div */}
                    <OutsideAlerter handler={() => saveEditedText(currentId)}>
                        <div id={'expanded-edit-text-' + currentId} className="hidden text-expanded-container">
                            <textarea rows="4" cols="20" maxLength="900" className="editor-text-content editor-text-expanded" id={'input-edit-text-' + currentId} defaultValue={text} />

                            {/* Save edited text to DB*/}
                            <div className="edit-text-button btn-success" onClick={function () {
                                saveEditedText(currentId);
                                that.setState({
                                    forbidDrag: false
                                });
                            }}>Save</div>

                            {/* Cancel editing text */}
                            <div className="edit-text-button btn-danger" onClick={function () {
                                collapseEditText(currentId);
                                that.setState({
                                    forbidDrag: false
                                });
                            }}>Cancel</div>

                        </div>
                    </OutsideAlerter>
                </div>
            );
        }
        return b;
    }



    //____________________________________________________________________________
    // Update project
    // blockId: the ID of the base <HTML> tag of the project's content
    updateProject(blockId) {
        //console.log('Update Project!' + blockId + '>');
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


    changeTextContent(blockId, newText) {
        let that = this;
        if (blockId !== undefined && newText !== undefined && newText.length < 1000) {
            fetch('https://api.webwizards.me/v1/blocks?id=' + blockId, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    'children': [newText],
                    'index': -1 // don't change index
                })
            })
                .then(function (response) {
                    //that.getBlock(blockId);
                    //that.setup_getProjectData();
                    //that.updateProject(that.state.htmlBlockId);
                    that.handleProjectUpdates();
                    setTimeout(function () {
                        that.unlockEditor();
                    }, 400);
                })
                .catch(err => {
                    console.log('ERROR: ', err);
                });
        }
    }

    //____________________________________________________________________________
    // slot like "title" or whatever
    // parentid is the parent of the block
    // index is the # index child the block is, of the parent
    createBlock(slot, parentId, index, textContent, fromUserAction) {

        if (slot === undefined) {
            return;
        }

        let brickId = this.state.bricksByName[slot].id;
        let that = this;

        this.lockEditor();

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
                        //console.log('New block: ' + slot);
                        //console.log(result);

                        console.log('   Created <' + slot + '> in ' + parentId + ' ' + index);

                        //if (fromUserAction !== true) {
                        if (slot === 'title') {//that.state.bricksByName[slot].type === 'textwrapper') {
                            that.updateProject(that.state.htmlBlockId);
                            that.createBlock('text-content', result.id, 0, true);
                        } else {
                            that.updateProject(that.state.htmlBlockId);
                        }
                        //}
                        if (textContent === true) {
                            that.changeTextContent(result.id, that.state.projectData.name);
                        }
                        //_________________
                        // Updating the layout object after a creation:
                        if (fromUserAction === true) {

                            //_________________
                            // CCC Updating the layout object after a creation:
                            // 1) Find the parent of the current block in layout
                            let lil = that.state.layoutBlockLocations[parentId];
                            if (lil !== undefined) {
                                let current = that.state.layout;
                                for (let i = 0; i < lil.length; i++) {
                                    current = current.children[lil[i]];
                                }
                                let parentBlock = current.id;
                                console.log('   => parent block id: ' + current.id);

                                // Get the children of the parent block in the layout
                                let childrenKeys = Object.keys(current.children);

                                // Assemble a new children object
                                let newChildrenObject = {

                                };

                                let newChild = {
                                    id: result.id,
                                    blocktype: slot,
                                    blocktypeid: result.blocktype,
                                    css: result.css,
                                    attributes: result.attributes,
                                    parentid: result.parentid,
                                    index: result.index,
                                    children: {

                                    }
                                }
                                let newChildrenObjectCurrentIndex = 0;
                                for (let i = 0; i < childrenKeys.length; i++) {
                                    let currentChild = current.children[childrenKeys[i]];
                                    if (currentChild.index === index) {
                                        let newChildLil = lil.slice();
                                        newChildLil.push(index);

                                        newChild.locationInLayout = newChildLil;
                                        newChildrenObject[newChildrenObjectCurrentIndex] = newChild;
                                        newChildrenObjectCurrentIndex += 1;
                                    }
                                    currentChild.index = newChildrenObjectCurrentIndex;
                                    currentChild.locationInLayout[currentChild.locationInLayout.length - 1] = newChildrenObjectCurrentIndex;
                                    newChildrenObject[newChildrenObjectCurrentIndex] = currentChild;
                                    newChildrenObjectCurrentIndex += 1;
                                }
                                //console.log(newChild);

                                if (childrenKeys.length === 0) {
                                    let newChildLil = lil.slice();
                                    newChildLil.push(0);

                                    newChild.locationInLayout = newChildLil;
                                    newChildrenObject[0] = newChild;
                                    newChildrenObjectCurrentIndex += 1;
                                }

                                // Set the new children
                                current.children = newChildrenObject;
                                lil.push(index);
                                that.state.layoutBlockLocations[result.id] = lil;

                                that.repairLayoutIndices(current);

                                console.log(that.state.layout);

                                that.forceUpdate();
                                that.setState({
                                    'recursiveLayout': that.recursiveLayout(that.state.layout, true)
                                });
                                //that.unlockEditor();
                            }
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
    // Used to get information about blocks, needed for building the display on the right
    // id: id of block to add to layout
    // forSetup: if the getBlockgetBlock() call is
    // locationInLayout: e.g. if it's [0, 2, 4] then you can get to the block in state.layout at 0: children: { 2: children { 4 }}
    getBlock(id, forSetup, locationInLayout) {
        // console.log('GetBlock call');

        if (id === undefined) {
            return;
        }

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
                                for (let i = 0; i < result.children.length; i++) {
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

                            for (let i = 0; i < locationInLayout.length; i++) {
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
                            location.locationInLayout = locationInLayout;

                            let layoutBlockLocations = that.state.layoutBlockLocations;
                            layoutBlockLocations[result.id] = locationInLayout;
                            that.setState({
                                'layoutBlockLocations': layoutBlockLocations
                            });



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
                                that.unlockEditor();
                            }
                        } else {
                            //console.log(result);
                            return result;
                        }
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                        that.resetLayout();
                    });

                }
            })
            .catch(err => {
                // Cannot fetch block, this is likely to just be a content child
                // Place the current block into the layout
                let layout = that.state.layout;

                let location = layout;

                for (let i = 0; i < locationInLayout.length; i++) {
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
    pickupBlock(blockId, blockParentId, blockIndex, locationInLayout) {
        console.log('[Picked up block ' + blockId + ', index ' + blockIndex + ']');
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
            'block_originalIndex': blockIndex,
            'selectedBlockLocation': locationInLayout
        });

        let snd = new Audio(pickupSound);
        snd.play();
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

        let snd = new Audio(pickupSound);
        snd.play();

        if (this.state.bricksByName !== undefined) {
            if (this.state.bricksByName[brickName] !== undefined) {
                //console.log(brickName);
                console.log('[Picked up brick <' + brickName + '>]');
                this.setState({
                    'selectedBrick': brickName,
                    'selectedBlock': undefined
                });
            }
        }
        console.log(this.state.layout);
    }

    //____________________________________________________________________________
    // Place a block into the right, after picking up a brick on the left
    // The type of brick placed is determined by the brick that was picked up on the left, from state
    drop(parentId, index, locationInLayout) {

        let snd = new Audio(dropSound);
        snd.play();

        if (this.state.selectedBrick === undefined) {
            console.log('sb undefined');
            if (this.state.selectedBlock !== undefined) {
                this.moveBlock(parentId, index, locationInLayout);
            }
            this.setState({
                'selectedBrick': undefined,
                'selectedBlock': undefined
            });

            return;
        }

        console.log('CREATE ' + parentId + ' ' + index);

        this.increasePointsBy(1);

        let brick = this.state.selectedBrick;
        console.log('   Attempting to create <' + brick + '> in ' + parentId + ' ' + index);

        this.lockEditor();

        if (brick && parentId !== undefined && index !== undefined) {
            this.pickup(); // unselect the selected brick

            this.createBlock(brick, parentId, index, false, true);
        }
    }


    cssModalToggleOn(currBlock) {

        // Only do something if modal is not already up
        if (!this.state.styleToggled) {
            // console.log(currBlock);
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
                    // console.log(response);
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
                                // console.log(response2);
                                response2.json().then(function (result2) {
                                    // console.log(result2);

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

        let snd = new Audio(dropSound);
        snd.play();

        console.log('DELETE ' + blockId);
        console.log('   Attempting to delete ' + blockId);
        console.log(this.state.layout);

        this.lockEditor();

        // this.premodifyRecursiveLayout('delete', {
        //     'blockid': blockId
        // });

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
                console.log('   Deleted ' + blockId);
                //that.setup_getProjectData();

                //_________________
                // CCC Updating the layout object after a deletion:
                // 1) Find the parent of the current block
                let lil = that.state.layoutBlockLocations[blockId];
                if (lil !== undefined) {

                    // Find the parent block's location in the layout
                    let current = that.state.layout;
                    for (let i = 0; i < lil.length - 1; i++) {
                        current = current.children[lil[i]];
                    }
                    let parentBlock = current.id;
                    console.log('   => parent block id: ' + current.id);

                    // Get the children of the parent block in the layout
                    let childrenKeys = Object.keys(current.children);

                    // Assemble a new children object
                    let newChildrenObject = {

                    };
                    let newChildrenObjectCurrentIndex = 0;
                    for (let i = 0; i < childrenKeys.length; i++) {
                        let currentChild = current.children[childrenKeys[i]];
                        if (currentChild.id !== blockId) {

                            // Adjust index and LIL of the child
                            currentChild.index = newChildrenObjectCurrentIndex;
                            currentChild.locationInLayout[currentChild.locationInLayout.length - 1] = newChildrenObjectCurrentIndex;

                            newChildrenObject[newChildrenObjectCurrentIndex] = currentChild;
                            newChildrenObjectCurrentIndex += 1;
                        }
                    }

                    // Set the new children
                    current.children = newChildrenObject;

                    // Remove the deleted block from layoutBlockLocations state
                    delete that.state.layoutBlockLocations[blockId];

                    that.repairLayoutIndices(current);

                    // Update object state & reload the right layout, then unlock editor
                    that.forceUpdate();
                    that.setState({
                        'recursiveLayout': that.recursiveLayout(that.state.layout, true)
                    });
                    that.unlockEditor();
                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    // Move block
    moveBlock(newParentId, newIndex, locationInLayout, blockIsLastChild) {

        let snd = new Audio(dropSound);
        snd.play();

        console.log(this.state.layout);

        let originalNewIndex = newIndex;

        // console.log('_______________');
        // console.log('Move block: ');
        // console.log('Block id: ' + this.state.selectedBlock);
        // console.log('newParentId: ' + newParentId);
        // console.log('oldIndex ' + this.state.block_originalIndex);
        // console.log('newIndex:' + newIndex);
        // console.log('_______________');

        let blockId = this.state.selectedBlock;

        console.log('MOVE ' + blockId + ' ' + this.state.block_originalIndex + ' to ' + newParentId + ' ' + newIndex);

        // If a block is selected, call move block instead
        if (this.state.selectedBlockLocation !== undefined && locationInLayout !== undefined) {
            if (locationInLayout.toString().startsWith(this.state.selectedBlockLocation.toString())) {
                console.log("   Block can't be moved there!");
                return;
            }
        }

        let originalParentId = this.state.block_originalParentId;
        let originalIndex = this.state.block_originalIndex;

        if (originalParentId === newParentId) {
            if (newIndex > originalIndex) {
                // Reduce index by 1 for correctness
                newIndex -= 1;
            }
            if (newIndex === originalIndex) {
                // Same parent, same index, so do nothing
                console.log('   Same parent, same index, do nothing')
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
            console.log('No new parent id!');
            return;
        }

        this.lockEditor();


        console.log('   Attempting to move ' + this.state.selectedBlock + ' ' + this.state.block_originalIndex);

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
                console.log('   Moved ' + that.state.selectedBlock + ' ' + that.state.block_originalIndex);
                that.handleProjectUpdates();
                that.setup_getProjectData();

                //_________________
                // let lil = that.state.layoutBlockLocations[blockId]; // Block's old parent
                // let lilNew = that.state.layoutBlockLocations[newParentId];
                // if (lil !== undefined && lilNew !== undefined) {
                //     // CCC Move Step 1: Delete the block from the parent in the layout
                //     // Find the parent block's location in the layout

                //     console.log('Part 1');


                //     let current = that.state.layout;
                //     for (let i = 0; i < lil.length - 1; i++) { // -1 because we're getting the deleted block's parent
                //         current = current.children[lil[i]];
                //     }
                //     let parentBlock = current.id;

                //     // Get the children of the parent block in the layout
                //     let childrenKeys = Object.keys(current.children);

                //     // Assemble a new children object
                //     let newChildrenObject = {

                //     };
                //     let newChildrenObjectCurrentIndex = 0;
                //     let deletedChild = null;
                //     for (let i = 0; i < childrenKeys.length; i++) {
                //         let currentChild = current.children[childrenKeys[i]];
                //         if (currentChild.id !== blockId) {

                //             // Adjust index and LIL of the child
                //             currentChild.index = newChildrenObjectCurrentIndex;
                //             currentChild.locationInLayout[currentChild.locationInLayout.length - 1] = newChildrenObjectCurrentIndex;

                //             newChildrenObject[newChildrenObjectCurrentIndex] = currentChild;
                //             newChildrenObjectCurrentIndex += 1;
                //         } else {
                //             deletedChild = currentChild;
                //         }
                //     }
                //     // Set the new children of the old block location
                //     current.children = newChildrenObject;

                //     if (deletedChild !== null) {

                //         //_________________
                //         // Step 2: Add the previously layout-deleted block to its new location
                //         // Go to parent block location
                //         let current2 = that.state.layout;
                //         console.log('Part 2');

                //         for (let i = 0; i < lilNew.length; i++) {
                //             current2 = current2.children[lilNew[i]];
                //         }
                //         parentBlock = current2.id;

                //         childrenKeys = Object.keys(current2.children);

                //         let newChildrenObject2 = {

                //         };
                //         newChildrenObjectCurrentIndex = 0;
                //         for (let i = 0; i < childrenKeys.length; i++) {
                //             let currentChild = current2.children[childrenKeys[i]];
                //             if (currentChild.index === originalNewIndex) {
                //                 let deletedChildLil = lilNew.slice();
                //                 deletedChildLil.push(originalNewIndex);
                //                 console.log(deletedChildLil);

                //                 deletedChild.index = newIndex;
                //                 deletedChild.locationInLayout = deletedChildLil;
                //                 newChildrenObject2[newChildrenObjectCurrentIndex] = deletedChild;
                //                 newChildrenObjectCurrentIndex += 1;
                //             }
                //             currentChild.index = newChildrenObjectCurrentIndex;
                //             currentChild.locationInLayout[currentChild.locationInLayout.length - 1] = newChildrenObjectCurrentIndex;
                //             newChildrenObject2[newChildrenObjectCurrentIndex] = currentChild;
                //             newChildrenObjectCurrentIndex += 1;
                //         }
                //         console.log('CC');
                //         console.log(newChildrenObject2);

                //         current2.children = newChildrenObject2;
                //         console.log('Part 2 over');

                //         //lilNew.push(newIndex);
                //         that.state.layoutBlockLocations[blockId] = lilNew;

                //         that.repairLayoutIndices(current);
                //         if (current2.id !== current.id) {
                //             that.repairLayoutIndices(current2);
                //         }
                //     }
                //     console.log(that.state.layout);

                //     that.forceUpdate();

                //     // Update object state & reload the right layout, then unlock editor

                //     that.setState({
                //         'recursiveLayout': that.recursiveLayout(that.state.layout, true)
                //     });
                //     that.unlockEditor();

                //}

            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    increasePointsBy(points) {

        var that = this;

        var newPoints = this.state.userdata.points + points;

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'points': newPoints
            })
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        var ud = that.state.userdata;
                        ud.points = newPoints;
                        localStorage.setItem('USERDATA', JSON.stringify(ud));
                        console.log('   +' + points + ' points');
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    settingToggle() {
        this.setState({
            settingsToggled: !this.state.settingsToggled
        })
    }

    settingsHandler(result) {
        this.setState({
            projectData: result
        });
    }

    // Lock editor when loading stuff/making changes
    lockEditor() {
        //console.log('LOCK ON');
        this.setState({
            'lockedEditor': true
        });
    }

    // Unlock editor when the API calls complete
    unlockEditor() {
        console.log('___________________')
        this.setState({
            'lockedEditor': false
        });
    }

    // Repair indexes of affected blocks when manually editing, creating, deleting
    // Pass in the parent of the updated block, 2nd and 3rd parameters 
    repairLayoutIndices(current, parentLocationInLayout, index) {

        //console.log('RLC ' + current.id + ' ' + current.locationInLayout + ' ' + index);
        if (current === undefined) {
            return;
        }

        if (parentLocationInLayout && index !== undefined) {

            //console.log(current.blocktype);
            //console.log('     Old LIL: ' + current.locationInLayout);

            let newLil = parentLocationInLayout.slice();
            newLil.push(index);
            current.locationInLayout = newLil;
            current.index = index;

            //console.log('    New LIL: ' + current.locationInLayout);

            this.state.layoutBlockLocations[current.id] = newLil;
        }//else {
            //console.log('PARENT ' + current.blocktype);
        //}

        let childrenKeys = Object.keys(current.children);
        for (var i = 0; i < childrenKeys.length; i++) {
            this.repairLayoutIndices(current.children[childrenKeys[i]], current.locationInLayout.slice(), i);
        }
    }

    // 

    //____________________________________________________________________________
    render() {

        // Recursively build layout...

        // Don't put append or prepends for these 3 base block types


        let that = this;

        let editorClasses = 'half-width draggable-space';
        if (this.state.lockedEditor === true) {
            editorClasses += ' locked-editor';
        }

        let errorCountMessage = '';
        let errorCount = document.querySelectorAll('.bad-style-block').length;
        if (errorCount === 1) {
            errorCountMessage = 'Oops! 1 block is in the wrong place.';
        } else {
            errorCountMessage = 'Oops! ' + errorCount + ' blocks are in the wrong place.';
        }

        var urlstring = "#/project/" + this.state.projectId;

        if (this.state.mobileView) {
            return (
                <div id="mobile-view">
                    <img src={img} width="400px" /><br />
                    Sorry! The Web Wizards editor only works on a computer.
                </div>
            )
        }

        return (

            <div>
                {this.state.userdata !== null && this.state.userdata.userName !== undefined &&
                    <Nav username={this.state.userdata.userName} />
                }
                <div className="half-width">
                    <div className="edit-bar">
                        {/*<div><h3>&nbsp;{this.state.status}</h3></div>*/}
                        <Link to="/main"><button className="btn yellow-button">Back</button></Link>
                        {this.state.projectId != undefined && this.state.projectData != undefined &&
                            <span>
                                <a href={urlstring} target="_blank"><button className="btn yellow-button">View Page</button></a>
                                <button className="btn yellow-button" onClick={this.settingToggle}>Settings</button>
                                <h2 className="editor-project-title">{this.state.projectData.name}</h2>
                            </span>
                        }
                    </div>
                    {this.state.projectData != undefined &&
                        <PreviewProject projectObject={this.state.projectData} />
                    }

                    {this.state.bricksByName !== undefined &&
                        <table>
                            <tbody>
                                <tr>
                                    {/* <h3>Click and drag one of these blocks into the right!</h3> */}
                                    <td>
                                        <Block name={"h1"} handler={that.pickup} title={this.state.bricksByName['h1'].description} />
                                        <Block name={"h2"} handler={that.pickup} title={this.state.bricksByName['h2'].description} />
                                        <Block name={"h3"} handler={that.pickup} title={this.state.bricksByName['h3'].description} />
                                        <Block name={"h4"} handler={that.pickup} title={this.state.bricksByName['h4'].description} />
                                        <br />
                                        <Block name={"p"} handler={that.pickup} title={this.state.bricksByName['p'].description} />
                                    </td>
                                    <td className="block-choices-category-column">
                                        <Block name={"img"} handler={that.pickup} title={this.state.bricksByName['img'].description} />
                                        <Block name={"text-content"} handler={that.pickup} title={this.state.bricksByName['text-content'].description}>
                                            <input type="text" name="lname" disabled value="text" className="short-text-box" />
                                        </Block>
                                    </td>
                                    <td className="block-choices-category-column">
                                        <Block name={"div"} handler={that.pickup} title={this.state.bricksByName['div'].description} />
                                        <Block name={"span"} handler={that.pickup} title={this.state.bricksByName['span'].description} />
                                        <br />
                                        <Block name={"ul"} handler={that.pickup} title={this.state.bricksByName['ul'].description} />
                                        <Block name={"ol"} handler={that.pickup} title={this.state.bricksByName['ol'].description} />
                                        <ul>
                                            <li><Block name={"li"} handler={that.pickup} title={this.state.bricksByName['li'].description} /></li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    }
                </div>
                <div className={editorClasses}>
                    {this.state.lockedEditor === true &&
                        <div className="loading-message">
                            Loading...
                        </div>
                    }
                    {(this.state.lockedEditor === false && errorCount > 0) &&
                        <div className="error-count" title="Try dragging the red blocks into the trash can!">
                            <div>
                                {errorCountMessage}
                            </div>
                        </div>
                    }
                    <div>
                        {/*this.state.recursiveLayout === undefined &&
                            <h1>Loading...</h1>
                        */}
                        {this.state.recursiveLayout !== undefined &&
                            this.state.recursiveLayout
                        }
                        <Trash handle={that.deleteBlock} />
                    </div>
                </div>


                {this.state.styleToggled &&
                    <div>
                        <CSSModal increasePointsBy={this.increasePointsBy} currBlock={this.state.styleToggledBlock} toggle={this.cssModalToggleOff} handleChange={this.handleProjectUpdates} />
                    </div>
                }
                {this.state.settingsToggled &&
                    <SettingsModal handle={this.settingsHandler} toggle={this.settingToggle} private={this.state.projectData.private} name={this.state.projectData.name} id={this.state.projectId} />
                }

            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(EditPage);