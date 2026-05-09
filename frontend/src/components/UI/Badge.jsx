import React from 'react';
import styles from './Badge.module.css';

const variantMap = {
  active: 'success',
  completed: 'info',
  archived: 'muted',
  todo: 'muted',
  in_progress: 'warning',
  done: 'success',
  low: 'info',
  medium: 'warning',
  high: 'danger',
};

export default function Badge({ label, variant }) {
  const v = variant || variantMap[label] || 'muted';
  const display = label?.replace('_', ' ');
  return <span className={`${styles.badge} ${styles[v]}`}>{display}</span>;
}
