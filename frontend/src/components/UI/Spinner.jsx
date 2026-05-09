import React from 'react';
import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', text }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
