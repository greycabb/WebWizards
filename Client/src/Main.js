import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined,
            'username': undefined,
        };

        let auth = localStorage.getItem('Authorization');

        if (!auth) {
            hashHistory.push('/login');
        }
        let ud = JSON.parse(localStorage.getItem('USERDATA'));
        if (ud) {
            if (ud.username !== undefined) {
                this.state.username = ud.username;
            }
        }
    }

    componentDidMount() {
        document.title = 'Web Wizards';
    }

    render() {
        return (
            <div>
                <Nav username={this.state.username}/>
                {/* <div className="bluebox">
                    <div>Welcome, {this.state.username}!</div>
                    <br />
                    
                </div> */}
                <div className="main-content">
                    <div id="profileAndAwards" className="profile-and-awards">
                        <div className="profile-picture"></div>
                        <div className="profile-name">
                            <div>Hi, {this.state.username}!</div><br/>
                            <div>Awards</div>
                        </div>
                    </div>
                    <div id="yourProjects" className="your-projects">
                        <div>Your Projects</div>
                        <div className="projects-list">
                            <div className="project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Img Tags</div>
                            </div>
                            <div className="project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Basic HTML</div>
                            </div>
                            <div className="project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">CSS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}