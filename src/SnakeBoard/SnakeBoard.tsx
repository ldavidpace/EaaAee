import cx from 'classnames';
import React from 'react';

import Apple from '../Apple/Apple';
import Snake from '../Snake/Snake';
import {
    createSnake, SIDE_BOUNDARY, TOP_BOUNDARY, useAllApples, useAllSnakeIds, useSnakeScore
} from '../SnakeState/SnakeState';
import styles from './SnakeBoard.module.css';

export type SnakeBoardProps = {
    myColor: string;
    mySnakeId?: string;
    gameId?: string;
    onGameOver: () => void;
    onQuitGame: () => void;
}

const SnakeBoard = ({myColor, mySnakeId, onGameOver, onQuitGame} : SnakeBoardProps) => {
    const [boardDimensions, setBoardDimensions] = React.useState<{height: number, width: number}>();
    const boardRef = React.useRef<HTMLDivElement>(null);
    const myScore = useSnakeScore(mySnakeId);
    const allSnakeIds = useAllSnakeIds();
    const allAppleIds = useAllApples();
    React.useEffect(() => {
        if (mySnakeId) {
            createSnake(mySnakeId, myColor);
        }
    }, [mySnakeId]);
    React.useEffect(() => {
        if (!boardRef.current) return;
        setBoardDimensions({
            height: boardRef.current.clientHeight / TOP_BOUNDARY,
            width: boardRef.current.clientWidth / SIDE_BOUNDARY,
        });
    }, []);
    
    return <div ref={boardRef} className={cx(styles.container)}>
        {mySnakeId && <div>Score: {myScore}</div>}
        {mySnakeId && <button className={styles.closeButton} onClick={onQuitGame}>X</button>}
        {allSnakeIds.map((snakeId)=> <Snake 
            mySnake={snakeId === mySnakeId} 
            key={snakeId} 
            snakeId={snakeId} 
            boardDimensions={boardDimensions} 
            onGameOver={onGameOver}/>
        )}
        {allAppleIds.map((appleId) => <Apple key={appleId} appleId={appleId} boardDimensions={boardDimensions}/>)}
    </div>
}

export default SnakeBoard;