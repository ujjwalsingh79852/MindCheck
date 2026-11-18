const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

const initialData = {
  checkins: [],
  tasks: [],
  nextCheckInId: 1,
  nextTaskId: 1
};

function loadData() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw);
    
    if (!parsed.checkins) parsed.checkins = [];
    if (!parsed.tasks) parsed.tasks = [];
    if (!parsed.nextCheckInId) {
      parsed.nextCheckInId = parsed.checkins.length > 0 ? Math.max(...parsed.checkins.map(c => c.id || 0)) + 1 : 1;
    }
    if (!parsed.nextTaskId) {
      parsed.nextTaskId = parsed.tasks.length > 0 ? Math.max(...parsed.tasks.map(t => t.id || 0)) + 1 : 1;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading database file, initializing fresh:', err);
    return initialData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

const dbData = loadData();

const db = {
  get data() {
    return dbData;
  },
  save() {
    saveData(dbData);
  }
};

console.log('JSON Database engine initialized successfully at:', dbPath);

module.exports = db;
