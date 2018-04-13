import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import './CSSModal.css';
import OutsideAlerter from './OutsideAlerter';

export default class CSSModal extends React.Component {
    constructor(props) {
        super(props);
        var cssGroups;
        fetch('https://api.webwizards.me/v1/htmlblocks?id=' + this.props.currBlock.blocktypeid, {
            method: 'GET',
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        cssGroups = result.css_groups;
                        console.log(cssGroups);
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
        this.state = {
            cssGroups: cssGroups
        }
    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup" className="css-modal-popup">
                            <h2>Edit &lt;{this.props.currBlock.blocktype}&gt; Styles</h2>
                            
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}