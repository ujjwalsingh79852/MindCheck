const db = require('../db');

const SUGGESTION_POOL = [
  { category: "movement", text: "Taking a 5-minute walk might help clear your thoughts." },
  { category: "movement", text: "Stretching for a couple of minutes could release stored physical tension." },
  { category: "movement", text: "Stepping outside for a breath of fresh air might feel refreshing right now." },
  { category: "rest", text: "Taking a short break from your screen could give your eyes a well-deserved rest." },
  { category: "rest", text: "Having a glass of water and pausing for a moment might help restore your focus." },
  { category: "mental", text: "Jotting down what's on your mind could help unpack your thoughts." },
  { category: "mental", text: "Listing three small things that went okay today might bring a gentle perspective." },
  { category: "social", text: "Sending a quick message to a friend could offer a warm moment of connection." }
];

const BINAURAL_BEATS_POOL = [
  {
    title: "432 Hz Solfeggio — Deep Stress Release",
    frequency: "432 Hz",
    description: "Promotes natural relaxation, reduces anxiety, and brings mental harmony.",
    youtubeUrl: "https://www.youtube.com/results?search_query=432+hz+binaural+beats+stress+relief"
  },
  {
    title: "528 Hz — Transformation & Positive Mood",
    frequency: "528 Hz",
    description: "Associated with mood enhancement, inner calm, and positive energy.",
    youtubeUrl: "https://www.youtube.com/results?search_query=528+hz+binaural+beats+positive+mood"
  },
  {
    title: "10 Hz Alpha Waves — Smooth Focus & Calm Mind",
    frequency: "10 Hz Alpha",
    description: "Encourages relaxed alertness, perfect for light studying or winding down.",
    youtubeUrl: "https://www.youtube.com/results?search_query=10+hz+alpha+waves+binaural+beats"
  },
  {
    title: "6 Hz Theta Waves — Mindful Rest & Tranquility",
    frequency: "6 Hz Theta",
    description: "Supports deep meditation, restorative breaks, and evening relaxation.",
    youtubeUrl: "https://www.youtube.com/results?search_query=6+hz+theta+waves+binaural+beats"
  }
];

class CheckIn {
  static calcWorkloadIndex(rec) {
    const studyScore = Math.min(1, (rec.studyHours || 0) / 10) * 20;
    const assignScore = Math.min(1, (rec.assignmentCount || 0) / 8) * 20;
    const examScore = Math.min(1, (rec.upcomingExams || 0) / 4) * 20;
    const pressureScore = ((rec.deadlinePressure || 5) / 10) * 20;
    const diffScore = ((rec.academicDifficulty || 3) / 5) * 20;
    return Math.round(studyScore + assignScore + examScore + pressureScore + diffScore);
  }

  static calcResilienceIndex(rec) {
    const sleepDurScore = Math.min(1, (rec.sleepHours || 0) / 8) * 25;
    const sleepQualScore = ((rec.sleepQuality || 3) / 5) * 20;
    const supportScore = ((rec.socialSupport || 3) / 5) * 20;
    const confScore = ((rec.selfConfidence || 3) / 5) * 20;
    const actScore = Math.min(1, (rec.physicalActivityMins || 0) / 45) * 15;
    return Math.round(sleepDurScore + sleepQualScore + supportScore + confScore + actScore);
  }

  static calcPerceivedStressIndex(rec) {
    const overallStress = Number(rec.stress || 5) * 2;
    const overwhelm = Number(rec.workloadOverwhelm || 3);
    const focus = Number(rec.focusDifficulty || 3);
    const anxiety = Number(rec.deadlineAnxiety || 3);
    const physical = Number(rec.physicalTension || 3);
    const controlInverted = 6 - Number(rec.perceivedControl || 3);

    const totalRaw = overallStress + overwhelm + focus + anxiety + physical + controlInverted;
    return Math.min(100, Math.max(0, Math.round((totalRaw / 45) * 100)));
  }

  static create(data) {
    const date = new Date().toISOString();
    const newRecord = {
      id: db.data.nextCheckInId++,
      anonId: data.anonId,
      date,
      mood: Number(data.mood || 3),
      stress: Number(data.stress || 5),
      workloadOverwhelm: Number(data.workloadOverwhelm || 3),
      focusDifficulty: Number(data.focusDifficulty || 3),
      deadlineAnxiety: Number(data.deadlineAnxiety || 3),
      physicalTension: Number(data.physicalTension || 3),
      perceivedControl: Number(data.perceivedControl || 3),
      sleepHours: Number(data.sleepHours || 7),
      sleepQuality: Number(data.sleepQuality || 3),
      studyHours: Number(data.studyHours || 3),
      assignmentCount: Number(data.assignmentCount || 0),
      upcomingExams: Number(data.upcomingExams || 0),
      deadlinePressure: Number(data.deadlinePressure || 5),
      academicDifficulty: Number(data.academicDifficulty || 3),
      procrastinationLevel: Number(data.procrastinationLevel || 3),
      socialSupport: Number(data.socialSupport || 3),
      physicalActivityMins: Number(data.physicalActivityMins || 15),
      selfConfidence: Number(data.selfConfidence || 3),
      note: String(data.note || '').substring(0, 300),
      department: data.department ? String(data.department).trim() : ''
    };

    newRecord.workloadIndex = this.calcWorkloadIndex(newRecord);
    newRecord.resilienceIndex = this.calcResilienceIndex(newRecord);
    newRecord.perceivedStressIndex = this.calcPerceivedStressIndex(newRecord);

    db.data.checkins.push(newRecord);
    db.save();
    return newRecord;
  }

