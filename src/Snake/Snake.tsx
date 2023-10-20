import cx from 'classnames';
import Hammer from 'hammerjs';
import React from 'react';

import { Direction, setSnakeDirection, useSnake } from '../SnakeState/SnakeState';
import styles from './Snake.module.css';

export type SnakeProps = {
  mySnake?: boolean;
  snakeId: string;
  boardDimensions?: { height: number; width: number };
  onGameOver: () => void;
};

const Snake = ({
  mySnake,
  snakeId,
  boardDimensions = { height: 1000, width: 1000 },
  onGameOver,
}: SnakeProps) => {
  const snake = useSnake(snakeId);

  React.useEffect(() => {
    if (!mySnake) return;

    const handleDirectionInput = (direction: Direction ) => {
      if (snake?.direction === 'D' || snake?.direction === 'U') {
        if (direction === 'R') {
            setSnakeDirection(snakeId, 'R');
        }
        if (direction === 'L') {
            setSnakeDirection(snakeId, 'L');
        }
    }
    if (snake?.direction === 'L' || snake?.direction === 'R') {
        if (direction === 'D') {
            setSnakeDirection(snakeId, 'D');
        }
        if (direction === 'U') {
            setSnakeDirection(snakeId, 'U');
        }
    }
    }

    const handleKeyPress = (ev: KeyboardEvent) => {
        handleDirectionInput(ev.key.replace('Arrow', '')[0] as Direction);
    };
    document.addEventListener('keyup', handleKeyPress);
    var manager = new Hammer.Manager(document.body);
    var swipe = new Hammer.Swipe();
    manager.add(swipe);
    
    const handleSwipeLeft = () => {
      handleDirectionInput('L');
    }
    const handleSwipeRight = () => {
      handleDirectionInput('R');
    }
    const handleSwipeUp =() => {
      handleDirectionInput( 'U');
    }
    const handleSwipeDown = () => {
      handleDirectionInput('D');
    };

    manager.on('swipeleft', handleSwipeLeft)
    manager.on('swiperight', handleSwipeRight)
    manager.on('swipeup', handleSwipeUp);
    manager.on('swipedown', handleSwipeDown);

    return () => {
      manager.off('swipeleft', handleSwipeLeft);
      manager.off('swiperight', handleSwipeRight);
      manager.off('swipeup', handleSwipeUp);
      manager.off('swipedown', handleSwipeDown);

      document.removeEventListener('keyup', handleKeyPress);
    }
  }, [mySnake, snake?.direction])

  React.useEffect(() => {
    if (snake?.dead && mySnake) {
      onGameOver();
    }
  }, [snake?.dead]);

  if (!snake) return null;
  
  return (
    <div className={cx(styles.container)}>
      {snake?.positioning.map((position) => {
        if (!position.x || !position.y) return null;
        return (
          <div
            className={styles.snakeBody}
            key={`${snakeId}${position.x}${position.y}`}
            style={{
              top: `${(boardDimensions.height) * position.y}px`,
              left: `${(boardDimensions.width) * position.x}px`,
              backgroundColor: snake?.color,
            }}
          />
        );
      })}
    </div>
  );
};

export default Snake;
