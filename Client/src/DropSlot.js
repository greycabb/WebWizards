import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockTypes } from './BlockTypes';
import { DropTarget } from 'react-dnd';

const target = {
    drop(props, monitor, component) {
      const hasDroppedOnChild = monitor.didDrop()
      if (!hasDroppedOnChild) {
        props.handle();
      }
      else {
        return;
      }
      component.setState({
        hasDropped: true,
        hasDroppedOnChild,
      });
    }
  };

function collect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    };
  }

class DropSlot extends Component {

  constructor(props) {
		super(props)
		this.state = {
			hasDropped: false,
			hasDroppedOnChild: false,
		}
	}

  render() {

    const { connectDropTarget, isOver, isOverCurrent, greedy, children } = this.props;
    const { hasDropped, hasDroppedOnChild } = this.state

    return connectDropTarget(
      <div>
        {!isOverCurrent &&
          <div className="drop-slot">
              {this.props.children}
          </div>
        }
        
        {isOverCurrent &&
          <div className="drop-slot-hover">
            {this.props.children}
          </div>
        }
      </div>
    );
  }
}

DropSlot.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    isOverCurrent: PropTypes.bool.isRequired,
    greedy: PropTypes.bool,
		children: PropTypes.node,
};
  
export default DropTarget(BlockTypes.BLOCK, target, collect)(DropSlot);
