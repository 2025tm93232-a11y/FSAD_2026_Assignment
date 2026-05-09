import React from 'react';
import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', loading, icon, ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${loading ? styles.loading : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
