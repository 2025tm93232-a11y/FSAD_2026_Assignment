import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import styles from './ProjectForm.module.css';

const defaultState = { name: '', description: '', priority: 'medium', status: 'active' };

export default function ProjectForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || defaultState);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (initial) setForm(initial); }, [initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    else if (form.name.trim().length > 100) e.name = 'Max 100 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>Project Name *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Website Redesign"
          className={errors.name ? styles.inputError : ''}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Brief description of the project..."
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update Project' : 'Create Project'}</Button>
      </div>
    </form>
  );
}
