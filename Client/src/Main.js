import React from 'react';
import { hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';
import img from './img/ProfilePictures/Cow.png';
import AvatarDisplay from './AvatarDisplay';
import PointBar from './PointBar';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        // Userdata and authentication token
        let ud = localStorage.getItem('USERDATA');
        let auth = localStorage.getItem('Authorization');

        if (!ud || !auth) {
            hashHistory.push('/login');
        }

        var udJson;

        if (this.isJsonString(ud)) {
            udJson = JSON.parse(ud);
        }
        else {
            udJson = {};
        }

        var mobileView = false;

        // if (window.innerWidth < 801) {
        //     console.log(window.innerWidth);

        //     mobileView = true;
        // }
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
            mobileView = true;
        }

        this.state = {
            'error': undefined,
            'userdata': udJson,
            'projects': undefined, // List of projects
            'width': window.innerWidth,
            'mobileView': mobileView
        };

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            }
        })
            .then((response) => {

                if (response.ok) {
                    console.log("logged in");
                    response.json().then((result) => {
                        console.log(result);
                        let userdata = {
                            'userName': result.userName,
                            'firstName': result.firstName,
                            'lastName': result.lastName,
                            'id': result.id,
                            'email': result.email,
                            'points': result.points,
                            'avatar': result.avatar
                        };
                        this.getAllUserProjects(userdata);
                    });
                } else {
                    response.text().then(text => {
                        hashHistory.push('/login');
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
                hashHistory.push('/login');
            });

        if (ud) {
            if (ud.userName !== undefined) {
                this.state.userName = ud.userName;
            }
        }
        // Get project data
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    componentDidMount() {

        let auth = localStorage.getItem('Authorization');

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            }
        })
            .then((response) => {

                if (response.ok) {
                    console.log("logged in");
                    response.json().then((result) => {
                        console.log(result);
                        let userdata = {
                            'userName': result.userName,
                            'firstName': result.firstName,
                            'lastName': result.lastName,
                            'id': result.id,
                            'email': result.email,
                            'points': result.points,
                            'avatar': result.avatar
                        };
                        this.getAllUserProjects(userdata);
                    });
                } else {
                    response.text().then(text => {
                        hashHistory.push('/login');
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
                hashHistory.push('/login');
            });
    }

    // Get all projects for user
    getAllUserProjects(newUserData) {
        var ud = newUserData;
        let that = this;
        if (newUserData === undefined || newUserData === null) {
            hashHistory.push('/login');
            return;
        } else {
            fetch('https://api.webwizards.me/v1/user/projects?id=' + newUserData.id, {
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
                            console.log(ud);
                            localStorage.setItem('USERDATA', JSON.stringify(ud));
                            that.setState({
                                'userdata': ud,
                                'projects': result.reverse() // Reversed array so that newer projects appear first
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
    }

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    render() {

        // Scrolling list with projects in it
        const ProjectsInList = ({ projects }) => (
            <div>
                {projects.map(project => (
                    <div className="project-in-list" key={project.id} onClick={function () { hashHistory.push('/edit?project=' + project.id); } } >
                        <div className="project-square"><img src={project.img} width="180px" /></div>
                        {project.name !== '' &&
                            <div className="project-title">{project.name}</div>
                        }
                        {project.name === '' &&
                            <div className="project-title"><i>untitled</i></div>
                        }
                    </div>
                ))}
            </div>
        );

        return (
            <div>
                {!this.state.mobileView && this.state.userdata && this.state.userdata.userName !== undefined &&
                    <div>
                        <Nav username={this.state.userdata.userName} />
                        <div className="main-content">
                            <CreateBanner />
                            <div className="profile-and-awards">
                                <AvatarDisplay avatar={this.state.userdata.avatar} />
                                <div className="profile-name">
                                    <PointBar points={this.state.userdata.points} />
                                </div>
                            </div>
                            <div id="yourProjects" className="your-projects">
                                <div>Your Projects</div>
                                <div className="projects-list">
                                    {this.state.projects !== undefined &&
                                        <ProjectsInList projects={this.state.projects} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.mobileView &&
                    <div id="mobile-view">
                        <img src={img} width="400px" /><br />
                        Oops! Web Wizards only works on a computer!

                        <div>Continue regardless</div>
                    </div>
                }
            </div>

        );
    }
}