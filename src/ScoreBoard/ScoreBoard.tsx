import cx from 'classnames';

import { useAllSnakeIds } from '../SnakeState';
import styles from './ScoreBoard.module.css';
import SnakeScore from './SnakeScore/SnakeScore';

export type ScoreBoardProps = {};

const ScoreBoard = ({} : ScoreBoardProps) => {
    const snakeIds = useAllSnakeIds();
    if (snakeIds.length === 0 ) return null;
    return <div className={cx(styles.container)}>
        <div className={cx(styles.scoreBoard)}>
            {snakeIds.map((snakeId) => <SnakeScore snakeId={snakeId} />)}
        </div>
    </div>
}

export default ScoreBoard;