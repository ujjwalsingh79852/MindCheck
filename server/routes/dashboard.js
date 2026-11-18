const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const Task = require('../models/Task');

const K_ANONYMITY_THRESHOLD = 5;

// GET /api/dashboard/trends - Counselor aggregate trend analytics with k-anonymity
router.get('/trends', (req, res) => {
  try {
    const { range = '7d', department } = req.query;

    const days = range === '30d' ? 30 : 7;
    const endDateObj = new Date();
    const startDateObj = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const startDate = startDateObj.toISOString();
    const endDate = endDateObj.toISOString();

    // 1. Enforce k-anonymity check
    const uniqueAnonIds = CheckIn.getUniqueAnonIdCount(startDate, endDate, department);

    if (uniqueAnonIds < K_ANONYMITY_THRESHOLD) {
      return res.json({
        error: 'insufficient_data',
        message: `Not enough data to display (privacy protection). A minimum of ${K_ANONYMITY_THRESHOLD} unique student check-ins is required to protect student anonymity (currently ${uniqueAnonIds}).`,
        uniqueUsers: uniqueAnonIds,
        threshold: K_ANONYMITY_THRESHOLD
      });
    }

    // 2. Fetch aggregate trends
    const checkInTrends = CheckIn.getAggregateTrends(startDate, endDate, department);
    const taskTrends = Task.getAggregateDailyPendingTasks(startDate, endDate);

    // Map task trends by date for easy lookup
    const taskMap = {};
    taskTrends.forEach(t => {
      taskMap[t.day] = t.avgPendingTasks;
    });

    // Merge check-in and task daily aggregates
    const trends = checkInTrends.map(c => ({
      date: c.day,
      avgMood: c.avgMood,
      avgStress: c.avgStress,
      avgPendingTasks: taskMap[c.day] || 0,
      totalCheckIns: c.totalCheckIns,
      uniqueUsers: c.uniqueUsers
    }));

    return res.json({
      range,
      department: department || 'All Departments',
      uniqueUsers: uniqueAnonIds,
      trends
    });
  } catch (err) {
    console.error('Error fetching dashboard trends:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to compute aggregate trends.' });
  }
});

// GET /api/dashboard/summary - Counselor aggregate summary metrics (week-over-week)
router.get('/summary', (req, res) => {
  try {
    const now = Date.now();
    const msInWeek = 7 * 24 * 60 * 60 * 1000;

    const thisWeekStart = new Date(now - msInWeek).toISOString();
    const thisWeekEnd = new Date(now).toISOString();

    const lastWeekStart = new Date(now - 2 * msInWeek).toISOString();
    const lastWeekEnd = new Date(now - msInWeek).toISOString();

    // k-anonymity check for this week
    const thisWeekUsers = CheckIn.getUniqueAnonIdCount(thisWeekStart, thisWeekEnd);
    if (thisWeekUsers < K_ANONYMITY_THRESHOLD) {
      return res.json({
        error: 'insufficient_data',
        message: `Not enough student check-ins this week to display aggregate summary (requires $\\ge ${K_ANONYMITY_THRESHOLD}$, currently ${thisWeekUsers}).`
      });
    }

    const thisWeekStats = CheckIn.getSummaryStats(thisWeekStart, thisWeekEnd);
    const lastWeekStats = CheckIn.getSummaryStats(lastWeekStart, lastWeekEnd);

    const thisWeekTasks = Task.getAggregateDailyPendingTasks(thisWeekStart, thisWeekEnd);
    const lastWeekTasks = Task.getAggregateDailyPendingTasks(lastWeekStart, lastWeekEnd);

    const calcAvgTaskLoad = (arr) => arr.length > 0 ? arr.reduce((acc, curr) => acc + curr.avgPendingTasks, 0) / arr.length : 0;

    const thisWeekAvgTasks = calcAvgTaskLoad(thisWeekTasks);
    const lastWeekAvgTasks = calcAvgTaskLoad(lastWeekTasks);

    const thisWeekStress = thisWeekStats.avgStress || 0;
    const lastWeekStress = lastWeekStats.avgStress || 0;

    // Percent changes
    const stressChangePct = lastWeekStress > 0 
      ? Number((((thisWeekStress - lastWeekStress) / lastWeekStress) * 100).toFixed(1))
      : 0;

    const taskLoadChangePct = lastWeekAvgTasks > 0
      ? Number((((thisWeekAvgTasks - lastWeekAvgTasks) / lastWeekAvgTasks) * 100).toFixed(1))
      : 0;

    // Workload vs stress correlation trend text
    let correlationTrend = "Workload and stress levels are maintaining a steady baseline.";
    if (stressChangePct > 0 && taskLoadChangePct > 0) {
      correlationTrend = "Workload and stress both increased this week compared to last week.";
    } else if (stressChangePct < 0 && taskLoadChangePct < 0) {
      correlationTrend = "Workload eased and stress levels decreased this week.";
    } else if (stressChangePct > 0 && taskLoadChangePct <= 0) {
      correlationTrend = "Stress increased this week despite workload remaining steady/lower.";
    } else if (stressChangePct <= 0 && taskLoadChangePct > 0) {
      correlationTrend = "Students maintained lower stress levels despite an increase in task workload.";
    }

    return res.json({
      thisWeek: {
        avgStress: thisWeekStress,
        avgMood: thisWeekStats.avgMood || 0,
        totalCheckIns: thisWeekStats.totalCheckIns || 0,
        avgPendingTasks: Number(thisWeekAvgTasks.toFixed(1)),
        uniqueStudents: thisWeekUsers
      },
      lastWeek: {
        avgStress: lastWeekStress,
        avgMood: lastWeekStats.avgMood || 0,
        totalCheckIns: lastWeekStats.totalCheckIns || 0,
        avgPendingTasks: Number(lastWeekAvgTasks.toFixed(1))
      },
      percentChanges: {
        stressChangePct,
        taskLoadChangePct
      },
      correlationTrend
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to compute dashboard summary.' });
  }
});

// POST /api/admin/login - Simple hardcoded admin password gate
router.post('/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ error: 'unauthorized', message: 'Incorrect counselor access password.' });
    }

    return res.json({
      success: true,
      token: 'mock-admin-token-mindcheck-2026',
      message: 'Counselor Dashboard Authentication Successful'
    });
  } catch (err) {
    console.error('Error during admin login:', err);
    return res.status(500).json({ error: 'server_error', message: 'Login failed due to server error.' });
  }
});

module.exports = router;
