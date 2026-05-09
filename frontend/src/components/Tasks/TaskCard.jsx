import React from 'react';
import { Calendar, User, MessageSquare, Trash2, Pencil } from 'lucide-react';
import Badge from '../UI/Badge';
import styles from './TaskCard.module.css';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, compact }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.top}>
        <div className={styles.badges}>
          <Badge label={task.priority} />
          {compact && <Badge label={task.status} />}
        </div>
        <div className={styles.actions}>
          {onEdit && (
            <button className={styles.actionBtn} onClick={() => onEdit(task)} title="Edit">
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => onDelete(task)} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <h4 className={`${styles.title} ${task.status === 'done' ? styles.done : ''}`}>{task.title}</h4>
      {task.description && <p className={styles.desc}>{task.description}</p>}

      {!compact && onStatusChange && (
        <select
          className={styles.statusSelect}
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      )}

      <div className={styles.meta}>
        {task.assignee && (
          <span className={styles.metaItem}><User size={12} /> {task.assignee}</span>
        )}
        {task.due_date && (
          <span className={`${styles.metaItem} ${isOverdue ? styles.overdue : ''}`}>
            <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}
            {isOverdue && ' (overdue)'}
          </span>
        )}
        {task.project_name && (
          <span className={styles.metaItem}>{task.project_name}</span>
        )}
      </div>
    </div>
  );
}
