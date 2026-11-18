const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');

// GET /api/checkins/:anonId/nudge - Context-aware in-the-moment stress relief suggestion & binaural beats recommendation
router.get('/:anonId/nudge', (req, res) => {
  try {
    const { anonId } = req.params;
    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    const nudge = CheckIn.getNudgeForAnonId(anonId);
    return res.json(nudge);
  } catch (err) {
    console.error('Error fetching context nudge:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to retrieve context nudge.' });
  }
});

// POST /api/checkins - Submit new anonymous check-in with stress assessment questions
router.post('/', (req, res) => {
  try {
    const {
      anonId,
      mood,
      stress,
      workloadOverwhelm,
      focusDifficulty,
      deadlineAnxiety,
      physicalTension,
      perceivedControl,
      sleepHours,
      sleepQuality,
      studyHours,
      assignmentCount,
      upcomingExams,
      deadlinePressure,
      academicDifficulty,
      procrastinationLevel,
      socialSupport,
      physicalActivityMins,
      selfConfidence,
      note,
      department
    } = req.body;

    if (!anonId || typeof anonId !== 'string' || anonId.trim() === '') {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    const moodNum = Number(mood);
    if (isNaN(moodNum) || moodNum < 1 || moodNum > 5) {
      return res.status(400).json({ error: 'invalid_input', message: 'Mood must be between 1 and 5.' });
    }

    const stressNum = Number(stress);
    if (isNaN(stressNum) || stressNum < 1 || stressNum > 10) {
      return res.status(400).json({ error: 'invalid_input', message: 'Stress must be between 1 and 10.' });
    }

    const sleepNum = Number(sleepHours);
    if (isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
      return res.status(400).json({ error: 'invalid_input', message: 'Sleep hours must be between 0 and 24.' });
    }

    // Rate-limiting check: max 1 per 6 hours per anonId
    const recentCheckIns = CheckIn.getRecentCountByAnonId(anonId, 6);
    if (recentCheckIns > 0) {
      return res.status(429).json({
        error: 'rate_limited',
        message: 'You have already submitted a check-in within the last 6 hours. Thank you for staying connected!'
      });
    }

    const checkIn = CheckIn.create({
      anonId,
      mood: moodNum,
      stress: stressNum,
      workloadOverwhelm: workloadOverwhelm !== undefined ? Number(workloadOverwhelm) : 3,
      focusDifficulty: focusDifficulty !== undefined ? Number(focusDifficulty) : 3,
      deadlineAnxiety: deadlineAnxiety !== undefined ? Number(deadlineAnxiety) : 3,
      physicalTension: physicalTension !== undefined ? Number(physicalTension) : 3,
      perceivedControl: perceivedControl !== undefined ? Number(perceivedControl) : 3,
      sleepHours: sleepNum,
      sleepQuality: sleepQuality !== undefined ? Number(sleepQuality) : 3,
      studyHours: studyHours !== undefined ? Number(studyHours) : 3,
      assignmentCount: assignmentCount !== undefined ? Number(assignmentCount) : 0,
      upcomingExams: upcomingExams !== undefined ? Number(upcomingExams) : 0,
      deadlinePressure: deadlinePressure !== undefined ? Number(deadlinePressure) : 5,
      academicDifficulty: academicDifficulty !== undefined ? Number(academicDifficulty) : 3,
      procrastinationLevel: procrastinationLevel !== undefined ? Number(procrastinationLevel) : 3,
      socialSupport: socialSupport !== undefined ? Number(socialSupport) : 3,
      physicalActivityMins: physicalActivityMins !== undefined ? Number(physicalActivityMins) : 15,
      selfConfidence: selfConfidence !== undefined ? Number(selfConfidence) : 3,
      note,
      department
    });

    return res.status(201).json(checkIn);
  } catch (err) {
    console.error('Error creating check-in:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to process check-in.' });
  }
});

// GET /api/checkins/:anonId - Get check-in history for one student
router.get('/:anonId', (req, res) => {
  try {
    const { anonId } = req.params;
    if (!anonId) {
      return res.status(400).json({ error: 'invalid_input', message: 'Anonymous ID is required.' });
    }

    const history = CheckIn.findByAnonId(anonId);
    return res.json(history);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to retrieve check-in history.' });
  }
});

module.exports = router;
