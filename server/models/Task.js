const db = require('../db');

class Task {
  static create({ anonId, title, category = 'study', priority = 'medium', dueDate }) {
    const createdAt = new Date().toISOString();
    const formattedDueDate = dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const validCategory = ['study', 'personal', 'other'].includes(category) ? category : 'study';
    const validPriority = ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';

    const newTask = {
      id: db.data.nextTaskId++,
      anonId,
      title: String(title).substring(0, 100),
      category: validCategory,
      priority: validPriority,
      dueDate: formattedDueDate,
      completed: false,
      createdAt,
      completedAt: null
    };

    db.data.tasks.push(newTask);
    db.save();
    return newTask;
  }

  static findById(id) {
    return db.data.tasks.find(t => t.id === Number(id)) || null;
  }

  static findByAnonId(anonId, dateFilter = null) {
    let list = db.data.tasks.filter(t => t.anonId === anonId);

    if (dateFilter) {
      const targetDate = new Date(dateFilter).toISOString().split('T')[0];
      list = list.filter(t => t.dueDate === targetDate);
    }

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const prioDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (prioDiff !== 0) return prioDiff;
      return b.id - a.id;
    });
  }

  static markCompleted(id, anonId, completed = true) {
    const task = db.data.tasks.find(t => t.id === Number(id) && t.anonId === anonId);
    if (!task) return null;

    task.completed = Boolean(completed);
    task.completedAt = task.completed ? new Date().toISOString() : null;
    db.save();
    return task;
  }

  static delete(id, anonId) {
    const index = db.data.tasks.findIndex(t => t.id === Number(id) && t.anonId === anonId);
    if (index === -1) return false;

    db.data.tasks.splice(index, 1);
    db.save();
    return true;
  }

  static getSummary(anonId) {
    const today = new Date().toISOString().split('T')[0];
    const userTasks = db.data.tasks.filter(t => t.anonId === anonId);

    const todayTasks = userTasks.filter(t => t.dueDate === today);
    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter(t => t.completed).length;
    const pendingToday = totalToday - completedToday;

    const overdueCount = userTasks.filter(t => t.dueDate < today && !t.completed).length;

    return {
      totalToday,
      completedToday,
      pendingToday,
      overdueCount
    };
  }

  static getCorrelationData(anonId) {
    const checkins = db.data.checkins
      .filter(c => c.anonId === anonId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!checkins || checkins.length === 0) {
      return {
        message: "Complete your first check-in to unlock personal task-stress insights!",
        pendingTaskAvgStress: 0,
        lightDayAvgStress: 0,
        dataPoints: 0
      };
    }

    const heavyDaysStress = [];
    const lightDaysStress = [];
    const highWorkloadStress = [];
    const lowWorkloadStress = [];

    const userTasks = db.data.tasks.filter(t => t.anonId === anonId);

    checkins.forEach(c => {
      const checkDate = c.date.split('T')[0];
      const pendingCount = userTasks.filter(t => {
        const isDueOnOrBefore = t.dueDate <= checkDate;
        const notCompletedByDate = !t.completed || (t.completedAt && t.completedAt.split('T')[0] > checkDate);
        return isDueOnOrBefore && notCompletedByDate;
      }).length;

      const workloadIndex = c.workloadIndex || 50;

      if (pendingCount >= 5 || workloadIndex >= 65) {
        heavyDaysStress.push(c.stress);
      } else {
        lightDaysStress.push(c.stress);
      }

      if (workloadIndex >= 60) {
        highWorkloadStress.push(c.stress);
      } else {
        lowWorkloadStress.push(c.stress);
      }
    });

    const calcAvg = (arr) => arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;

    const pendingTaskAvgStress = calcAvg(heavyDaysStress);
    const lightDayAvgStress = calcAvg(lightDaysStress);
    const highWorkloadAvgStress = calcAvg(highWorkloadStress);
    const lowWorkloadAvgStress = calcAvg(lowWorkloadStress);

    let message = "Your task load and stress levels show a healthy balance!";
    if (heavyDaysStress.length > 0 && lightDaysStress.length > 0) {
      const diff = Number((pendingTaskAvgStress - lightDayAvgStress).toFixed(1));
      if (diff > 0) {
        message = `On high-workload days (5+ tasks or high deadline pressure), your average stress score is ${diff} points higher (${pendingTaskAvgStress}/10) than on lighter days (${lightDayAvgStress}/10).`;
      } else if (diff < 0) {
        message = `You handle busy task days smoothly, maintaining lower stress on high-workload days!`;
      }
    } else if (heavyDaysStress.length > 0) {
      message = `On high deadline pressure days, your average stress score is ${pendingTaskAvgStress}/10.`;
    } else {
      message = `On lighter task days, your average stress score is ${lightDayAvgStress}/10. Keep up the great balance!`;
    }

    return {
      message,
      pendingTaskAvgStress,
      lightDayAvgStress,
      highWorkloadAvgStress,
      lowWorkloadAvgStress,
      heavyDayCount: heavyDaysStress.length,
      lightDayCount: lightDaysStress.length,
      dataPoints: checkins.length
    };
  }

  static getAggregateDailyPendingTasks(startDate, endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const pendingTasks = db.data.tasks.filter(t => {
      if (t.completed) return false;
      const createdMs = new Date(t.createdAt).getTime();
      return createdMs >= startMs && createdMs <= endMs;
    });

    const userDayGroup = {};
    pendingTasks.forEach(t => {
      const day = t.createdAt.split('T')[0];
      const key = `${t.anonId}_${day}`;
      userDayGroup[key] = (userDayGroup[key] || 0) + 1;
    });

    const dayTotals = {};
    const dayCounts = {};
    Object.keys(userDayGroup).forEach(key => {
      const [_, day] = key.split('_');
      dayTotals[day] = (dayTotals[day] || 0) + userDayGroup[key];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    return Object.keys(dayTotals).sort().map(day => ({
      day,
      avgPendingTasks: Number((dayTotals[day] / dayCounts[day]).toFixed(2))
    }));
  }
}

module.exports = Task;
