import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { getStats } from '../api/tasks';
import Layout from '../components/Layout/Layout';
import Spinner from '../components/UI/Spinner';
import Badge from '../components/UI/Badge';
import styles from './Dashboard.module.css';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className={styles.statCard} style={{ '--accent-color': color }}>
      <div className={styles.statIcon} style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useQuery({ queryKey: ['stats'], queryFn: getStats });

  if (isLoading) return <Layout title="Dashboard"><Spinner text="Loading dashboard..." /></Layout>;
  if (error) return (
    <Layout title="Dashboard">
      <div className={styles.error}>
        <AlertTriangle size={40} />
        <p>Failed to load stats. Is the backend running?</p>
        <code>http://localhost:5000</code>
      </div>
    </Layout>
  );

  const completion = stats.tasks.total > 0
    ? Math.round((stats.tasks.done / stats.tasks.total) * 100)
    : 0;

  return (
    <Layout title="Dashboard" subtitle="Overview of your projects and tasks">
      <div className={styles.grid}>
        <StatCard icon={FolderKanban} label="Total Projects" value={stats.projects.total}
          sub={`${stats.projects.active} active`} color="#6366f1" />
        <StatCard icon={CheckSquare} label="Tasks Done" value={stats.tasks.done}
          sub={`of ${stats.tasks.total} total`} color="#10b981" />
        <StatCard icon={Clock} label="In Progress" value={stats.tasks.in_progress}
          sub={`${stats.tasks.todo} to do`} color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.tasks.overdue}
          sub="need attention" color="#ef4444" />
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Overall Completion</h3>
            <span className={styles.pct}>{completion}%</span>
          </div>
          <div className={styles.bigBar}>
            <div className={styles.bigFill} style={{ width: `${completion}%` }} />
          </div>
          <div className={styles.taskBreakdown}>
            {[
              { label: 'Done', val: stats.tasks.done, color: '#10b981' },
              { label: 'In Progress', val: stats.tasks.in_progress, color: '#f59e0b' },
              { label: 'To Do', val: stats.tasks.todo, color: '#64748b' },
            ].map(({ label, val, color }) => (
              <div key={label} className={styles.breakItem}>
                <span className={styles.dot} style={{ background: color }} />
                <span>{label}</span>
                <span className={styles.breakVal}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><h3>Tasks by Priority</h3></div>
          {stats.tasksByPriority.length === 0 ? (
            <p className={styles.emptyText}>No tasks yet</p>
          ) : (
            <div className={styles.priorityList}>
              {['high', 'medium', 'low'].map((p) => {
                const item = stats.tasksByPriority.find((x) => x.priority === p);
                const count = item?.count || 0;
                const pct = stats.tasks.total > 0 ? (count / stats.tasks.total) * 100 : 0;
                return (
                  <div key={p} className={styles.priorityRow}>
                    <Badge label={p} />
                    <div className={styles.priorityBar}>
                      <div
                        className={styles.priorityFill}
                        style={{
                          width: `${pct}%`,
                          background: p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#3b82f6',
                        }}
                      />
                    </div>
                    <span className={styles.priorityCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3><TrendingUp size={16} /> Recent Tasks</h3>
          <button className={styles.viewAll} onClick={() => navigate('/tasks')}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {stats.recentTasks.length === 0 ? (
          <p className={styles.emptyText}>No tasks yet. Create a project to get started!</p>
        ) : (
          <div className={styles.recentList}>
            {stats.recentTasks.map((task) => (
              <div
                key={task.id}
                className={styles.recentItem}
                onClick={() => navigate(`/projects/${task.project_id}`)}
              >
                <div className={styles.recentMain}>
                  <span className={`${styles.recentTitle} ${task.status === 'done' ? styles.done : ''}`}>
                    {task.title}
                  </span>
                  <span className={styles.recentProject}>{task.project_name}</span>
                </div>
                <div className={styles.recentBadges}>
                  <Badge label={task.priority} />
                  <Badge label={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
