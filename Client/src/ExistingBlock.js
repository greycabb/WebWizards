import React from 'react';
import { Link } from 'react-router';
import HTML5Backend from 'react-dnd-html5-backend';
import { BlockTypes } from './BlockTypes';
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'

const blockSource = {

    canDrag(props) {

        var elements = document.getElementsByClassName("text-expanded-container");

        if (elements.length > 0) {

            var hasExpanded = false;

            for (var i = 0; i < elements.length; i ++) {
                if (!elements[i].classList.contains("hidden")) {
                    hasExpanded = true;
                    break;
                };
            }
            return !hasExpanded;
        }
	},

    beginDrag(props) {

        props.handle(props.id);
        return {
            id: props.id,
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
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ forbidDrag: nextProps.forbidDrag });  
    }

    render() {

        const { connectDragSource, isDragging } = this.props;

        return connectDragSource(
            <div>
                {this.props.children}
            </div>
        );
    }
}

Block.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };


export default DragSource(BlockTypes.EXISTING, blockSource, collect)(Block);