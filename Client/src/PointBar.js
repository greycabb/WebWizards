import React from 'react';
import './PointBar.css';

export default class PointBar extends React.Component {
    constructor(props) {
        super(props);

        var points = this.props.points;
        var tier = "";
        var max;

        if (points < 50) {
            tier = "Beginner";
            max = 50;
        }
        if (points > 49 && points < 799) {
            tier = "Apprentice";
            max = 800;
        }
        if (points > 799 && points < 4999) {
            tier = "Expert";
            max = 5000;
        }
        if (points > 4999) {
            tier = "Master";
            max = "Infinity";
        }

        this.state = {
            tier: tier,
            max: max,
            hovering: false
        }

        this.hoveringToggle = this.hoveringToggle.bind(this);

    }

    hoveringToggle(bool) {
        this.setState({
            hovering: bool
        });
    }

    render() {

        var fillWidth = (this.props.points / this.state.max * 100) + "%";

        return (
            <div>
                <h3 className="tier-display">{this.state.tier} Wizard</h3>
                <h3 className="points-display">{this.props.points} / {this.state.max}</h3>
                <div id="point-bar-container">
                    <div id="point-bar-fill" style={{width: fillWidth}}>
                        
                    </div>
                </div>
                <div className="point-tooltip-container">
                    <span onMouseEnter={()=> {this.hoveringToggle(true)}} onMouseLeave={()=> {this.hoveringToggle(false)}}>What can you do next?</span>
                </div>
                {this.state.hovering &&
                    <div id="point-tooltip">
                        Earn points by making and designing websites! When you level up, you will unlock new avatars.
                    </div>
                }
            </div>
        );
    }
}