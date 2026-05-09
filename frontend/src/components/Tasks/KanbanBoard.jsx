import React from 'react';
import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className={styles.board}>
      {COLUMNS.map(({ key, label, color }) => (
        <div key={key} className={styles.column}>
          <div className={styles.colHeader} style={{ borderTopColor: color }}>
            <span className={styles.colLabel}>{label}</span>
            <span className={styles.colCount}>{grouped[key].length}</span>
          </div>
          <div className={styles.colBody}>
            {grouped[key].length === 0 ? (
              <p className={styles.empty}>No tasks here</p>
            ) : (
              grouped[key].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
