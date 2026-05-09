import api from './client';

export const getTasks = (projectId, filters) =>
  api.get(`/projects/${projectId}/tasks`, { params: filters }).then((r) => r.data);

export const getTask = (projectId, taskId) =>
  api.get(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data);

export const createTask = (projectId, data) =>
  api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data);

export const updateTask = (projectId, taskId, data) =>
  api.put(`/projects/${projectId}/tasks/${taskId}`, data).then((r) => r.data);

export const deleteTask = (projectId, taskId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data);

export const getComments = (projectId, taskId) =>
  api.get(`/projects/${projectId}/tasks/${taskId}/comments`).then((r) => r.data);

export const addComment = (projectId, taskId, data) =>
  api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data).then((r) => r.data);

export const deleteComment = (projectId, taskId, commentId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`).then((r) => r.data);

export const getStats = () => api.get('/stats').then((r) => r.data);
