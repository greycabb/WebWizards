import React from 'react';
import { SketchPicker } from 'react-color';
import './ColorPickerInput.css';
import OutsideAlerter from './OutsideAlerter';

export default class ColorPickerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            background: this.props.default,
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
            <div className="color-picker-input">
                <input type="text" name="color" style={{backgroundColor: this.state.background}} className="color-input" readOnly spellCheck="false" value={this.state.background} onClick={this.clicked}/>
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