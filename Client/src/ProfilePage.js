import React from 'react';
import { hashHistory, Link } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';
import img from './img/ProfilePictures/Cow.png';
import AvatarDisplay from './AvatarDisplay';
import PointBar from './PointBar';

export default class ProfilePage extends React.Component {
    constructor(props) {
        super(props);

        var mobileView = false;

        if (window.innerWidth < 801) {
            console.log(window.innerWidth);
            mobileView = true;
        }

        this.state = {
            'error': undefined,
            'userdata': undefined,
            'projects': undefined, // List of projects
            'width': window.innerWidth,
            'mobileView': mobileView
        };

        fetch('https://api.webwizards.me/v1/users?name=' + this.props.params.username, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
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
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {

                    if (response.ok) {
                        response.json().then(function (result) {
                            var publicProjects = [];
                            for (var i = 0; i < result.length; i ++) {
                                if (result[i].private == 'n') {
                                    publicProjects.push(result[i]);
                                }
                            }
                            that.setState({
                                'userdata': ud,
                                'projects': publicProjects.reverse() // Reversed array so that newer projects appear first
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
        document.title = 'Web Wizards Profile';
    }

    render() {

        // Scrolling list with projects in it
        const ProjectsInList = ({ projects }) => (
            <div>
                {projects.map(project => (
                    <div className="project-in-list" key={project.id} onClick={function () { hashHistory.push('/project/' + project.id); }} >
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
                {!this.state.mobileView && this.state.userdata && this.state.userdata.userName !== undefined &&
                    <div>
                        <nav className="navbar navbar-default header">
                            <Link to="/main"><h1 className="title navbar-title disable-select">Web Wizards</h1></Link>
                        </nav>
                        <div className="main-content">
                            <h1>{this.state.userdata.userName}</h1>
                            <div className="profile-and-awards">
                                <AvatarDisplay avatar={this.state.userdata.avatar} isProfilePage={true} />
                                <div className="profile-name">
                                    <PointBar points={this.state.userdata.points}/>
                                </div>
                            </div>
                            <div id="yourProjects" className="your-projects">
                                <div>Shared Projects</div>
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