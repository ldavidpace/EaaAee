import cx from 'classnames';

import { useSnake } from '../../SnakeState';
import styles from './SnakeScore.module.css';

export type SnakeScoreProps = {
    snakeId: string;
}

const SnakeScore = ({snakeId} : SnakeScoreProps) => {
    const snake = useSnake(snakeId);
    if (snake?.dead) return null;
    return <div className={cx(styles.container)} style={{color: snake?.color}} >
        <span>{snake?.name}</span>
        <span>{snake?.score}</span>
    </div>
}

export default SnakeScore;