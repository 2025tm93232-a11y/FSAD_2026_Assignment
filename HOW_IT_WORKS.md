 How It Works — TaskFlow Architecture & Workflow
Built By - Pulla Hari Sai Vamshi (2025TM93232)
 Architecture Overview

```
Browser (React SPA)
       │
       │  HTTP/REST (JSON)
       ▼
Express.js Server (port 5000)
       │
       │  node:sqlite (built-in module)
       ▼
SQLite Database (taskflow.db)
```

The application follows a classic 3-tier architecture:
1. Presentation Layer — React SPA with client-side routing (React Router v6)
2. Application/API Layer — Express.js REST API with validation and Swagger docs
3. Data Layer — SQLite via Node.js built-in `node:sqlite` (no native compilation)



 Frontend Data Flow

```
User Action
    │
    ▼
React Component (e.g., Projects.jsx)
    │  calls useMutation / useQuery
    ▼
TanStack Query (cache + sync)
    │  calls API function
    ▼
Axios Client (src/api/client.js)
    │  HTTP request with error interceptor
    ▼
Backend REST API
    │  returns JSON
    ▼
TanStack Query cache updated
    │  triggers re-render
    ▼
UI updates automatically
```

 State Management Strategy
- Server state (projects, tasks, stats): managed by TanStack Query with 30-second stale time
- UI state (modal open/close, form values, filters): local `useState` in each page component
- Navigation state: React Router v6 URL params



 Backend Request Lifecycle

```
HTTP Request
    │
    ▼
CORS Middleware (allows all origins for development)
    │
    ▼
Express JSON body parser
    │
    ▼
Route handler (routes/projects.js etc.)
    │
    ▼
express-validator middleware (input validation)
    │  — returns 422 with error array if invalid
    ▼
Business logic + node:sqlite queries
    │
    ▼
JSON Response (200/201/404/422/500)
```



 Component Hierarchy

```
App.js (React Router)
├── Dashboard           → /
├── Projects            → /projects
├── ProjectDetail       → /projects/:id
│     ├── KanbanBoard
│     │     └── TaskCard (×n per column)
│     └── TaskForm (in Modal)
├── AllTasks            → /tasks
│     └── TaskCard (grouped by status)
├── Analytics           → /stats
└── ApiDocs             → /api-docs

Shared Components:
├── Layout (Sidebar + Header + main wrapper)
├── Badge (status/priority colored chips)
├── Button (primary/secondary/danger/ghost)
├── Modal (accessible overlay)
├── Spinner (loading state)
└── EmptyState (zero-data placeholder)
```



 Key Design Decisions

 1. Built-in `node:sqlite` over `better-sqlite3`
Node v22.9+ ships with `node:sqlite` as a stable built-in module providing a synchronous SQLite API. This eliminates native compilation issues (`node-gyp`) that affect `better-sqlite3` on newer Node/macOS combinations. The API is nearly identical to `better-sqlite3`.

 2. CSS Modules for Scoped Styling
Each component has its own `.module.css` file, preventing style collisions and keeping styles co-located with components. A shared CSS variable system (`:root` in `index.css`) provides a consistent dark-theme design system.

 3. TanStack Query for API State
Instead of `useEffect` + `useState` for every API call, TanStack Query provides:
- Automatic background refetching
- Cache invalidation on mutations
- Loading/error states out of the box
- Optimistic updates capability

 4. Swagger via `swagger-jsdoc`
JSDoc comments directly in route files generate the OpenAPI spec. This keeps documentation co-located with code and always in sync.

 5. Cascade Deletes in SQLite
`FOREIGN KEY ... ON DELETE CASCADE` ensures that deleting a project automatically removes all its tasks and comments. This is enabled at the SQLite level with `PRAGMA foreign_keys = ON`.



 Validation Rules

 Projects
- `name`: required, max 100 characters
- `description`: optional, max 500 characters
- `priority`: enum `[low, medium, high]`
- `status`: enum `[active, completed, archived]`

 Tasks
- `title`: required, max 200 characters
- `description`: optional, max 1000 characters
- `status`: enum `[todo, in_progress, done]`
- `priority`: enum `[low, medium, high]`
- `due_date`: optional, must be ISO 8601 date format
- `assignee`: optional, max 100 characters

 Comments
- `author`: required, max 100 characters
- `content`: required, max 2000 characters



 Running in Production

For a production deployment:
1. Set `process.env.PORT` for the backend
2. Build the React app: `cd frontend && npm run build`
3. Serve the `build/` folder from Express as static files
4. Use a process manager like PM2 for the backend

```bash
 In server.js, add after routes:
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```
