import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import styles from '../Projects/ProjectForm.module.css';

const defaultState = {
  title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assignee: '',
};

export default function TaskForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, due_date: initial.due_date ? initial.due_date.split('T')[0] : '' }
      : defaultState
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({ ...initial, due_date: initial.due_date ? initial.due_date.split('T')[0] : '' });
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length > 200) e.title = 'Max 200 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form };
    if (!payload.due_date) delete payload.due_date;
    onSubmit(payload);
  };

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>Task Title *</label>
        <input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Design login page mockup"
          className={errors.title ? styles.inputError : ''}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.field}>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Task details..."
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Due Date</label>
          <input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Assignee</label>
          <input
            value={form.assignee}
            onChange={(e) => set('assignee', e.target.value)}
            placeholder="e.g. Alice"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  );
}
