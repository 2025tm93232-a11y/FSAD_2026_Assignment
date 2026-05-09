import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import Layout from '../components/Layout/Layout';
import ProjectCard from '../components/Projects/ProjectCard';
import ProjectForm from '../components/Projects/ProjectForm';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import Spinner from '../components/UI/Spinner';
import EmptyState from '../components/UI/EmptyState';
import styles from './Projects.module.css';

export default function Projects() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', statusFilter],
    queryFn: () => getProjects(statusFilter || undefined),
  });

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['stats']); setModalOpen(false); toast.success('Project created!'); },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['stats']); setEditTarget(null); toast.success('Project updated!'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['stats']); setDeleteTarget(null); toast.success('Project deleted.'); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout title="Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New Project</Button>
      </div>

      {isLoading ? (
        <Spinner text="Loading projects..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={filter ? `No results for "${filter}"` : 'Create your first project to get started.'}
          action={!filter && <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New Project</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={(proj) => setEditTarget(proj)}
              onDelete={(proj) => setDeleteTarget(proj)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        <ProjectForm
          onSubmit={(data) => createMut.mutate(data)}
          onCancel={() => setModalOpen(false)}
          loading={createMut.isPending}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Project">
        <ProjectForm
          initial={editTarget}
          onSubmit={(data) => updateMut.mutate({ id: editTarget.id, data })}
          onCancel={() => setEditTarget(null)}
          loading={updateMut.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" size="sm">
        <p className={styles.deleteMsg}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          This will also delete all tasks and comments in this project.
        </p>
        <div className={styles.deleteActions}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleteMut.isPending}
            onClick={() => deleteMut.mutate(deleteTarget.id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
