import React from 'react';
import cx from 'classnames';

import styles from './{{pascalCase name}}.module.css';

export type {{pascalCase name}}Props = {}

const {{pascalCase name}} = ({} : {{pascalCase name}}Props) => {
    return <div className={cx(styles.container)}>{{pascalCase name}} Component</div>
}

export default {{pascalCase name}};