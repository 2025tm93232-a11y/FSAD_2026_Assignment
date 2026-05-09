import React, { useState } from 'react';
import { ExternalLink, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import styles from './ApiDocs.module.css';

const ENDPOINTS = [
  {
    group: 'Projects',
    color: '#6366f1',
    items: [
      { method: 'GET', path: '/api/projects', desc: 'List all projects. Optional query: ?status=active|completed|archived', response: '[{ id, name, description, status, priority, task_count, completed_tasks, created_at }]' },
      { method: 'GET', path: '/api/projects/:id', desc: 'Get a single project by ID.', response: '{ id, name, description, status, priority, created_at, updated_at }' },
      { method: 'POST', path: '/api/projects', desc: 'Create a new project. Body: { name*, description, priority, status }', response: '{ id, name, ... } — 201 Created' },
      { method: 'PUT', path: '/api/projects/:id', desc: 'Update project fields. All fields optional.', response: '{ ...updatedProject }' },
      { method: 'DELETE', path: '/api/projects/:id', desc: 'Delete project and all its tasks/comments (CASCADE).', response: '{ message: "Project deleted successfully" }' },
    ],
  },
  {
    group: 'Tasks',
    color: '#10b981',
    items: [
      { method: 'GET', path: '/api/projects/:projectId/tasks', desc: 'Get tasks for a project. Optional filters: ?status=todo|in_progress|done, ?priority=low|medium|high', response: '[{ id, project_id, title, status, priority, due_date, assignee, ... }]' },
      { method: 'GET', path: '/api/projects/:projectId/tasks/:id', desc: 'Get a single task with its comments.', response: '{ ...task, comments: [...] }' },
      { method: 'POST', path: '/api/projects/:projectId/tasks', desc: 'Create a task. Body: { title*, description, status, priority, due_date, assignee }', response: '{ id, title, ... } — 201 Created' },
      { method: 'PUT', path: '/api/projects/:projectId/tasks/:id', desc: 'Update task fields. All optional.', response: '{ ...updatedTask }' },
      { method: 'DELETE', path: '/api/projects/:projectId/tasks/:id', desc: 'Delete a task (also deletes comments).', response: '{ message: "Task deleted successfully" }' },
    ],
  },
  {
    group: 'Comments',
    color: '#f59e0b',
    items: [
      { method: 'GET', path: '/api/projects/:projectId/tasks/:taskId/comments', desc: 'List all comments for a task.', response: '[{ id, task_id, author, content, created_at }]' },
      { method: 'POST', path: '/api/projects/:projectId/tasks/:taskId/comments', desc: 'Add comment. Body: { author*, content* }', response: '{ id, author, content, created_at } — 201 Created' },
      { method: 'DELETE', path: '/api/projects/:projectId/tasks/:taskId/comments/:id', desc: 'Delete a comment.', response: '{ message: "Comment deleted" }' },
    ],
  },
  {
    group: 'Stats & Health',
    color: '#3b82f6',
    items: [
      { method: 'GET', path: '/api/stats', desc: 'Aggregated dashboard statistics.', response: '{ projects: { total, active }, tasks: { total, done, in_progress, todo, overdue }, tasksByPriority, recentTasks }' },
      { method: 'GET', path: '/api/health', desc: 'Health check endpoint.', response: '{ status: "ok", timestamp }' },
    ],
  },
];

const METHOD_COLOR = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444' };

function EndpointRow({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.endpoint}>
      <button className={styles.endpointHead} onClick={() => setOpen((o) => !o)}>
        <span className={styles.method} style={{ background: `${METHOD_COLOR[item.method]}20`, color: METHOD_COLOR[item.method] }}>{item.method}</span>
        <code className={styles.path}>{item.path}</code>
        <span className={styles.epDesc}>{item.desc.split('.')[0]}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className={styles.endpointBody}>
          <p className={styles.fullDesc}>{item.desc}</p>
          <div className={styles.respBlock}>
            <span className={styles.respLabel}>Sample Response</span>
            <pre className={styles.pre}>{item.response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const [openGroup, setOpenGroup] = useState('Projects');

  return (
    <Layout title="API Documentation" subtitle="Full REST API reference for TaskFlow backend">
      <div className={styles.swaggerLink}>
        <BookOpen size={15} />
        <span>Interactive Swagger UI available at</span>
        <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer" className={styles.link}>
          http://localhost:5000/api/docs <ExternalLink size={12} />
        </a>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}><span className={styles.metaKey}>Base URL</span><code>http://localhost:5000</code></div>
        <div className={styles.metaItem}><span className={styles.metaKey}>Format</span><code>application/json</code></div>
        <div className={styles.metaItem}><span className={styles.metaKey}>Auth</span><code>None (open API)</code></div>
        <div className={styles.metaItem}><span className={styles.metaKey}>Version</span><code>1.0.0</code></div>
      </div>

      <div className={styles.schema}>
        <h3 className={styles.sectionTitle}>DB Schema</h3>
        <div className={styles.schemaGrid}>
          {[
            { name: 'projects', fields: ['id (TEXT PK)', 'name (TEXT NOT NULL)', 'description (TEXT)', 'status (active|completed|archived)', 'priority (low|medium|high)', 'created_at', 'updated_at'] },
            { name: 'tasks', fields: ['id (TEXT PK)', 'project_id (FK → projects)', 'title (TEXT NOT NULL)', 'description (TEXT)', 'status (todo|in_progress|done)', 'priority (low|medium|high)', 'due_date (TEXT)', 'assignee (TEXT)', 'created_at', 'updated_at'] },
            { name: 'comments', fields: ['id (TEXT PK)', 'task_id (FK → tasks)', 'author (TEXT NOT NULL)', 'content (TEXT NOT NULL)', 'created_at'] },
          ].map(({ name, fields }) => (
            <div key={name} className={styles.table}>
              <div className={styles.tableHead}>{name}</div>
              {fields.map((f) => <div key={f} className={styles.tableField}>{f}</div>)}
            </div>
          ))}
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Endpoints</h3>
      {ENDPOINTS.map(({ group, color, items }) => (
        <div key={group} className={styles.group}>
          <button
            className={styles.groupHead}
            style={{ borderLeftColor: color }}
            onClick={() => setOpenGroup(openGroup === group ? '' : group)}
          >
            <span style={{ color }}>{group}</span>
            <span className={styles.groupCount}>{items.length} endpoints</span>
            {openGroup === group ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {openGroup === group && (
            <div className={styles.groupBody}>
              {items.map((item) => <EndpointRow key={item.path + item.method} item={item} />)}
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}
