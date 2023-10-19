import cx from 'classnames';
import React from 'react';

import { isColorUsed } from '../SnakeState';
import styles from './ColorOption.module.css';

export type ColorOptionProps = {
  color: string;
  selected?: boolean;
  onClick: (ev: React.SyntheticEvent<HTMLButtonElement>) => void;
};

const ColorOption = ({ onClick, color, selected }: ColorOptionProps) => {
  const isInUse = isColorUsed(color);
  return (
    <button
      disabled={isInUse}
      onClick={onClick}
      className={cx(styles.container)}
      style={{ backgroundColor: color }}
    >
      {selected && "✓"}
    </button>
  );
};

export default ColorOption;
