import React from 'react';
import { Link } from 'react-router';
import HTML5Backend from 'react-dnd-html5-backend';
import { BlockTypes } from './BlockTypes';
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'

const blockSource = {
	beginDrag(props) {
        props.handler(props.name)
		return {
			name: props.name,
		}
    }
}

function collect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
    }
  }
  

class Block extends React.Component {
    constructor(props) {
        super(props);
        var classes = "brick ";

        var primaryBricks = ["div", "span", "ul", "ol", "li"];
        var secondaryBricks = ["img", "text-content"];
        var thirdBricks = ["h1", "h2", "h3", "h4", "p"];

        for (var i = 0; i < primaryBricks.length; i++) {
            if (primaryBricks[i] == this.props.name) {
                classes += "primary-brick"
            }
        }

        for (var i = 0; i < secondaryBricks.length; i++) {
            if (secondaryBricks[i] == this.props.name) {
                classes += "secondary-brick"
            }
        }

        for (var i = 0; i < thirdBricks.length; i++) {
            if (thirdBricks[i] == this.props.name) {
                classes += "third-brick"
            }
        }

        this.state = {
            classes: classes,
        }
    }


    render() {

        const { connectDragSource, isDragging } = this.props;

        return connectDragSource(
            <div className={this.state.classes} id={this.props.name} title={this.props.title}>
                {this.props.name != "text-content" &&
                    <div>
                        {this.props.name}
                    </div>
                }
                {this.props.name == "text-content" &&
                    <div>
                        {this.props.children}
                    </div>
                }
            </div>
        );
    }
}

Block.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

export default DragSource(BlockTypes.BLOCK, blockSource, collect)(Block);