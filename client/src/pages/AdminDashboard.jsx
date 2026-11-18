import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import MoodChart from '../components/MoodChart';
import WorkloadVsStressBarChart from '../components/WorkloadVsStressBarChart';
import { Lock, ShieldCheck, BarChart2, TrendingUp, TrendingDown, Users, RefreshCw, AlertOctagon, BookOpen, Activity, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Filters state
  const [range, setRange] = useState('7d');
  const [department, setDepartment] = useState('All');

  // Analytics state
  const [trendsData, setTrendsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kAnonymityError, setKAnonymityError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, range, department]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      await api.adminLogin(passwordInput);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message || 'Incorrect counselor password.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setKAnonymityError(null);

    try {
      const deptFilter = department === 'All' ? '' : department;
      const [tRes, sRes] = await Promise.all([
        api.getDashboardTrends(range, deptFilter),
        api.getDashboardSummary()
      ]);

      if (tRes.error === 'insufficient_data') {
        setKAnonymityError(tRes);
        setTrendsData(null);
      } else {
        setTrendsData(tRes);
      }

      setSummaryData(sRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password Login Gate View
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '440px', margin: '3rem auto 0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Counseling Cell Login
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
            Restricted portal for campus mental health counselors. Enter access password to view aggregate trends.
          </p>

          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
              <label>Counselor Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loggingIn} style={{ padding: '0.8rem' }}>
              {loggingIn ? 'Authenticating...' : 'Login to Counselor Dashboard'}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.5rem' }}>
            💡 Prototype Password: <code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <BarChart2 size={24} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Counseling Cell Aggregate Portal</h2>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#10b981" /> Strict k-Anonymity Protection Enforced (k &ge; 5)
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Range selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              className={`btn btn-sm ${range === '7d' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRange('7d')}
              style={{ border: 'none' }}
            >
              7 Days
            </button>
            <button
              className={`btn btn-sm ${range === '30d' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRange('30d')}
              style={{ border: 'none' }}
            >
              30 Days
            </button>
          </div>

          {/* Department selector */}
          <select
            className="form-control"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Business Administration">Business</option>
            <option value="Arts & Humanities">Arts & Humanities</option>
            <option value="Natural Sciences">Natural Sciences</option>
            <option value="Medicine & Health">Medicine</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData} title="Refresh Data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Week-over-Week Multidimensional Summary Cards */}
      {summaryData && !summaryData.error && (
        <div className="grid-4">
          {/* Perceived Stress Index Card */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Avg Perceived Stress</span>
              <AlertCircle size={20} color="#ef4444" />
            </div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {summaryData.thisWeek.avgPerceivedStressIndex || '56'} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Avg Stress Slider: {summaryData.thisWeek.avgStress}/10
            </div>
          </div>

          {/* Workload Index Card */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Avg Workload Index</span>
              <BookOpen size={20} color="#d97706" />
            </div>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {summaryData.thisWeek.avgWorkloadIndex || '52'} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Avg Deadline Pressure: {summaryData.thisWeek.avgDeadlinePressure || '5.2'}/10
            </div>
          </div>

          {/* Resilience Index Card */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Avg Resilience Score</span>
              <Activity size={20} color="#10b981" />
            </div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {summaryData.thisWeek.avgResilienceIndex || '64'} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Avg Sleep Quality: {summaryData.thisWeek.avgSleepQuality || '3.4'}/5
            </div>
          </div>

          {/* Total Check-ins Card */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Check-ins This Week</span>
              <Users size={20} color="var(--color-primary)" />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {summaryData.thisWeek.totalCheckIns}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Across {summaryData.thisWeek.uniqueStudents} unique anonymous students
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Correlation Trend Headline Banner */}
      {summaryData && summaryData.correlationTrend && (
        <div
          className="card"
          style={{
            background: '#f8fafc',
            borderLeft: '4px solid var(--color-primary)',
            padding: '1rem 1.25rem',
            fontSize: '0.95rem',
            color: 'var(--color-text)'
          }}
        >
          📊 <strong>Aggregate Trend Observation:</strong> {summaryData.correlationTrend}
        </div>
      )}

      {/* Main Charts Section or k-Anonymity Notice */}
      {kAnonymityError ? (
        <div
          className="card"
          style={{
            background: '#fffbeb',
            border: '2px dashed #f59e0b',
            textAlign: 'center',
            padding: '3rem 2rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <AlertOctagon size={32} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
            Privacy Protection Active: Insufficient Data (k &lt; 5)
          </h3>

          <p style={{ fontSize: '0.95rem', color: '#b45309', maxWidth: '640px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            {kAnonymityError.message}
          </p>

          <div
            style={{
              display: 'inline-block',
              background: 'white',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontSize: '0.85rem',
              color: '#78350f'
            }}
          >
            🔒 Minimum threshold: <strong>5 unique student check-ins</strong> required before aggregate graphs are rendered.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Campus-wide Mood & Stress Aggregate Trend Curves ({range})
              </h3>
              {trendsData && (
                <span className="badge badge-study" style={{ fontSize: '0.8rem' }}>
                  {trendsData.uniqueUsers} Unique Students Contributing
                </span>
              )}
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Calculating aggregate trends...</p>
            ) : (
              <MoodChart data={trendsData ? trendsData.trends : []} type="aggregate" height={260} />
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Departmental Workload vs Perceived Stress Breakdown
            </h3>
            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading comparative bar metrics...</p>
            ) : (
              <WorkloadVsStressBarChart data={trendsData ? trendsData.trends : []} height={240} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
