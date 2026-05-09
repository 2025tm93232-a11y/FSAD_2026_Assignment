const express = require('express');
const { body, param, validationResult } = require('express-validator');
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
 *   name: Comments
 *   description: Task comment endpoints
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/', (req, res) => {
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND project_id = ?').get(req.params.taskId, req.params.projectId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC').all(req.params.taskId));
});

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [author, content]
 *             properties:
 *               author:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created comment
 *       404:
 *         description: Task not found
 */
router.post(
  '/',
  [
    body('author').trim().notEmpty().withMessage('Author is required').isLength({ max: 100 }),
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 2000 }),
  ],
  validate,
  (req, res) => {
    const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND project_id = ?').get(req.params.taskId, req.params.projectId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const id = uuidv4();
    const { author, content } = req.body;
    db.prepare('INSERT INTO comments (id, task_id, author, content) VALUES (?, ?, ?, ?)').run(id, req.params.taskId, author, content);
    res.status(201).json(db.prepare('SELECT * FROM comments WHERE id = ?').get(id));
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
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
 *         description: Comment not found
 */
router.delete('/:id', param('id').notEmpty(), validate, (req, res) => {
  const comment = db.prepare('SELECT id FROM comments WHERE id = ? AND task_id = ?').get(req.params.id, req.params.taskId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;
