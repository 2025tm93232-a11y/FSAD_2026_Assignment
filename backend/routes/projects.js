const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of projects with task counts
 */
router.get('/', (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT p.*, COUNT(t.id) as task_count,
      SUM(CASE WHEN t.status='done' THEN 1 ELSE 0 END) as completed_tasks
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
  `;
  const params = [];
  if (status) {
    query += ' WHERE p.status = ?';
    params.push(status);
  }
  query += ' GROUP BY p.id ORDER BY p.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/:id', param('id').notEmpty(), validate, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Created project
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['active', 'completed', 'archived']),
  ],
  validate,
  (req, res) => {
    const { name, description = '', priority = 'medium', status = 'active' } = req.body;
    const id = uuidv4();
    db.prepare(
      'INSERT INTO projects (id, name, description, priority, status) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, description, priority, status);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(project);
  }
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated project
 *       404:
 *         description: Project not found
 */
router.put(
  '/:id',
  [
    param('id').notEmpty(),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['active', 'completed', 'archived']),
  ],
  validate,
  (req, res) => {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const { name, description, priority, status } = req.body;
    db.prepare(
      `UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(name ?? null, description ?? null, priority ?? null, status ?? null, req.params.id);

    res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
  }
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project (cascades tasks & comments)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/:id', param('id').notEmpty(), validate, (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted successfully' });
});

module.exports = router;
