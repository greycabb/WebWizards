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

export default DragSource(BlockTypes.BLOCK, blockSource, collect)(Block);