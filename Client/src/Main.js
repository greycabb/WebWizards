import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';
import CreateBanner from './CreateBanner';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'error': undefined,
            'username': undefined,
        };

        let auth = localStorage.getItem('Authorization');

        fetch('https://api.webwizards.me/v1/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            }
        })
            .then(function (response) {

                if (response.ok) {
                    console.log("logged in");
                } else {
                    response.text().then(text => {
                        hashHistory.push('/login');
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            })

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