const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router({ mergeParams: true });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: List of tasks
 *       404:
 *         description: Project not found
 */
router.get('/', (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  let q = 'SELECT * FROM tasks WHERE project_id = ?';
  const params = [req.params.projectId];

  if (req.query.status) { q += ' AND status = ?'; params.push(req.query.status); }
  if (req.query.priority) { q += ' AND priority = ?'; params.push(req.query.priority); }
  q += ' ORDER BY created_at DESC';

  res.json(db.prepare(q).all(...params));
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (global, across all projects)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All tasks
 */
router.get('/all', (req, res) => {
  let q = `
    SELECT t.*, p.name as project_name FROM tasks t
    JOIN projects p ON p.id = t.project_id
  `;
  const params = [];
  if (req.query.status) { q += ' WHERE t.status = ?'; params.push(req.query.status); }
  q += ' ORDER BY t.created_at DESC';
  res.json(db.prepare(q).all(...params));
});

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details with comments
 *       404:
 *         description: Not found
 */
router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(req.params.id, req.params.projectId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const comments = db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC').all(task.id);
  res.json({ ...task, comments });
});

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *               assignee:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created task
 *       404:
 *         description: Project not found
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional().isISO8601().withMessage('due_date must be a valid date'),
    body('assignee').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  (req, res) => {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { title, description = '', status = 'todo', priority = 'medium', due_date = null, assignee = '' } = req.body;
    const id = uuidv4();
    db.prepare(
      'INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, assignee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.params.projectId, title, description, status, priority, due_date, assignee);

    res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated task
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    param('id').notEmpty(),
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional().isISO8601(),
    body('assignee').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(req.params.id, req.params.projectId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority, due_date, assignee } = req.body;
    db.prepare(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        assignee = COALESCE(?, assignee),
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(title ?? null, description ?? null, status ?? null, priority ?? null, due_date ?? null, assignee ?? null, req.params.id);

    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', param('id').notEmpty(), validate, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(req.params.id, req.params.projectId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;
