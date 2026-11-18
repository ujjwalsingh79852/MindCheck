const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// POST /api/tasks - Create task for given anonId
router.post('/', (req, res) => {
  try {
    const { anonId, title, category, priority, dueDate } = req.body;

    if (!anonId || typeof anonId !== 'string' || anonId.trim() === '') {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'invalid_input', message: 'Task title is required.' });
    }

    if (title.length > 100) {
      return res.status(400).json({ error: 'invalid_input', message: 'Task title cannot exceed 100 characters.' });
    }

    const task = Task.create({ anonId, title, category, priority, dueDate });
    return res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to create task.' });
  }
});

// GET /api/tasks/:anonId - Get tasks for given anonId, optionally filtered by date
router.get('/:anonId', (req, res) => {
  try {
    const { anonId } = req.params;
    let { date } = req.query;

    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    if (date === 'today') {
      date = new Date().toISOString().split('T')[0];
    }

    const tasks = Task.findByAnonId(anonId, date);
    return res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to fetch tasks.' });
  }
});

// GET /api/tasks/:anonId/summary - Get summary stats for student dashboard
router.get('/:anonId/summary', (req, res) => {
  try {
    const { anonId } = req.params;
    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    const summary = Task.getSummary(anonId);
    return res.json(summary);
  } catch (err) {
    console.error('Error fetching task summary:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to fetch task summary.' });
  }
});

// GET /api/tasks/:anonId/correlation - Personal task vs stress correlation calculation
router.get('/:anonId/correlation', (req, res) => {
  try {
    const { anonId } = req.params;
    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    const correlation = Task.getCorrelationData(anonId);
    return res.json(correlation);
  } catch (err) {
    console.error('Error fetching correlation data:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to compute personal correlation.' });
  }
});

// PATCH /api/tasks/:taskId/complete - Mark task completed / uncompleted
router.patch('/:taskId/complete', (req, res) => {
  try {
    const { taskId } = req.params;
    const { anonId, completed } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Task ID is required.' });
    }

    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required for verification.' });
    }

    const isCompleted = completed !== undefined ? Boolean(completed) : true;
    const updatedTask = Task.markCompleted(taskId, anonId, isCompleted);

    if (!updatedTask) {
      return res.status(404).json({ error: 'not_found', message: 'Task not found or unauthorized.' });
    }

    return res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to update task status.' });
  }
});

// DELETE /api/tasks/:taskId - Delete task with anonId verification
router.delete('/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const { anonId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Task ID is required.' });
    }

    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required for verification.' });
    }

    const success = Task.delete(taskId, anonId);
    if (!success) {
      return res.status(404).json({ error: 'not_found', message: 'Task not found or unauthorized.' });
    }

    return res.json({ message: 'Task deleted successfully.', taskId: Number(taskId) });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to delete task.' });
  }
});

module.exports = router;
