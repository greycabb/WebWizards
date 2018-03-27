import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';

export default class EditPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined,

            'username': undefined,
            'selectedBrick': undefined, // Which block on the left is selected (ID)

            'projectData': undefined
        };


        this.getProjectData = this.getProjectData.bind(this);
        this.translateProjectData = this.translateProjectData.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.do = this.do.bind(this);
        this.undo = this.undo.bind(this);
        this.componentDidMount2 = this.componentDidMount2.bind(this);
        this.componentDidMount3 = this.componentDidMount3.bind(this);
        this.getAuthData = this.getAuthData.bind(this);

    }


    /*


        Should have a spinner while the authorization stuff is loading


    */




    componentDidMount() {
        document.title = 'Web Wizards';

        // 1. Get auth token
        let auth = localStorage.getItem('Authorization');

        // If no auth token, kick to login page
        if (!auth) {
            hashHistory.push('/login');
        }
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        if (ud) {
            if (ud.username !== undefined) {
                this.state.username = ud.username;
            }
        }

        let that = this;

        let attempts = 0;

        this.getProjectData();

        let timerAttempts = setInterval(function () {

            if (that.state.projectData !== undefined) {
                clearInterval(timerAttempts);
                that.componentDidMount2();
                return;
            }

            attempts++;
            if (attempts > 30) {
                hashHistory.push('/main');
            }
        }, 500);

        this.getAuthData();
    }

    // Since API call is delayed, here's part 2 of CDM once projectdata is retrieved properly
    componentDidMount2() {
        var that = this;
        
        // 2. Project creator user ID compared to auth token's user ID
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
                        if (that.state.projectData.userid == result.id) {
                            that.componentDidMount3();
                        } else {
                            // Kick to main page
                            hashHistory.push('/main');
                        }
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

    componentDidMount3() {
        // Load project contents on the right

        // Unhide the left content bricks
    }

    //______________________
    // Functions

    // API call for getting project content JSON
    getProjectData() {

        let that = this;

        // Query parameter: project: project ID
        let pid = this.props.location.project;

        // Call
        fetch('https://api.webwizards.me/v1/projects', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'id': pid
            })
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        console.log(result);

                        that.setState({
                            projectData: result
                        });
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
            })
    }

    // Get data for authorization
    getAuthData() {

    }
    // Convert project JSON -> HTML, for the preview
    translateProjectData() {

    }

    // Translate project JSON -> the stuff on the right
    updateContent() {

    }

    // Make a change, update project
    do() {

    }

    // Undo a change, update project
    undo() {

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