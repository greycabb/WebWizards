import React from 'react';
import './FeaturedProjects.css';

export default class FeaturedProjects extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="featured-main-content">
                <div className="featured-projects">
                    <div>Featured Projects</div>
                    <div className="featured-projects-wrapper">
                        <div className="featured-projects-list">
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Harry Potter's Chamber</div>
                                <div className="project-creator">michael123</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">My Little Pony</div>
                                <div className="project-creator">andrewvuong</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Ms. Joy's 5th Grade Class</div>
                                <div className="project-creator">alexisberks</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Dawgs for Daze</div>
                                <div className="project-creator">nnelody</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Pokemon Fans Only</div>
                                <div className="project-creator">pikachu</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Hokages Hangout</div>
                                <div className="project-creator">naruto</div>
                            </div>
                            <div className="featured-project-in-list">
                                <div className="project-square"></div>
                                <div className="project-title">Cats Rool Dogs Drool</div>
                                <div className="project-creator">a sad person</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}