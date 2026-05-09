# TaskFlow — Full Stack Task & Project Management System

> BITS Pilani FSAD Assignment 2026 — SE ZG503  
Built By - Pulla Hari Sai Vamshi (2025TM93232)

> Built with React + Node.js/Express + SQLite (node:sqlite)



 Problem Statement

TaskFlow is a collaborative project and task management system that allows teams to:
- Create and manage projects with priority levels and statuses
- Add tasks to projects with status tracking (Kanban board & list view)
- Assign tasks, set due dates, and track overdue work
- Add comments to tasks for collaboration
- View analytics dashboards with task completion metrics



 Tech Stack

| Layer | Technology |
|||
| Frontend | React 18, React Router v6, TanStack Query, React Hot Toast |
| Backend | Node.js, Express 4, node:sqlite (built-in, no native deps) |
| API Docs | Swagger UI (http://localhost:5000/api/docs) |
| Styling | CSS Modules, custom dark-theme design system |



 Project Structure

```
full stack application/
├── backend/
│   ├── routes/
│   │   ├── projects.js     # CRUD for projects
│   │   ├── tasks.js        # CRUD for tasks
│   │   ├── comments.js     # Comments CRUD
│   │   └── stats.js        # Dashboard aggregations
│   ├── db.js               # node:sqlite setup + schema
│   ├── server.js           # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API client modules
│   │   ├── components/
│   │   │   ├── Layout/     # Sidebar, Header, Layout wrapper
│   │   │   ├── UI/         # Badge, Button, Modal, Spinner, EmptyState
│   │   │   ├── Projects/   # ProjectCard, ProjectForm
│   │   │   └── Tasks/      # TaskCard, TaskForm, KanbanBoard
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── AllTasks.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── ApiDocs.jsx
│   │   └── App.js          # React Router routes
│   └── package.json
├── README.md
├── HOW_IT_WORKS.md
└── AI_USAGE_LOG.md
```



 Quick Start

 Prerequisites
- Node.js v22.9+ (v25 recommended — uses built-in `node:sqlite`)
- npm v9+

 1. Start Backend
```bash
cd backend
npm install
npm start
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
```

 2. Start Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm start
# UI running at http://localhost:3000
```



 API Endpoints Summary

| Method | Path | Description |
||||
| GET | /api/projects | List all projects |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project (cascade) |
| GET | /api/projects/:id/tasks | List tasks for project |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/projects/:id/tasks/:tid | Update task |
| DELETE | /api/projects/:id/tasks/:tid | Delete task |
| POST | /api/projects/:id/tasks/:tid/comments | Add comment |
| DELETE | /api/projects/:id/tasks/:tid/comments/:cid | Delete comment |
| GET | /api/stats | Dashboard statistics |
| GET | /api/health | Health check |

Full interactive docs: http://localhost:5000/api/docs



 Features

- Kanban Board — drag tasks across To Do / In Progress / Done columns visually
- List View — compact list with inline status editing
- Task Detail Modal — view/add/delete comments per task
- Analytics Page — donut & bar charts for task status and priority breakdown
- Responsive Design — works on mobile (hamburger sidebar)
- Real-time Connection Status — shows online/offline state in header
- Input Validation — server-side via express-validator + client-side
- Swagger UI — fully documented REST API



 DB Schema

```sql
projects (id, name, description, status, priority, created_at, updated_at)
tasks    (id, project_id FK, title, description, status, priority, due_date, assignee, created_at, updated_at)
comments (id, task_id FK, author, content, created_at)
```
Foreign keys with `ON DELETE CASCADE` ensure referential integrity.
