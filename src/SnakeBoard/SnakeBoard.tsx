import cx from 'classnames';
import React from 'react';
import { useWindowSize } from 'react-use';

import Apple from '../Apple/Apple';
import Snake from '../Snake/Snake';
import {
    SIDE_BOUNDARY, TOP_BOUNDARY, useAllApples, useAllSnakeIds, useSnakeScore
} from '../SnakeState/SnakeState';
import styles from './SnakeBoard.module.css';

export type SnakeBoardProps = {
    myColor: string;
    mySnakeId?: string;
    myName: string;
    gameId?: string;
    onGameOver: () => void;
    onQuitGame: () => void;
}

const SnakeBoard = ({mySnakeId, onGameOver, onQuitGame} : SnakeBoardProps) => {
    const [boardDimensions, setBoardDimensions] = React.useState<{height: number, width: number}>();
    const boardRef = React.useRef<HTMLDivElement>(null);
    const myScore = useSnakeScore(mySnakeId);
    const allSnakeIds = useAllSnakeIds();
    const allAppleIds = useAllApples();
    const windowSize = useWindowSize();
    React.useEffect(() => {
        if (!boardRef.current) return;
        setBoardDimensions({
            height: boardRef.current.clientHeight / TOP_BOUNDARY,
            width: boardRef.current.clientWidth / SIDE_BOUNDARY,
        });
    }, [windowSize.height, windowSize.width]);

    
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