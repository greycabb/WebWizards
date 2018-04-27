import React from 'react';
import './FeaturedProjects.css';
import { hashHistory } from 'react-router';

export default class FeaturedProjects extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projects: []
        }
        
    }

    componentWillMount() {
        var projects = [];
        for (var i = 0; i < this.props.ids.length; i ++) {
            fetch('https://api.webwizards.me/v1/projects?id=' + this.props.ids[i], {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {

                    if (response.ok) {
                        response.json().then((result) => {
                            fetch('https://api.webwizards.me/v1/users?id=' + result.userid, {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then((response2) => {

                                    if (response2.ok) {
                                        response2.json().then((result2) => {
                                            var projectsObj = result;
                                            projectsObj.userName = result2.userName
                                            projects.push(projectsObj);
                                            if (projects.length == this.props.ids.length) {
                                                this.setState({
                                                    projects: projects
                                                })
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
    /*
    <div id="yourProjects" className="your-projects">
        <div>Your Projects</div>
        <div className="projects-list">
            {this.state.projects !== undefined &&
                <ProjectsInList projects={this.state.projects} />
            }
        </div>
    </div> */

    render() {

        // Scrolling list with projects in it
        const ProjectsInList = ({ projects }) => (
            <div>
                {projects.map(project => (
                    <div className="featured-project-in-list" key={project.id} onClick={function () { hashHistory.push('/project/' + project.id); }} >
                        <div className="project-square"><img src={project.img} width="180px"/></div>
                        {project.name !== '' && 
                            <div className="project-title">{project.name}</div>
                        }
                        {project.name === '' &&
                            <div className="project-title"><i>untitled</i></div>
                        }
                        <div className="project-creator">{project.userName}</div>
                    </div>
                ))}
            </div>
        );

        return (

            <div className="featured-main-content">
                <div className="featured-projects">
                    <div>Featured Projects</div>
                    <div className="featured-projects-wrapper">
                        <div className="featured-projects-list">
                            {this.state &&
                                <ProjectsInList projects={this.state.projects} />
                            }  
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}