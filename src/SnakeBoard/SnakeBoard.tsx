import cx from 'classnames';
import React from 'react';
import { v4 as uuid } from 'uuid';

import Apple from '../Apple/Apple';
import Snake from '../Snake/Snake';
import { SIDE_BOUNDARY, TOP_BOUNDARY, useSnakeScore } from '../SnakeState/SnakeState';
import styles from './SnakeBoard.module.css';

export type SnakeBoardProps = {
    myColor: string;
    mySnakeId: string;
    gameId?: string;
    onGameOver: () => void;
    onQuitGame: () => void;
}

const SnakeBoard = ({myColor, mySnakeId, gameId, onGameOver, onQuitGame} : SnakeBoardProps) => {
    const [boardDimensions, setBoardDimensions] = React.useState<{height: number, width: number}>();
    const boardRef = React.useRef<HTMLDivElement>(null);
    const myScore = useSnakeScore(mySnakeId);
    React.useEffect(() => {
        if (!boardRef.current) return;
        setBoardDimensions({
            height: boardRef.current.clientHeight / TOP_BOUNDARY,
            width: boardRef.current.clientWidth / SIDE_BOUNDARY,
        });
    }, [])
    return <div ref={boardRef} className={cx(styles.container)}>
        {gameId && <div>Score: {myScore}</div>}
        {gameId && <button className={styles.closeButton} onClick={onQuitGame}>X</button>}
        {gameId && <Snake mySnake myColor={myColor} snakeId={mySnakeId} boardDimensions={boardDimensions} onGameOver={onGameOver}/>}
        {gameId && <Apple boardDimensions={boardDimensions}/>}
    </div>
}

export default SnakeBoard;