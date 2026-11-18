import React, { useState, useEffect } from 'react';
import { getAnonId } from '../utils/anonId';
import { api } from '../utils/api';
import WellnessBadges from '../components/WellnessBadges';
import { Smile, CheckSquare, Flame, Award, Users, ArrowRight, Sparkles, Activity, BookOpen, Moon } from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const [anonId] = useState(getAnonId);
  const [taskSummary, setTaskSummary] = useState({ totalToday: 0, completedToday: 0, pendingToday: 0, overdueCount: 0 });
  const [todayTasks, setTodayTasks] = useState([]);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sumRes, tasksRes, historyRes] = await Promise.all([
          api.getTaskSummary(anonId),
          api.getTasks(anonId, 'today'),
          api.getCheckInHistory(anonId)
        ]);

        setTaskSummary(sumRes);
        setTodayTasks(tasksRes);
        setCheckInHistory(historyRes);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [anonId]);

  // Determine today's checkin status
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkInHistory.find(c => c.date && c.date.split('T')[0] === todayStr);

  // Calculate streak (consecutive days of check-ins)
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;
    const dates = [...new Set(history.map(c => c.date.split('T')[0]))].sort().reverse();

    let streak = 0;
    let curr = new Date();

    let checkDateStr = curr.toISOString().split('T')[0];
    if (!dates.includes(checkDateStr)) {
      curr.setDate(curr.getDate() - 1);
      checkDateStr = curr.toISOString().split('T')[0];
      if (!dates.includes(checkDateStr)) {
        return 0;
      }
    }

    while (dates.includes(checkDateStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
      checkDateStr = curr.toISOString().split('T')[0];
    }
    return streak;
  };

  const streak = calculateStreak(checkInHistory);
  const totalCheckIns = checkInHistory.length;
  const isUnlocked7DayBadge = totalCheckIns >= 7;

  const moodEmojis = ['', '😞', '🙁', '😐', '🙂', '😄'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Welcome Back! 🌱
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Here is your daily wellness & workload summary. Anonymous Device ID: <code style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{anonId.substring(0, 15)}...</code>
          </p>
        </div>

        {/* Streak Badge Medal Graphic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', background: '#ffffff', padding: '0.6rem 1.1rem', borderRadius: '16px', border: '1px solid var(--color-card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <img src="/assets/streak_badge.jpg" alt="Streak Achievement Medal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: streak > 0 ? '#d97706' : 'var(--color-text-muted)' }}>
              {streak > 0 ? `${streak}-Day Streak!` : 'Welcome back!'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {streak > 0 ? 'Consistent check-in habit' : 'Check in today to start a new streak'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid-4">
        {/* Today's Tasks Stat */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Today's Tasks</span>
            <CheckSquare size={20} color="var(--color-primary)" />
          </div>
          <div className="stat-value">
            {taskSummary.completedToday}/{taskSummary.totalToday}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {taskSummary.pendingToday} pending • {taskSummary.overdueCount > 0 ? `${taskSummary.overdueCount} overdue` : '0 overdue'}
          </div>
        </div>

        {/* Check-in Status Stat */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Today's Check-in</span>
            <Smile size={20} color="var(--color-accent)" />
          </div>
          <div className="stat-value" style={{ fontSize: todayCheckIn ? '1.8rem' : '1.3rem', color: todayCheckIn ? '#10b981' : '#f59e0b' }}>
            {todayCheckIn ? `${moodEmojis[todayCheckIn.mood]} Mood ${todayCheckIn.mood}/5` : 'Not checked in'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {todayCheckIn ? `Stress: ${todayCheckIn.stress}/10 • Sleep: ${todayCheckIn.sleepHours}h` : 'Takes 60 seconds'}
          </div>
        </div>

        {/* Workload Index Stat */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Workload Index</span>
            <BookOpen size={20} color="#d97706" />
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {todayCheckIn ? `${todayCheckIn.workloadIndex}` : '--'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {todayCheckIn ? `Pressure: ${todayCheckIn.deadlinePressure}/10` : 'Complete check-in'}
          </div>
        </div>

        {/* Resilience Index Stat */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Resilience Score</span>
            <Activity size={20} color="#10b981" />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {todayCheckIn ? `${todayCheckIn.resilienceIndex}` : '--'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {todayCheckIn ? `Sleep Quality: ${todayCheckIn.sleepQuality}/5` : 'Complete check-in'}
          </div>
        </div>
      </div>

      {/* Main 2 Column Section: Today's Tasks + Check-in Status */}
      <div className="grid-2">
        {/* Left Column: Today's Tasks List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={20} color="var(--color-primary)" /> Today's Task List
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('planner')}>
              Task Planner <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading tasks...</p>
          ) : todayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--color-card-border)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                No tasks scheduled for today yet.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('planner')}>
                + Add Today's Tasks
              </button>
            </div>
          ) : (
            <div>
              {todayTasks.slice(0, 4).map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '1.5px solid var(--color-primary)',
                        backgroundColor: task.completed ? 'var(--color-primary)' : 'transparent'
                      }}
                    />
                    <span className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              ))}
              {todayTasks.length > 4 && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                  + {todayTasks.length - 4} more tasks in Task Planner
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Check-in Quick Action Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smile size={20} color="var(--color-accent)" /> Daily Check-in Status
          </h3>

          {todayCheckIn ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{moodEmojis[todayCheckIn.mood]}</div>
              <h4 style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                You're all checked in for today!
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '1rem' }}>
                Workload Index: <strong>{todayCheckIn.workloadIndex}/100</strong> • Resilience Score: <strong>{todayCheckIn.resilienceIndex}/100</strong>
              </p>
              <button className="btn btn-accent btn-sm" onClick={() => onNavigate('checkin')}>
                View Multidimensional Insights <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌤️</div>
              <h4 style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                You haven't checked in yet today
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: '1.25rem' }}>
                Reflect on your mood, deadline pressure, sleep quality, and academic workload.
              </p>
              <button className="btn btn-warning" onClick={() => onNavigate('checkin')} style={{ width: '100%' }}>
                Start 3-Step Check-in <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Aggregate "You're Not Alone" Stat Banner */}
          <div
            style={{
              marginTop: '1.25rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <Users size={20} color="#0284c7" />
            <div style={{ fontSize: '0.85rem', color: '#0369a1' }}>
              <strong>You're not alone:</strong> 62% of fellow students reported feeling academic deadline pressure this week.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Achievement Badges Section */}
      <WellnessBadges totalCheckIns={totalCheckIns} streak={streak} />

      {/* 7-Day Unlockable Content Reward */}
      {isUnlocked7DayBadge && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #d8b4fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#581c87', marginBottom: '0.2rem' }}>
                Unlocked: 7-Day Consistency Reward! 🎁
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b21a8' }}>
                You completed 7+ check-ins. Enjoy your unlocked 5-minute guided reset exercise in Resources!
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('resources')}>
            View Reset Guide
          </button>
        </div>
      )}
    </div>
  );
}
