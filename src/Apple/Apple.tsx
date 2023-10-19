import 'react';

import cx from 'classnames';

import { useApple } from '../SnakeState/SnakeState';
import styles from './Apple.module.css';

export type AppleProps = {
    appleId: string,
    boardDimensions?: {
        height: number;
        width: number;
    }
}

const Apple = ({appleId, boardDimensions = {height: 100, width: 100}} : AppleProps) => {
    const apple = useApple(appleId);
    if (!apple) return null;
    return <div className={cx(styles.container)} style={{top: `${apple.position.y * boardDimensions.height}px`, left: `${apple.position.x * boardDimensions.width}px`}} />;
}

export default Apple;