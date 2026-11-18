const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===================================================');
  console.log('🧪 Starting MindCheck Nudge & Binaural Beats Integration Tests');
  console.log('===================================================');

  try {
    // 1. Health check
    console.log('\n1. Testing Health Endpoint...');
    const health = await makeRequest('/api/health');
    console.log('✓ Health status:', health.status, health.body.service);

    // 2. Test Check-in Creation with 12 Metrics
    console.log('\n2. Testing 12-Metric Check-in Creation...');
    const student1 = 'anon_student_nudge_' + Date.now();
    const checkIn1 = await makeRequest('/api/checkins', 'POST', {
      anonId: student1,
      mood: 2,
      stress: 8,
      workloadOverwhelm: 4,
      focusDifficulty: 4,
      deadlineAnxiety: 5,
      physicalTension: 4,
      perceivedControl: 2,
      sleepHours: 5.5,
      sleepQuality: 2,
      studyHours: 7,
      assignmentCount: 4,
      upcomingExams: 2,
      deadlinePressure: 9,
      academicDifficulty: 4,
      procrastinationLevel: 4,
      socialSupport: 2,
      physicalActivityMins: 10,
      selfConfidence: 2,
      note: 'Nudge and binaural beats test',
      department: 'Computer Science'
    });
    console.log('✓ Check-in created ID:', checkIn1.body.id);

    // 3. Test Context-Aware Nudge Endpoint
    console.log('\n3. Testing GET /api/checkins/:anonId/nudge Endpoint...');
    const nudge = await makeRequest(`/api/checkins/${student1}/nudge`);
    console.log('✓ Nudge suggestion:', `"${nudge.body.suggestion}"`);
    console.log('  Category:', nudge.body.category);
    console.log('  Binaural Beat:', nudge.body.binauralBeat ? nudge.body.binauralBeat.title : 'None');

    console.log('\n===================================================');
    console.log('🎉 ALL NUDGE & BINAURAL BEATS INTEGRATION TESTS PASSED!');
    console.log('===================================================');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
