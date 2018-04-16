import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockTypes } from './BlockTypes';
import { DropTarget } from 'react-dnd';

const target = {
    drop(props, monitor) {
        props.handle();
    }
  };

function collect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver()
    };
  }

class DropSlot extends Component {
  render() {

    const { connectDropTarget, isOver } = this.props;

    return connectDropTarget(
        <div>
            {this.props.children}
        </div>
    );
  }
}

DropSlot.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
};
  
export default DropTarget(BlockTypes.BLOCK, target, collect)(DropSlot);
