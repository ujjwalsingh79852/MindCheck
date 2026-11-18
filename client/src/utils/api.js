const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Check-ins
  submitCheckIn: (data) =>
    request('/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCheckInHistory: (anonId) => request(`/checkins/${anonId}`),

  getNudge: (anonId) => request(`/checkins/${anonId}/nudge`),

  // Tasks
  createTask: (data) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTasks: (anonId, dateFilter = null) => {
    const query = dateFilter ? `?date=${dateFilter}` : '';
    return request(`/tasks/${anonId}${query}`);
  },

  completeTask: (taskId, anonId, completed = true) =>
    request(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ anonId, completed }),
    }),

  deleteTask: (taskId, anonId) =>
    request(`/tasks/${taskId}`, {
      method: 'DELETE',
      body: JSON.stringify({ anonId }),
    }),

  getTaskSummary: (anonId) => request(`/tasks/${anonId}/summary`),

  getCorrelation: (anonId) => request(`/tasks/${anonId}/correlation`),

  // Counselor Dashboard
  getDashboardTrends: (range = '7d', department = '') => {
    const query = `?range=${range}${department ? `&department=${encodeURIComponent(department)}` : ''}`;
    return request(`/dashboard/trends${query}`);
  },

  getDashboardSummary: () => request('/dashboard/summary'),

  adminLogin: (password) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};
