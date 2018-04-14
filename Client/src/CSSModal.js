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
            allCssGroupData: []
        };

        this.handle = this.handle.bind(this);
        this.goBack = this.goBack.bind(this);
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
                        console.log(cssGroups);
                        var allCssGroupData;
                        fetch('https://api.webwizards.me/v1/cssgroups', {
                            method: 'GET',
                        })
                            .then((response) => {

                                if (response.ok) {
                                    response.json().then(function (result2) {
                                        console.log(result2)
                                        that.setState({
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

    handle(cat) {
        this.setState({
            viewingCategory: true,
            currentCategory: cat
        });
    }

    goBack() {
        this.setState({
            viewingCategory: false,
            currentCategory:''
        });
    }

    render() {

        var buttons = [];
        var inputBoxes = [];
        if (!this.state.viewingCategory && this.state.cssGroups) {
            var categories = this.state.cssGroups;
            for (var i = 0; i < categories.length; i++) {
                var current = categories[i];
                buttons.push(<CSSModalButton key={current} category={current} handle={this.handle}/>);
            }
        }
        if (this.state.viewingCategory) {
            // Find all attributes
            var attributes;
            for (var i = 0; i < this.state.allCssGroupData.length; i++) {
                if (this.state.allCssGroupData[i].name == this.state.currentCategory) {
                    attributes = this.state.allCssGroupData[i].attributes;
                    break;
                }
            }
            // Attribute boxes
            /* this.state.currAppliedCss = [{attribute: "", value: ""}, {}] */
            for (var i = 0; i < attributes.length; i ++) {
                var defaultVal; 
                for (var i = 0; i < this.state.currAppliedCss.length; i++) {
                    if (attribute[i] == this.state.currAppliedCss[i].attribute) {
                        defaultVal = this.state.currAppliedCss[i].value;
                        break;
                    }
                }
                fetch('https://api.webwizards.me/v1/cssattributes?attr=' + attribute[i], {
                    method: 'GET',
                })
                    .then((response) => {

                        if (response.ok) {
                            response.json().then(function (result) {
                                // DO STUFF


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

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup" className="css-modal-popup">
                            {!this.state.viewingCategory &&
                                <div className="modal-buttons-container">
                                    <h2>Edit &lt;{this.props.currBlock.blocktype}&gt; Styles</h2>
                                    {buttons}
                                    {buttons.length == 0 &&
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
                                    {inputBoxes}
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
                    {this.state.name}
                    {this.state.units == 'rgb' &&
                        <ColorPickerInput />
                    }
                </span>
            </div>
        );

    }
}