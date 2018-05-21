import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import './CSSModal.css';
import OutsideAlerter from './OutsideAlerter';
import ColorPickerInput from './ColorPickerInput';
import ImageLibrary from './ImageLibrary';

export default class CSSModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cssGroups: [],
            currAppliedCss: this.props.currBlock.css,
            currAppliedAttributes: this.props.currBlock.attributes,
            viewingCategory: false,
            hidden: true,
            allCssGroupData: [],
            buttons: [],
            attributes: []
        };

        this.handle = this.handle.bind(this);
        this.goBack = this.goBack.bind(this);
        this.populateInputBoxes = this.populateInputBoxes.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.attributeHandler = this.attributeHandler.bind(this);
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
                        var attributes = result.attributes;
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

                                            var attributesBoxes = [];
                                            if (attributes) {
                                                // Add attribute input boxes here
                                                for (var i = 0; i < attributes.length; i ++) {
                                                    var current = attributes[i];
                                                    // Check to see if this attribute currently exists
                                                    var existing = "";
                                                    for (var j = 0; j < that.state.currAppliedAttributes.length; j ++) {
                                                        if (that.state.currAppliedAttributes[j].includes(current)) {
                                                            existing = that.state.currAppliedAttributes[j];
                                                            // only want value
                                                            // "alt='a value'" ==> "a value"
                                                            existing = existing.substring(current.length + 2, existing.length - 1);
                                                            break;
                                                        }
                                                    }
                                                    var useImagePicker = false;
                                                    if (current == "src") {
                                                        useImagePicker = true;
                                                    }
                                                    attributesBoxes.push(<AttributeInputBox useImagePicker={useImagePicker} key={current} attributeName={current} val={existing} handle={that.attributeHandler} />);
                                                }
                                            }

                                            that.setState({
                                                buttons: buttons,
                                                cssGroups: cssGroups,
                                                allCssGroupData: result2,
                                                attributes: attributesBoxes,
                                                possibleAttributes: attributes
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

    attributeHandler(name, value) {

        var that = this;
        
        console.log(name);
        console.log(value);

        var found = false;

        let currAttributes = that.state.currAppliedAttributes;

        if (!currAttributes) {
            currAttributes = [];
        }

        for (let j = 0; j < currAttributes.length; j ++) {
            console.log(currAttributes[j]);
            if (currAttributes[j].includes(name)) {
                currAttributes[j] = name + "=\"" + value + "\"";
                found = true;
                break;
            }
        }
        if (!found) {
            currAttributes.push(name + "=\"" + value + "\"");
        }

        //Patch to API
        fetch('https://api.webwizards.me/v1/blocks?id=' + this.props.currBlock.id, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'attributes': currAttributes,
                'index': -1//this.props.currBlock.index
            })
        })
            .then((response) => {

                if (response.ok) {
                    response.json().then((result) => {

                        var attributesBoxes = [];

                        if (this.state.possibleAttributes) {
                            // Add attribute input boxes here
                            for (var i = 0; i < this.state.possibleAttributes.length; i ++) {
                                var current = this.state.possibleAttributes[i];
                                // Check to see if this attribute currently exists
                                var existing = "";
                                console.log(currAttributes);
                                for (var j = 0; j < currAttributes.length; j ++) {
                                    if (currAttributes[j].includes(current)) {
                                        existing = currAttributes[j];
                                        // only want value
                                        // "alt='a value'" ==> "a value"
                                        existing = existing.substring(current.length + 2, existing.length - 1);
                                        break;
                                    }
                                }
                                var useImagePicker = false;
                                if (current == "src") {
                                    useImagePicker = true;
                                }
                                attributesBoxes.push(<AttributeInputBox useImagePicker={useImagePicker} key={current} attributeName={current} val={existing} handle={that.attributeHandler} />);
                            }
                        }
                        this.props.handleChange(result);
                        this.props.increasePointsBy(2);
                        this.setState({
                            currAppliedAttributes: currAttributes,
                            attributes: attributesBoxes
                        });
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });
    }

    populateInputBoxes(cat) {
        return new Promise((resolve, reject) => {
            // Find all attributes
            var attributes = [];
            for (let i = 0; i < this.state.allCssGroupData.length; i++) {
                if (this.state.allCssGroupData[i].name == cat) {
                    attributes = this.state.allCssGroupData[i].attributes;
                    break;
                }
            }
            var inputBoxes = new Array(attributes.length + "");
            var inputCount = 0;
            // Attribute boxes
            /* this.state.currAppliedCss = [{attribute: "", value: ""}, {}] */
            for (let i = 0; i < attributes.length; i ++) {
                let defaultVal; 
                for (let k = 0; k < this.state.currAppliedCss.length; k++) {
                    if (attributes[i] == this.state.currAppliedCss[k].attribute) {
                        defaultVal = this.state.currAppliedCss[k].value;
                        break;
                    }
                }

                //Get all attribute data
                fetch('https://api.webwizards.me/v1/cssattributes?attr=' + attributes[i], {
                    method: 'GET',
                })
                    .then((response) => {

                        if (response.ok) { 
                            response.json().then((result) => {
                                inputBoxes[i] = (<CSSInputBox key={attributes[i]} name={attributes[i]} currentVal={defaultVal} object={result} handleChange={this.handleValueChange}/>);
                                inputCount ++;
                                if (inputCount == attributes.length) {
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

    handleValueChange(attribute, value) {

        //Grab current value
        var curr = this.state.currAppliedCss;
        var exists = false;

        for (let i = 0; i < curr.length; i ++) {
            if (curr[i].attribute == attribute) {
                exists = true;
                curr[i].value = value;
            }
        }

        this.props.increasePointsBy(1);

        console.log(attribute);
        console.log(value);

        if (!exists) {
            curr.push({attribute: attribute, value: value});
        }

        //Patch to API
        fetch('https://api.webwizards.me/v1/blocks?id=' + this.props.currBlock.id, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'css': curr,
                'index': -1//this.props.currBlock.index
            })
        })
            .then((response) => {

                if (response.ok) {
                    response.json().then((result) => {
                        console.log(curr);
                        this.props.handleChange(result);
                        this.setState({
                            currAppliedCss: curr
                        });
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
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
                                    {this.state.attributes}
                                    {this.state.buttons}
                                    {this.state.attributes.length == 0 && this.state.buttons.length == 0 &&
                                        <span>There are no styles to edit for &lt;{this.props.currBlock.blocktype}&gt;</span>
                                    }
                                </div>
                            }
                            {this.state.viewingCategory &&
                                <div>
                                    <div className="css-modal-top-bar">
                                        <div id="css-modal-back-button" className="disable-select" onClick={this.goBack}>&#x276e;</div>
                                        <h2 className="css-modal-category-header">{this.state.currentCategory} CSS</h2>
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

class AttributeInputBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            val: this.props.val
        }
        this.handle = this.handle.bind(this);
        this.handleImg = this.handleImg.bind(this);
    }

    handleImg(img) {
        this.props.handle(this.props.attributeName, img);
        this.setState({
            val: img
        });
    }

    handle(e) {
        this.props.handle(this.props.attributeName, e.target.value);
        this.setState({
            val: e.target.value
        });
    }

    /*
        <AttributeInputBox attributeName={} val={} handle={this.attributeHandler(name, value)} />
    */

    render() {

        return (
            <div className="css-input">
                <span className="css-input-title">
                    {this.props.attributeName}
                </span>
                <span className="css-input-selections">
                    {this.props.useImagePicker &&
                        <ImageLibrary currentImg={this.state.val} handleChange={this.handleImg} />
                    }
                    {!this.props.useImagePicker &&
                        <input type="text" value={this.state.val} onChange={this.handle}/>
                    }
                </span>
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

        var currentVal = " ";

        if (!this.props.currentVal) {
            currentVal = this.props.object.default;
        }
        else {
            currentVal = this.props.currentVal;
        }

        // Sizing options
        var chosenUnit;
        var numValue;

        console.log(this.props.object);

        if (this.props.object.extra_options || this.props.name == "background-image") {
            //Need to parse value and determine unit type
            if (this.props.object.units == 'px' || currentVal.includes("px")) {
                if (currentVal.includes("px")) {
                    numValue = currentVal.substring(0, currentVal.length - 2);
                }
                else {
                    numValue = currentVal;
                }
                chosenUnit = "pixels";
            }
            if (currentVal.includes("%")) {
                numValue = currentVal.substring(0, currentVal.length - 1);
                chosenUnit = "percentage";
            }
            if (currentVal.includes("url")) {
                numValue = currentVal.substring(4, currentVal.length - 2);
                console.log(numValue);
            }
        }

        this.state = {
            value: currentVal,
            numValue: numValue,
            chosenUnit: chosenUnit
        }

        console.log(numValue);
        console.log(currentVal);

        this.colorImgHandler = this.colorImgHandler.bind(this);
        this.valHandler = this.valHandler.bind(this);
        this.multiValHandler = this.multiValHandler.bind(this);
        this.typeValHandler = this.typeValHandler.bind(this);
    }

    colorImgHandler(val) {
        var trueVal = val;
        if (this.props.name == "background-image") {
            val = "url('" + val + "')";
        }
        this.props.handleChange(this.props.name, val);
        this.setState({
                value: trueVal
        });
    }

    valHandler(event) {
        this.props.handleChange(this.props.name, event.target.value);
        this.setState({
            value: event.target.value
        });
    }
    
    typeValHandler(event) {
        var stringVal = event.target.value;
        if (event.target.value == "auto") {
            stringVal = "auto";
        }
        if (event.target.value == "pixels") {
            stringVal = "300px";
        }
        if (event.target.value == "percentage") {
            stringVal = "100%";
        }
        this.props.handleChange(this.props.name, stringVal);
        this.setState({
            value: stringVal,
            chosenUnit: event.target.value
        });
    }

    multiValHandler(event) {
        var stringVal = event.target.value;
        if (this.state.chosenUnit == "pixels") {
            console.log(stringVal);
            stringVal += "px";
            console.log(stringVal);
        }
        if (this.state.chosenUnit == "percentage") {
            stringVal += "%";
        }
        this.props.handleChange(this.props.name, stringVal);
        this.setState({
            value: stringVal,
            numValue: event.target.value
        });
    }

    render() {

        var options = [];

        if (this.props.object.extra_options && this.props.object.extra_options.choices) {
            for (let i = 0; i < this.props.object.extra_options.choices.length; i ++) {
                options.push(<option value={this.props.object.extra_options.choices[i]} key={i}>
                                {this.props.object.extra_options.choices[i]}
                            </option>);
            }
        }

        return (
            <div className="css-input">
                <span className="css-input-title">{this.props.name}: </span>
                <div className="css-input-selections">
                    {this.props.object.units == 'rgb' &&
                        <ColorPickerInput default={this.state.value} handle={this.colorImgHandler}/>
                    }
                    {this.props.object.units == 'EO_choices' && this.props.object.extra_options.choices &&
                        <select className="css-select"  value={this.state.value} onChange={this.valHandler}>
                            {options}
                        </select>
                    }
                    {this.props.object.units == 'EO_choices' && this.props.object.extra_options.range &&
                        <span className="css-input-selections">
                            {this.state.numValue} pixels
                            <input type="range" min={this.props.object.extra_options.range[0]} max={this.props.object.extra_options.range[1]} value={this.state.value}  onChange={this.valHandler} className="slider" id="myRange"/>
                        </span>
                    }
                    {this.props.object.units == 'EO_many_choices' && this.props.object.extra_options.choices &&
                        <div className="css-input-selections">
                            {this.state.value}
                            <select className="css-select"  value={this.state.chosenUnit} onChange={this.typeValHandler}>
                                {options}
                            </select>
                            {this.state.chosenUnit == "pixels" &&
                                <input type="range" min={this.props.object.extra_options.pixels[0]} max={this.props.object.extra_options.pixels[1]} value={this.state.numValue}  onChange={this.multiValHandler} className="slider" id="myRange"/>
                            }
                            {this.state.chosenUnit == "percentage" &&
                                <input type="range" min={this.props.object.extra_options.percentage[0]} max={this.props.object.extra_options.percentage[1]} value={this.state.numValue}  onChange={this.multiValHandler} className="slider" id="myRange"/>
                            }
                        </div>
                    }
                    {this.props.object.units == 'px' &&
                        <span className="css-input-selections">
                            {this.state.numValue} pixels
                            <input type="range" min={this.props.object.extra_options.range[0]} max={this.props.object.extra_options.range[1]} value={this.state.numValue}  onChange={this.multiValHandler} className="slider" id="myRange"/>
                        </span>
                    }
                    {this.props.object.units == "image" &&
                        <ImageLibrary currentImg={this.state.numValue} handleChange={this.colorImgHandler} />
                    }
                </div>
            </div>
        );

    }
}