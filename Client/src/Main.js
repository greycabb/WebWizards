import React from 'react';
import { hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';
import img from './img/ProfilePictures/Cow.png';
import AvatarDisplay from './AvatarDisplay';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        // Userdata and authentication token
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        let auth = localStorage.getItem('Authorization');

        if (!ud || !auth) {
            hashHistory.push('/login');
        }

        var mobileView = false;

        if (window.innerWidth < 801) {
            console.log(window.innerWidth);
            mobileView = true;
        }

        this.state = {
            'error': undefined,
            'userdata': ud,
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
                    this.getAllUserProjects();
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
            if (ud.username !== undefined) {
                this.state.username = ud.username;
            }
        }
        // Get project data
    }

    // Get all projects for user
    getAllUserProjects() {
        let that = this;
        console.log(this.state.userdata);
        if (this.state.userdata === undefined || this.state.userdata === null) {
            hashHistory.push('/login');
            return;
        } else {
            fetch('https://api.webwizards.me/v1/user/projects?id=' + this.state.userdata.id, {
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
                    <div className="project-in-list" key={project.id} onClick={function () { hashHistory.push('/edit?project=' + project.id); }} >
                        <div className="project-square"><img src={project.img} width="180px"/></div>
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
                {!this.state.mobileView && this.state.userdata && this.state.userdata.username !== undefined &&
                    <div>
                        <Nav username={this.state.userdata.username} />
                        <div className="main-content">
                            <CreateBanner />
                            <div id="profileAndAwards" className="profile-and-awards">
                                <AvatarDisplay />
                                <div className="profile-name">
                                    <div>My Awards</div>
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
                        <img src={img} width="400px"/><br />
                        Oops! Web Wizards only works on a computer!
                    </div>
                }
            </div>

        );
    }
}