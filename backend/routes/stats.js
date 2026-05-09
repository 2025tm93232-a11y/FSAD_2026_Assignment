const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Aggregated stats for dashboard
 */
router.get('/', (req, res) => {
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
  const activeProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status='active'").get().count;
  const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  const doneTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status='done'").get().count;
  const inProgressTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status='in_progress'").get().count;
  const todoTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status='todo'").get().count;
  const overdueTasks = db.prepare(
    "SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status != 'done'"
  ).get().count;

  const tasksByPriority = db.prepare(
    "SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority"
  ).all();

  const recentTasks = db.prepare(
    `SELECT t.*, p.name as project_name FROM tasks t
     JOIN projects p ON p.id = t.project_id
     ORDER BY t.created_at DESC LIMIT 5`
  ).all();

  res.json({
    projects: { total: totalProjects, active: activeProjects },
    tasks: {
      total: totalTasks,
      done: doneTasks,
      in_progress: inProgressTasks,
      todo: todoTasks,
      overdue: overdueTasks,
    },
    tasksByPriority,
    recentTasks,
  });
});

module.exports = router;
