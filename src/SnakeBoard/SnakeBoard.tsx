import cx from 'classnames';
import React from 'react';
import { useWindowSize } from 'react-use';

import Apple from '../Apple/Apple';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import {
    setBoardDimensions, useAllApples, useAllSnakeIds, useSnakeScore
} from '../SnakeState/SnakeState';
import styles from './SnakeBoard.module.css';

const Snake = React.lazy(() => import('../Snake/Snake'));

export type SnakeBoardProps = {
  myColor: string;
  mySnakeId?: string;
  myName: string;
  gameId?: string;
  onGameOver: () => void;
  onQuitGame: () => void;
};

const SnakeBoard = ({ mySnakeId, onGameOver, onQuitGame }: SnakeBoardProps) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const myScore = useSnakeScore(mySnakeId);
  const allSnakeIds = useAllSnakeIds();
  const allAppleIds = useAllApples();
  const windowSize = useWindowSize();
  React.useEffect(() => {
    if (!boardRef.current) return;
    setBoardDimensions({
      height: boardRef.current.clientHeight,
      width: boardRef.current.clientWidth,
    });
  }, [windowSize.height, windowSize.width]);

  return (
    <div ref={boardRef} className={cx(styles.container)}>
      {mySnakeId && <div>Score: {myScore}</div>}
      {mySnakeId && (
        <button className={styles.closeButton} onClick={onQuitGame}>
          X
        </button>
      )}
      <ScoreBoard />
      {allSnakeIds.map((snakeId) => (
        <React.Suspense fallback={<div />}>
          <Snake
            mySnake={snakeId === mySnakeId}
            key={snakeId}
            snakeId={snakeId}
            onGameOver={onGameOver}
          />
        </React.Suspense>
      ))}
      {allAppleIds.map((appleId) => (
        <Apple
          key={appleId}
          appleId={appleId}
        />
      ))}
    </div>
  );
};

export default SnakeBoard;
