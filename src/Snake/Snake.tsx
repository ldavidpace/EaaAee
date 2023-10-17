import cx from 'classnames';
import React from 'react';

import { setSnakeDirection, useSnake } from '../SnakeState/SnakeState';
import styles from './Snake.module.css';

export type SnakeProps = {
  snakeId: string;
  myColor: string;
  mySnake?: boolean;
  boardDimensions?: { height: number; width: number };
  onGameOver: () => void;
};

const Snake = ({
  snakeId,
  myColor,
  mySnake,
  boardDimensions = { height: 1000, width: 1000 },
  onGameOver,
}: SnakeProps) => {
  const snake = useSnake(snakeId, mySnake, myColor);

  React.useEffect(() => {
    const handleKeyPress = (ev: KeyboardEvent) => {
        if (snake?.direction === 'D' || snake?.direction === 'U') {
            if (ev.key === 'ArrowRight') {
                setSnakeDirection(snakeId, 'R');
            }
            if (ev.key === 'ArrowLeft') {
                setSnakeDirection(snakeId, 'L');
            }
        }
        if (snake?.direction === 'L' || snake?.direction === 'R') {
            if (ev.key === 'ArrowDown') {
                setSnakeDirection(snakeId, 'D');
            }
            if (ev.key === 'ArrowUp') {
                setSnakeDirection(snakeId, 'U');
            }
        }
    };
    document.addEventListener('keyup', handleKeyPress);
    return () => {
        document.removeEventListener('keyup', handleKeyPress);
    }
  }, [snake?.direction])
  React.useEffect(() => {
    if (snake?.dead) {
      onGameOver();
    }
  }, [snake?.dead]);

  if (!snake) return null;
  return (
    <div className={cx(styles.container)}>
      {snake?.positioning.map((position) => {
        return (
          <div
            className={styles.snakeBody}
            key={`${position.x}${position.y}`}
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
