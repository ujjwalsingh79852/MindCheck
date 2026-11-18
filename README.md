# MindCheck — Anonymous Student Mental Wellness Check-in & Daily Task Planner

**MindCheck** is a full-stack web application designed for college campuses. It combines daily anonymous mental wellness check-ins with an integrated task planner. By cross-referencing self-reported stress levels with pending/overdue task load, MindCheck surfaces private early-warning insights to students and safe, aggregate-only trend analytics for campus counseling cells.

---

## 🌟 Key Features

1. **100% Anonymous Student Experience**:
   - Zero registration, email, or personal identity required.
   - Automatically generates a persistent device UUID stored in `localStorage` (`mindcheck_anon_id`).

2. **Daily Mental Wellness Check-in**:
   - 60-second reflection on Mood (1-5), Stress Level (1-10), Sleep Hours, and gentle daily reflection notes.
   - 6-hour server-side rate limiting per anonymous device ID to prevent spamming.

3. **Integrated Task Planner**:
   - Manage tasks grouped by **Overdue**, **Today**, and **Upcoming**.
   - **Smart Sub-task Breakdown**: Client-side heuristic detects complex project titles (keywords like *"project"*, *"assignment"*, *"prepare"*, *"complete"*) and offers an interactive sub-task checklist generator.
   - **Non-Judgmental Overdue Banner**: Overdue tasks are highlighted in soft amber with a single-click *"Move to today?"* action rather than alarming red alerts.
   - **Supportive End-of-Day Summary**: Celebrates progress regardless of task completion count.

4. **Personal Task-Stress Correlation (Private)**:
   - Cross-references a student's Check-in history with their pending task load on busy vs. light days.
   - Strictly isolated to the individual student's device ID. Never mixed across users.

5. **Counseling Cell Aggregate Dashboard ($k$-Anonymity $k \ge 5$)**:
   - Password-gated admin portal for counselors (`admin123`).
   - Displays 7-day / 30-day aggregate trends (avg mood, avg stress, avg pending task load per student) and department filtering.
   - **Strict $k$-Anonymity Enforcement**: Server rejects requests with fewer than 5 unique anonymous contributors (`insufficient_data`) to prevent individual de-anonymization.

6. **Interactive Support & Breathing Exercise Guide**:
   - 4-7-8 relaxing breath guide widget with animated circle.
   - Campus emergency helpline numbers and counselor appointment links.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 18, Vite, Lucide Icons, Plain CSS (CSS Variables, responsive Flexbox/Grid, calming palette).
- **Backend**: Node.js, Express.js.
- **Database**: Zero-dependency pure JavaScript file-backed JSON database engine (`database.json` in `/server`), ensuring out-of-the-box local execution on any system without requiring native compilation or MongoDB daemons.

---

## 🚀 How to Run (Single Localhost Server)

Both the React Frontend and Node.js Express API are hosted on the **same single localhost port** (`http://localhost:5000`).

### Quick Start (From Root Directory)

```bash
# 1. Install dependencies (if not already done)
npm install --prefix client
npm install --prefix server

# 2. Build client and start full-stack server on http://localhost:5000
npm start
```

Open **`http://localhost:5000`** in your browser to access the full application!

- **Web App**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

---

## 🔑 Environment Variables (`/server/.env`)

```env
PORT=5000
ADMIN_PASSWORD=admin123
MONGO_URI=
```

- **`ADMIN_PASSWORD`**: Password required for accessing the Counselor Dashboard (default: `admin123`).

---

## 🧪 Running Automated API & Privacy Tests

To verify backend endpoints, 6-hour rate limiting, single-student correlation isolation, and $k$-anonymity enforcement ($k \ge 5$):

```bash
npm test
```

---

## 🔒 Privacy & Safety Statement

- No personally identifiable information (PII) is stored or logged.
- All personal insights are computed strictly per anonymous device ID.
- Counselors can only access aggregate summaries when $N \ge 5$ student check-ins exist.
- Language throughout the application is supportive, non-judgmental, and non-diagnostic.
