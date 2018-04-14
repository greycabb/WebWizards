import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import './CSSModal.css';
import OutsideAlerter from './OutsideAlerter';
import ColorPickerInput from './ColorPickerInput';

export default class CSSModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cssGroups: [],
            currAppliedCss: this.props.currBlock.css,
            viewingCategory: false,
            hidden: true,
            allCssGroupData: [],
            buttons: []
        };

        this.handle = this.handle.bind(this);
        this.goBack = this.goBack.bind(this);
        this.populateInputBoxes = this.populateInputBoxes.bind(this);
    }

    componentWillMount() {
        var that = this;
        fetch('https://api.webwizards.me/v1/htmlblocks?id=' + this.props.currBlock.blocktypeid, {
            method: 'GET',
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        var cssGroups = result.css_groups;
                        var allCssGroupData;
                        if (cssGroups) {
                            fetch('https://api.webwizards.me/v1/cssgroups', {
                                method: 'GET',
                            })
                                .then((response) => {

                                    if (response.ok) {
                                        response.json().then(function (result2) {

                                            var buttons = [];
                                            var categories = cssGroups;
                                            for (var i = 0; i < categories.length; i++) {
                                                var current = categories[i];
                                                buttons.push(<CSSModalButton key={current} category={current} handle={that.handle}/>);
                                            }

                                            that.setState({
                                                buttons: buttons,
                                                cssGroups: cssGroups,
                                                allCssGroupData: result2
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

    populateInputBoxes(cat) {
        console.log("beginning input population");
        return new Promise((resolve, reject) => {
            var inputBoxes = [];
            // Find all attributes
            var attributes = [];
            for (let i = 0; i < this.state.allCssGroupData.length; i++) {
                if (this.state.allCssGroupData[i].name == cat) {
                    attributes = this.state.allCssGroupData[i].attributes;
                    break;
                }
            }
            // Attribute boxes
            /* this.state.currAppliedCss = [{attribute: "", value: ""}, {}] */
            for (let i = 0; i < attributes.length; i ++) {
                let defaultVal; 
                for (let k = 0; k < this.state.currAppliedCss.length; k++) {
                    if (attributes[k] == this.state.currAppliedCss[k].attribute) {
                        defaultVal = this.state.currAppliedCss[k].value;
                        break;
                    }
                }

                //Get all attribute data
                fetch('https://api.webwizards.me/v1/cssattributes?attr=' + attributes[i], {
                    method: 'GET',
                })
                    .then((response) => {

                        console.log("fetching " + attributes[i] +  " attribute");

                        if (response.ok) { 
                            response.json().then(function (result) {
                                inputBoxes.push(<CSSInputBox key={attributes[i]} name={attributes[i]} currentVal={defaultVal} object={result}/>);
                                if (inputBoxes.length == attributes.length) {
                                    resolve(inputBoxes);
                                }
                            });


                        } else {
                            response.text().then(text => {
                                console.log(text);
                                reject(text);
                            });

                        }
                    })
                    .catch(err => {
                        console.log('caught it!', err);
                        reject(err);
                    }); 
            }
        });
    }

    handle(cat) {
        this.populateInputBoxes(cat)
            .then((inputBoxes) => {
                console.log("reached");
                this.setState({
                    inputBoxes: inputBoxes,
                    viewingCategory: true,
                    currentCategory: cat
                });
            });
    }

    goBack() {
        this.setState({
            viewingCategory: false,
            currentCategory:''
        });
    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup" className="css-modal-popup">
                            {!this.state.viewingCategory &&
                                <div className="modal-buttons-container">
                                    <h2>Editing &lt;{this.props.currBlock.blocktype}&gt;</h2>
                                    {this.state.buttons}
                                    {this.state.buttons.length == 0 &&
                                        "There are no CSS styles to change"
                                    }
                                </div>
                            }
                            {this.state.viewingCategory &&
                                <div>
                                    <div className="css-modal-top-bar">
                                        <div id="css-modal-back-button" className="disable-select" onClick={this.goBack}>&#x276e;</div>
                                        <h2 className="css-modal-category-header">{this.state.currentCategory}</h2>
                                    </div>
                                    {this.state.inputBoxes}
                                </div>
                            }
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}

class CSSModalButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <button className="btn css-modal-button" onClick={() => this.props.handle(this.props.category)}>
                {this.props.category}
            </button>
        );
    }
}

/*<CSSInputBox name={"color"} currentVal={"pink"} updateVal={this.updateVal} object={
    {
		"translation": "Text color",
		"description": "Changes the color of the text",
		"units": "rgb",
		"default": "black"
	}
}/> */

class CSSInputBox extends React.Component {
    constructor(props) {
        super(props);

        var currentVal;

        if (!this.props.currentVal) {
            currentVal = this.props.object.default;
        }
        else {
            currentVal = this.props.currentVal;
        }

        this.state = {
            name: this.props.name,
            units: this.props.object.units,
            value: currentVal
        }

    }

    render() {

        return (
            <div className="css-input">
                <span>
                    {this.props.name}
                    {this.props.units == 'rgb' &&
                        <ColorPickerInput />
                    }
                </span>
            </div>
        );

    }
}