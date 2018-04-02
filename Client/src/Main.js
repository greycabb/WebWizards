import React from 'react';
import { hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        // Userdata and authentication token
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        let auth = localStorage.getItem('Authorization');

        if (!ud || !auth) {
            hashHistory.push('/login');
        }

        this.state = {
            'error': undefined,
            'userdata': ud,
            'projects': undefined // List of projects
        };

        // Get project data
        this.getAllUserProjects();
    }

    // Get all projects for user
    getAllUserProjects() {
        let that = this;
        if (this.state.userdata === undefined) {
            hashHistory.push('/login');
            return;
        }
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

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    render() {

        // Scrolling list with projects in it
        const ProjectsInList = ({ projects }) => (
            <div>
                {projects.map(project => (
                    <div className="project-in-list" key={project.id} onClick={function () { hashHistory.push('/edit?project=' + project.id); }} >
                        <div className="project-square"></div>
                        <div className="project-title">{project.name}</div>
                    </div>
                ))}
            </div>
        );

        return (
            <div>
                <Nav username={this.state.userdata.username} />
                {/* <div className="welcomebox">
                    <div>Welcome, {this.state.username}!</div>
                    <br />
                    
                </div> */}
                <div className="main-content">
                    <CreateBanner />
                    <div id="profileAndAwards" className="profile-and-awards">
                        <div className="profile-picture"></div>
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

        );
    }
}