  static findById(id) {
    const item = db.data.checkins.find(c => c.id === Number(id));
    if (!item) return null;
    return {
      ...item,
      workloadIndex: item.workloadIndex || this.calcWorkloadIndex(item),
      resilienceIndex: item.resilienceIndex || this.calcResilienceIndex(item),
      perceivedStressIndex: item.perceivedStressIndex || this.calcPerceivedStressIndex(item)
    };
  }

  static findByAnonId(anonId) {
    return db.data.checkins
      .filter(c => c.anonId === anonId)
      .map(item => ({
        ...item,
        workloadIndex: item.workloadIndex || this.calcWorkloadIndex(item),
        resilienceIndex: item.resilienceIndex || this.calcResilienceIndex(item),
        perceivedStressIndex: item.perceivedStressIndex || this.calcPerceivedStressIndex(item)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static getLatestByAnonId(anonId) {
    const list = this.findByAnonId(anonId);
    return list.length > 0 ? list[0] : null;
  }

  static getRecentCountByAnonId(anonId, hoursWindow = 6) {
    const cutoffTime = Date.now() - hoursWindow * 60 * 60 * 1000;
    return db.data.checkins.filter(c => c.anonId === anonId && new Date(c.date).getTime() >= cutoffTime).length;
  }

  static getNudgeForAnonId(anonId) {
    if (!db.data.lastSuggestions) {
      db.data.lastSuggestions = {};
    }

    const latestCheckIn = this.getLatestByAnonId(anonId);
    const today = new Date().toISOString().split('T')[0];
    const pendingTasksCount = db.data.tasks.filter(t => t.anonId === anonId && t.dueDate === today && !t.completed).length;

    const hour = new Date().getHours();
    let targetCategory = null;

    // Context rules:
    // 1. Late night (after 10 PM / 22:00 or before 5 AM) -> prioritize "rest"
    if (hour >= 22 || hour < 5) {
      targetCategory = "rest";
    }
    // 2. Pending task count high (>=3) -> prioritize "movement"
    else if (pendingTasksCount >= 3) {
      targetCategory = "movement";
    }
    // 3. Social support low (<=2) -> prioritize "social"
    else if (latestCheckIn && latestCheckIn.socialSupport <= 2) {
      targetCategory = "social";
    }

    // Filter candidates by category if targetCategory exists, else full pool
    let candidates = targetCategory 
      ? SUGGESTION_POOL.filter(s => s.category === targetCategory)
      : [...SUGGESTION_POOL];

    if (candidates.length === 0) {
      candidates = [...SUGGESTION_POOL];
    }

    // Avoid repeating lastSuggestionShown for that anonId
    const lastShown = db.data.lastSuggestions[anonId] || "";
    let freshCandidates = candidates.filter(s => s.text !== lastShown);
    if (freshCandidates.length === 0) {
      freshCandidates = candidates; // Fallback if all options were shown
    }

    // Select random suggestion from fresh candidates
    const selectedSuggestion = freshCandidates[Math.floor(Math.random() * freshCandidates.length)];
    db.data.lastSuggestions[anonId] = selectedSuggestion.text;
    db.save();

    // Select matching or random binaural beat audio suggestion
    const binauralBeat = BINAURAL_BEATS_POOL[Math.floor(Math.random() * BINAURAL_BEATS_POOL.length)];

    return {
      suggestion: selectedSuggestion.text,
      category: selectedSuggestion.category,
      binauralBeat,
      lastSuggestionShown: selectedSuggestion.text
    };
  }

  static getAggregateTrends(startDate, endDate, department = null) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const filtered = db.data.checkins.filter(c => {
      const t = new Date(c.date).getTime();
      const matchDate = t >= startMs && t <= endMs;
      if (!matchDate) return false;
      if (department && department.trim() !== '' && department.toLowerCase() !== 'all') {
        return c.department && c.department.toLowerCase() === department.toLowerCase();
      }
      return true;
    });

    const groups = {};
    filtered.forEach(c => {
      const day = c.date.split('T')[0];
      if (!groups[day]) {
        groups[day] = {
          day,
          anonIds: new Set(),
          moodSum: 0,
          stressSum: 0,
          perceivedStressSum: 0,
          sleepQualitySum: 0,
          deadlinePressureSum: 0,
          studyHoursSum: 0,
          workloadSum: 0,
          resilienceSum: 0,
          count: 0
        };
      }
      groups[day].anonIds.add(c.anonId);
      groups[day].moodSum += c.mood;
      groups[day].stressSum += c.stress;
      groups[day].perceivedStressSum += (c.perceivedStressIndex || this.calcPerceivedStressIndex(c));
      groups[day].sleepQualitySum += (c.sleepQuality || 3);
      groups[day].deadlinePressureSum += (c.deadlinePressure || 5);
      groups[day].studyHoursSum += (c.studyHours || 3);
      groups[day].workloadSum += (c.workloadIndex || this.calcWorkloadIndex(c));
      groups[day].resilienceSum += (c.resilienceIndex || this.calcResilienceIndex(c));
      groups[day].count += 1;
    });

    return Object.keys(groups).sort().map(day => {
      const g = groups[day];
      return {
        day,
        uniqueUsers: g.anonIds.size,
        totalCheckIns: g.count,
        avgMood: Number((g.moodSum / g.count).toFixed(2)),
        avgStress: Number((g.stressSum / g.count).toFixed(2)),
        avgPerceivedStressIndex: Number((g.perceivedStressSum / g.count).toFixed(1)),
        avgSleepQuality: Number((g.sleepQualitySum / g.count).toFixed(2)),
        avgDeadlinePressure: Number((g.deadlinePressureSum / g.count).toFixed(2)),
        avgStudyHours: Number((g.studyHoursSum / g.count).toFixed(2)),
        avgWorkloadIndex: Number((g.workloadSum / g.count).toFixed(1)),
        avgResilienceIndex: Number((g.resilienceSum / g.count).toFixed(1))
      };
    });
  }

  static getUniqueAnonIdCount(startDate, endDate, department = null) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const anonIds = new Set();
    db.data.checkins.forEach(c => {
      const t = new Date(c.date).getTime();
      const matchDate = t >= startMs && t <= endMs;
      if (matchDate) {
        if (!department || department.trim() === '' || department.toLowerCase() === 'all' || (c.department && c.department.toLowerCase() === department.toLowerCase())) {
          anonIds.add(c.anonId);
        }
      }
    });

    return anonIds.size;
  }

  static getSummaryStats(startDate, endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const filtered = db.data.checkins.filter(c => {
      const t = new Date(c.date).getTime();
      return t >= startMs && t <= endMs;
    });

    if (filtered.length === 0) {
      return {
        uniqueUsers: 0,
        totalCheckIns: 0,
        avgMood: 0,
        avgStress: 0,
        avgPerceivedStressIndex: 0,
        avgSleepQuality: 0,
        avgDeadlinePressure: 0,
        avgWorkloadIndex: 0,
        avgResilienceIndex: 0
      };
    }

    const anonIds = new Set(filtered.map(c => c.anonId));
    const moodSum = filtered.reduce((acc, curr) => acc + curr.mood, 0);
    const stressSum = filtered.reduce((acc, curr) => acc + curr.stress, 0);
    const perceivedStressSum = filtered.reduce((acc, curr) => acc + (curr.perceivedStressIndex || this.calcPerceivedStressIndex(curr)), 0);
    const sleepQualitySum = filtered.reduce((acc, curr) => acc + (curr.sleepQuality || 3), 0);
    const deadlinePressureSum = filtered.reduce((acc, curr) => acc + (curr.deadlinePressure || 5), 0);
    const workloadSum = filtered.reduce((acc, curr) => acc + (curr.workloadIndex || this.calcWorkloadIndex(curr)), 0);
    const resilienceSum = filtered.reduce((acc, curr) => acc + (curr.resilienceIndex || this.calcResilienceIndex(curr)), 0);

    return {
      uniqueUsers: anonIds.size,
      totalCheckIns: filtered.length,
      avgMood: Number((moodSum / filtered.length).toFixed(2)),
      avgStress: Number((stressSum / filtered.length).toFixed(2)),
      avgPerceivedStressIndex: Number((perceivedStressSum / filtered.length).toFixed(1)),
      avgSleepQuality: Number((sleepQualitySum / filtered.length).toFixed(2)),
      avgDeadlinePressure: Number((deadlinePressureSum / filtered.length).toFixed(2)),
      avgWorkloadIndex: Number((workloadSum / filtered.length).toFixed(1)),
      avgResilienceIndex: Number((resilienceSum / filtered.length).toFixed(1))
    };
  }
}

module.exports = CheckIn;
