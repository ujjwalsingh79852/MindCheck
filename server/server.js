const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const checkinsRouter = require('./routes/checkins');
const tasksRouter = require('./routes/tasks');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Request logging middleware (sanitized for privacy - never logs body/PII)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve static frontend assets from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/checkins', checkinsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', dashboardRouter); // Handles POST /api/admin/login

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MindCheck API Server', timestamp: new Date().toISOString() });
});

// SPA Fallback Route for non-API requests
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'not_found', message: 'Requested API endpoint does not exist.' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Frontend static files not found. Please run "npm run build" in client folder first.');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'server_error', message: 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`MindCheck Full-Stack App running on single host:`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Privacy Safeguard: k-anonymity (k>=5) active`);
  console.log(`=================================================`);
});
