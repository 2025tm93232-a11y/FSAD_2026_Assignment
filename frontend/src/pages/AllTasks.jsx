import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { updateTask, deleteTask } from '../api/tasks';
import Layout from '../components/Layout/Layout';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import Spinner from '../components/UI/Spinner';
import EmptyState from '../components/UI/EmptyState';
import styles from './AllTasks.module.css';

const getAllTasks = (filters) =>
  api.get('/projects/all/tasks/all', { params: filters }).then((r) => r.data).catch(() =>
    api.get('/stats').then((r) => r.data.recentTasks || [])
  );

const fetchAllTasks = () =>
  api.get('/stats').then((r) => {
    return r.data.recentTasks || [];
  });

export default function AllTasks() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const stats = await api.get('/stats').then((r) => r.data);
      const projects = await api.get('/projects').then((r) => r.data);
      const all = [];
      for (const p of projects) {
        const pts = await api.get(`/projects/${p.id}/tasks`).then((r) => r.data);
        pts.forEach((t) => all.push({ ...t, project_name: p.name }));
      }
      return all;
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ projectId, taskId, data }) => updateTask(projectId, taskId, data),
    onSuccess: () => { qc.invalidateQueries(['allTasks']); qc.invalidateQueries(['stats']); setEditTask(null); toast.success('Task updated!'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: ({ projectId, taskId }) => deleteTask(projectId, taskId),
    onSuccess: () => { qc.invalidateQueries(['allTasks']); qc.invalidateQueries(['stats']); setDeleteTarget(null); toast.success('Task deleted.'); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const grouped = {
    todo: filtered.filter((t) => t.status === 'todo'),
    in_progress: filtered.filter((t) => t.status === 'in_progress'),
    done: filtered.filter((t) => t.status === 'done'),
  };

  return (
    <Layout title="All Tasks" subtitle={`${tasks.length} tasks across all projects`}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.sel} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className={styles.sel} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {isLoading ? (
        <Spinner text="Loading tasks..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description={search ? `No results for "${search}"` : 'No tasks match the filters.'} />
      ) : (
        <div className={styles.columns}>
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status} className={styles.col}>
              <div className={styles.colHead}>
                <span>{status.replace('_', ' ')}</span>
                <span className={styles.count}>{items.length}</span>
              </div>
              <div className={styles.colBody}>
                {items.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={(task) => setEditTask(task)}
                    onDelete={(task) => setDeleteTarget(task)}
                    compact
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm
          initial={editTask}
          onSubmit={(data) => updateMut.mutate({ projectId: editTask.project_id, taskId: editTask.id, data })}
          onCancel={() => setEditTask(null)}
          loading={updateMut.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task" size="sm">
        <p className={styles.deleteMsg}>Delete task <strong>{deleteTarget?.title}</strong>?</p>
        <div className={styles.deleteActions}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteMut.isPending}
            onClick={() => deleteMut.mutate({ projectId: deleteTarget.project_id, taskId: deleteTarget.id })}>Delete</Button>
        </div>
      </Modal>
    </Layout>
  );
}
