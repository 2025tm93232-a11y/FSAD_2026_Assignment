import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, LayoutGrid, List, MessageSquare, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProject } from '../api/projects';
import { getTasks, createTask, updateTask, deleteTask, getTask, addComment, deleteComment } from '../api/tasks';
import Layout from '../components/Layout/Layout';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Spinner from '../components/UI/Spinner';
import EmptyState from '../components/UI/EmptyState';
import styles from './ProjectDetail.module.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [view, setView] = useState('kanban');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [comment, setComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id, statusFilter],
    queryFn: () => getTasks(id, statusFilter ? { status: statusFilter } : {}),
    enabled: !!id,
  });

  const { data: taskDetail } = useQuery({
    queryKey: ['task', id, detailTask],
    queryFn: () => getTask(id, detailTask),
    enabled: !!detailTask,
  });

  const createMut = useMutation({
    mutationFn: (data) => createTask(id, data),
    onSuccess: () => { qc.invalidateQueries(['tasks', id]); qc.invalidateQueries(['stats']); setTaskModalOpen(false); toast.success('Task created!'); },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ taskId, data }) => updateTask(id, taskId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['tasks', id]);
      qc.invalidateQueries(['task', id, vars.taskId]);
      qc.invalidateQueries(['stats']);
      setEditTask(null);
      toast.success('Task updated!');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (taskId) => deleteTask(id, taskId),
    onSuccess: () => { qc.invalidateQueries(['tasks', id]); qc.invalidateQueries(['stats']); setDeleteTarget(null); toast.success('Task deleted.'); },
    onError: (e) => toast.error(e.message),
  });

  const commentMut = useMutation({
    mutationFn: (data) => addComment(id, detailTask, data),
    onSuccess: () => { qc.invalidateQueries(['task', id, detailTask]); setComment(''); toast.success('Comment added!'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteCommentMut = useMutation({
    mutationFn: (cid) => deleteComment(id, detailTask, cid),
    onSuccess: () => qc.invalidateQueries(['task', id, detailTask]),
    onError: (e) => toast.error(e.message),
  });

  const handleStatusChange = (task, status) => {
    updateMut.mutate({ taskId: task.id, data: { status } });
  };

  if (projLoading) return <Layout title="Project"><Spinner text="Loading..." /></Layout>;
  if (!project) return <Layout title="Project"><p style={{ padding: 24, color: 'var(--danger)' }}>Project not found.</p></Layout>;

  return (
    <Layout title={project.name} subtitle={project.description || 'No description'}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className={styles.projectMeta}>
          <Badge label={project.priority} />
          <Badge label={project.status} />
        </div>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === 'kanban' ? styles.active : ''}`} onClick={() => setView('kanban')}>
            <LayoutGrid size={16} /> Kanban
          </button>
          <button className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`} onClick={() => setView('list')}>
            <List size={16} /> List
          </button>
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <Button icon={<Plus size={15} />} onClick={() => setTaskModalOpen(true)}>Add Task</Button>
      </div>

      {tasksLoading ? (
        <Spinner text="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No tasks yet"
          description="Add your first task to start tracking progress."
          action={<Button icon={<Plus size={16} />} onClick={() => setTaskModalOpen(true)}>Add Task</Button>}
        />
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onEdit={(t) => setEditTask(t)}
          onDelete={(t) => setDeleteTarget(t)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className={styles.listView}>
          {tasks.map((t) => (
            <div key={t.id} onClick={() => setDetailTask(t.id)} className={styles.listItem}>
              <TaskCard
                task={t}
                onEdit={(task) => { setEditTask(task); }}
                onDelete={(task) => setDeleteTarget(task)}
                onStatusChange={handleStatusChange}
                compact
              />
            </div>
          ))}
        </div>
      )}

      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create Task">
        <TaskForm
          onSubmit={(data) => createMut.mutate(data)}
          onCancel={() => setTaskModalOpen(false)}
          loading={createMut.isPending}
        />
      </Modal>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm
          initial={editTask}
          onSubmit={(data) => updateMut.mutate({ taskId: editTask.id, data })}
          onCancel={() => setEditTask(null)}
          loading={updateMut.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task" size="sm">
        <p className={styles.deleteMsg}>
          Delete task <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(deleteTarget.id)}>Delete</Button>
        </div>
      </Modal>

      <Modal open={!!detailTask && !!taskDetail} onClose={() => setDetailTask(null)} title="Task Details" size="lg">
        {taskDetail && (
          <div className={styles.taskDetail}>
            <div className={styles.detailHeader}>
              <h3 className={styles.detailTitle}>{taskDetail.title}</h3>
              <div className={styles.detailBadges}>
                <Badge label={taskDetail.priority} />
                <Badge label={taskDetail.status} />
              </div>
            </div>
            {taskDetail.description && <p className={styles.detailDesc}>{taskDetail.description}</p>}
            <div className={styles.detailMeta}>
              {taskDetail.assignee && <span>👤 {taskDetail.assignee}</span>}
              {taskDetail.due_date && <span>📅 {new Date(taskDetail.due_date).toLocaleDateString()}</span>}
              <span>🕒 Created {new Date(taskDetail.created_at).toLocaleString()}</span>
            </div>

            <div className={styles.commentsSection}>
              <h4 className={styles.commentsTitle}>
                <MessageSquare size={15} /> Comments ({taskDetail.comments?.length || 0})
              </h4>
              <div className={styles.commentsList}>
                {taskDetail.comments?.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <strong>{c.author}</strong>
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                      <button
                        className={styles.delComment}
                        onClick={() => deleteCommentMut.mutate(c.id)}
                        title="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p>{c.content}</p>
                  </div>
                ))}
              </div>
              <div className={styles.commentForm}>
                <input
                  placeholder="Your name"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className={styles.commentInput}
                />
                <div className={styles.commentRow}>
                  <textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={styles.commentTextarea}
                    rows={2}
                  />
                  <Button
                    icon={<Send size={14} />}
                    loading={commentMut.isPending}
                    onClick={() => {
                      if (!comment.trim() || !commentAuthor.trim()) { toast.error('Author and comment required'); return; }
                      commentMut.mutate({ author: commentAuthor, content: comment });
                    }}
                  >Post</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
