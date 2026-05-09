import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AllTasks from './pages/AllTasks';
import Analytics from './pages/Analytics';
import ApiDocs from './pages/ApiDocs';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/tasks" element={<AllTasks />} />
      <Route path="/stats" element={<Analytics />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
