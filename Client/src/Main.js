import React from 'react';
import { hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';
import img from './img/ProfilePictures/Cow.png';
import AvatarDisplay from './AvatarDisplay';
import PointBar from './PointBar';
import ProjectInList from './ProjectInList';

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
            console.log('Mobile');
            mobileView = true;
        }

        this.state = {
            'error': undefined,
            'userdata': udJson,
            'projects': undefined, // List of projects
            'width': window.innerWidth,
            'mobileView': mobileView,
            'projectList': []
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

        this.deleteProject = this.deleteProject.bind(this);

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

    deleteProject(id) {
        var that = this;
        // Must call on API and immediately redirect to main page
        fetch('https://api.webwizards.me/v1/projects?id=' + id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            }
        })
            .then(function (response) {

                //remove this project from list
                that.getAllUserProjects(that.state.userdata);
                

            })
            .catch(err => {
                console.log('ERROR: ', err);
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
                            console.log(result);
                            localStorage.setItem('USERDATA', JSON.stringify(ud));

                            var projectList = [];

                            result.forEach((project) => {
                                projectList.push(
                                    <ProjectInList key={project.id} id={project.id} img={project.img} name={project.name} mobileView={that.state.mobileView} 
                                        redirectEdit={()=> {that.redirectEdit(project.id)}} deleteProject={()=> {that.deleteProject(project.id)}}/>
                                );
                            });

                            that.setState({
                                'userdata': ud,
                                'projects': result.reverse(), // Reversed array so that newer projects appear first
                                'projectList': projectList
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

    redirectEdit(projectid) {
        hashHistory.push('/edit?project=' + projectid);
    }

    render() {

        // Scrolling list with projects in it
        /*const ProjectsInList = ({ projects }) => (

            <div>
                {projects.map(project =>(
                    <ProjectInList key={project.id} id={projects.id} img={project.img} name={project.name} mobileView={this.state.mobileView} 
                        redirectEdit={()=> {this.redirectEdit(project.id)}} deleteProject={()=> {this.deleteProject(project.id)}}/>
                ))}
            </div>

        ); */

        return (
            <div>
                {this.state.userdata && this.state.userdata.userName !== undefined &&
                    <div>
                        <Nav username={this.state.userdata.userName} />
                        <div className="main-content">
                            <CreateBanner mobileView={this.state.mobileView} toggle={false}/>
                            <div className="profile-and-awards">
                                <AvatarDisplay avatar={this.state.userdata.avatar} />
                                <div className="profile-name">
                                    <PointBar points={this.state.userdata.points} />
                                </div>
                            </div>
                            <div id="yourProjects" className="your-projects">
                                <div>Your Projects</div>
                                {this.state.mobileView &&
                                    <div className="grey-text">Changing your website only works on a computer, but you can still view your sites here.</div>
                                }
                                <div className="projects-list">
                                    {this.state.projectList.length == 0 &&
                                        <span>Loading...</span>
                                    }
                                    {this.state.projectList}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {/*this.state.mobileView &&
                    <div id="mobile-view">
                        <img src={img} width="400px" /><br />
                        Oops! Web Wizards only works on a computer!

                        <div>Continue regardless</div>
                    </div>
                */}
            </div>

        );
    }
}