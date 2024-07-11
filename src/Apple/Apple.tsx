import 'react';

import cx from 'classnames';

import { useApple, useBoardDimensions } from '../SnakeState/SnakeState';
import styles from './Apple.module.css';

export type AppleProps = {
  appleId: string;
};

const Apple = ({ appleId }: AppleProps) => {
  const apple = useApple(appleId);
  const boardDimensions = useBoardDimensions();
  if (!apple) return null;
  return (
    <div
      className={cx(styles.container, styles[`value${apple.value}`])}
      style={{
        top: `${apple.position.y * boardDimensions.height}px`,
        left: `${apple.position.x * boardDimensions.width}px`,
      }}
    />
  );
};

export default Apple;
