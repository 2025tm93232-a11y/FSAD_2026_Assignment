import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, CheckSquare, Calendar } from 'lucide-react';
import Badge from '../UI/Badge';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const progress = project.task_count > 0
    ? Math.round((project.completed_tasks / project.task_count) * 100)
    : 0;

  const handleClick = (e) => {
    if (e.target.closest(`.${styles.menu}`) || e.target.closest(`.${styles.menuBtn}`)) return;
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <Badge label={project.priority} />
          <Badge label={project.status} />
        </div>
        <div className={styles.menuWrapper}>
          <button
            className={styles.menuBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}>
                <Pencil size={14} /> Edit
              </button>
              <button className={styles.danger} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className={styles.name}>{project.name}</h3>
      {project.description && <p className={styles.desc}>{project.description}</p>}

      <div className={styles.progressRow}>
        <span className={styles.progressLabel}>{progress}% complete</span>
        <span className={styles.taskCount}>
          <CheckSquare size={12} /> {project.completed_tasks}/{project.task_count} tasks
        </span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>
          <Calendar size={12} />
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
