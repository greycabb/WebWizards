import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockTypes } from './BlockTypes';
import { DropTarget } from 'react-dnd';
import img from './img/trash.png';
import './Trash.css';

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

class Trash extends Component {

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
          <div className="trash-bin">
              <img src={img} width="50px"/>
          </div>
        }
        
        {isOverCurrent &&
          <div className="trash-bin trash-bin-hover">
            <img src={img} width="50px" />
          </div>
        }
      </div>
    );
  }
}

Trash.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    isOverCurrent: PropTypes.bool.isRequired,
    greedy: PropTypes.bool,
		children: PropTypes.node,
};
  
export default DropTarget(BlockTypes.BLOCK, target, collect)(Trash);
