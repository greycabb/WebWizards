import React from 'react';
import { Link, hashHistory } from 'react-router';
import { SketchPicker } from 'react-color';
import './ColorPickerInput.css';
import OutsideAlerter from './OutsideAlerter';

export default class ColorPickerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            background: '#ffffff',
            hidden: true
          };
        this.clicked = this.clicked.bind(this);
        this.closed = this.closed.bind(this);
    }

    clicked() {
        this.setState({hidden: false});
    }

    closed() {
        this.setState({hidden: true});
    }

    handleChangeComplete = (color) => {
        this.props.handle(color.hex);
        this.setState({ background: color.hex });
      };    

    render() {

        return (
            <div>
                <input type="text" name="color" className="color-input" spellcheck="false" value={this.state.background} onClick={this.clicked}/>
                {!this.state.hidden &&
                    <OutsideAlerter handler={this.closed}>
                        <SketchPicker color={ this.state.background }
                            onChangeComplete={ this.handleChangeComplete }
                            disableAlpha={true}/>
                    </OutsideAlerter>
                }
            </div>
        );
    }
}