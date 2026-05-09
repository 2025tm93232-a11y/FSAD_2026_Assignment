import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { getStats } from '../api/tasks';
import Layout from '../components/Layout/Layout';
import Spinner from '../components/UI/Spinner';
import Badge from '../components/UI/Badge';
import styles from './Analytics.module.css';

function BarChart({ data, colorKey }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={styles.barChart}>
      {data.map(({ label, value, color }) => (
        <div key={label} className={styles.bar}>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ height: `${(value / max) * 100}%`, background: color || 'var(--accent)' }}
            />
          </div>
          <span className={styles.barVal}>{value}</span>
          <span className={styles.barLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className={styles.noData}>No data</p>;

  const r = 46;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} viewBox="0 0 120 120" className={styles.donut}>
        {segments.map(({ label, value, color }) => {
          const pct = value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x="60" y="56" textAnchor="middle" className={styles.donutLabel}>{total}</text>
        <text x="60" y="70" textAnchor="middle" className={styles.donutSub}>total</text>
      </svg>
      <div className={styles.legend}>
        {segments.map(({ label, value, color }) => (
          <div key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span>{label}</span>
            <span className={styles.legendVal}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: getStats });

  if (isLoading) return <Layout title="Analytics"><Spinner text="Loading analytics..." /></Layout>;

  const taskStatusData = [
    { label: 'To Do', value: stats.tasks.todo, color: '#64748b' },
    { label: 'In Progress', value: stats.tasks.in_progress, color: '#f59e0b' },
    { label: 'Done', value: stats.tasks.done, color: '#10b981' },
  ];

  const taskPriorityData = [
    { label: 'High', value: stats.tasksByPriority.find((x) => x.priority === 'high')?.count || 0, color: '#ef4444' },
    { label: 'Medium', value: stats.tasksByPriority.find((x) => x.priority === 'medium')?.count || 0, color: '#f59e0b' },
    { label: 'Low', value: stats.tasksByPriority.find((x) => x.priority === 'low')?.count || 0, color: '#3b82f6' },
  ];

  const projectStatusData = [
    { label: 'Active', value: stats.projects.active, color: '#10b981' },
    { label: 'Other', value: stats.projects.total - stats.projects.active, color: '#64748b' },
  ];

  const completion = stats.tasks.total > 0
    ? Math.round((stats.tasks.done / stats.tasks.total) * 100)
    : 0;

  return (
    <Layout title="Analytics" subtitle="Visualized insights into project and task data">
      <div className={styles.kpiRow}>
        {[
          { label: 'Total Tasks', value: stats.tasks.total, color: '#6366f1' },
          { label: 'Completed', value: `${completion}%`, color: '#10b981' },
          { label: 'Overdue', value: stats.tasks.overdue, color: '#ef4444' },
          { label: 'Active Projects', value: stats.projects.active, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.kpi} style={{ '--kc': color }}>
            <p className={styles.kpiVal} style={{ color }}>{value}</p>
            <p className={styles.kpiLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}><BarChart3 size={15} /> Tasks by Status</h3>
          <DonutChart segments={taskStatusData} size={130} />
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}><BarChart3 size={15} /> Tasks by Priority</h3>
          <BarChart data={taskPriorityData} />
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}><BarChart3 size={15} /> Projects Overview</h3>
          <DonutChart segments={projectStatusData} size={130} />
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Recent Activity</h3>
        {stats.recentTasks.length === 0 ? (
          <p className={styles.noData}>No tasks yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTasks.map((t) => (
                <tr key={t.id}>
                  <td className={t.status === 'done' ? styles.striked : ''}>{t.title}</td>
                  <td className={styles.sub}>{t.project_name}</td>
                  <td><Badge label={t.status} /></td>
                  <td><Badge label={t.priority} /></td>
                  <td className={styles.sub}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
