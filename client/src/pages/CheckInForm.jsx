import React, { useState, useEffect } from 'react';
import { getAnonId } from '../utils/anonId';
import { api } from '../utils/api';
import MoodChart from '../components/MoodChart';
import { getResultFeedback } from '../utils/resultMessages';
import { Smile, BookOpen, Moon, Heart, ArrowRight, ArrowLeft, ShieldCheck, LifeBuoy, Activity, AlertCircle, HelpCircle, MessageCircle, Sparkles, X, ExternalLink, Compass } from 'lucide-react';

export default function CheckInForm({ onNavigate }) {
  const [anonId] = useState(getAnonId);

  // Form Step state (1, 2, 3)
  const [step, setStep] = useState(1);

  // Step 1: Mood, Overall Stress & Perceived Stress Assessment Questions (PSS-5 Adaptation)
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(5);
  const [workloadOverwhelm, setWorkloadOverwhelm] = useState(3);
  const [focusDifficulty, setFocusDifficulty] = useState(3);
  const [deadlineAnxiety, setDeadlineAnxiety] = useState(3);
  const [physicalTension, setPhysicalTension] = useState(3);
  const [perceivedControl, setPerceivedControl] = useState(3);
  const [selfConfidence, setSelfConfidence] = useState(3);
  const [procrastinationLevel, setProcrastinationLevel] = useState(3);

  // Step 2: Academic Workload & Pressure
  const [studyHours, setStudyHours] = useState(4);
  const [assignmentCount, setAssignmentCount] = useState(2);
  const [upcomingExams, setUpcomingExams] = useState(0);
  const [deadlinePressure, setDeadlinePressure] = useState(5);
  const [academicDifficulty, setAcademicDifficulty] = useState(3);

  // Step 3: Recovery & Support
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [physicalActivityMins, setPhysicalActivityMins] = useState(20);
  const [socialSupport, setSocialSupport] = useState(3);
  const [department, setDepartment] = useState('');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [lastCheckInResult, setLastCheckInResult] = useState(null);
  const [hasPendingTasks, setHasPendingTasks] = useState(false);

  // Context-aware Nudge state
  const [nudgeData, setNudgeData] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Post-submit / History & Correlation state
  const [history, setHistory] = useState([]);
  const [correlation, setCorrelation] = useState(null);

  // Rotating gentle note prompt
  const gentlePrompts = [
    "What's one thing that went okay today?",
    "What's a small victory or moment of peace you experienced today?",
    "Is there anything on your mind you'd like to jot down?",
    "What made you feel supported or calm today?"
  ];
  const [promptIndex] = useState(() => Math.floor(Math.random() * gentlePrompts.length));

  useEffect(() => {
    loadHistoryAndCorrelation();
  }, [anonId]);

  const loadHistoryAndCorrelation = async () => {
    try {
      const [histData, corrData, summaryRes, nudgeRes] = await Promise.all([
        api.getCheckInHistory(anonId),
        api.getCorrelation(anonId),
        api.getTaskSummary(anonId),
        api.getNudge(anonId).catch(() => null)
      ]);
      setHistory(histData);
      setCorrelation(corrData);
      setHasPendingTasks(summaryRes && summaryRes.pendingToday > 0);

      if (nudgeRes) {
        setNudgeData(nudgeRes);
      }

      // Check if submitted within last 6 hours
      const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
      if (histData.length > 0 && new Date(histData[0].date).getTime() >= sixHoursAgo) {
        setHasSubmittedToday(true);
        setLastCheckInResult(histData[0]);
      }
    } catch (err) {
      console.error('Error fetching check-in data:', err);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const result = await api.submitCheckIn({
        anonId,
        mood,
        stress,
        workloadOverwhelm,
        focusDifficulty,
        deadlineAnxiety,
        physicalTension,
        perceivedControl,
        selfConfidence,
        procrastinationLevel,
        studyHours,
        assignmentCount,
        upcomingExams,
        deadlinePressure,
        academicDifficulty,
        sleepHours,
        sleepQuality,
        physicalActivityMins,
        socialSupport,
        department,
        note
      });

      setLastCheckInResult(result);
      setHasSubmittedToday(true);

      // Fetch fresh nudge context after submission
      try {
        const freshNudge = await api.getNudge(anonId);
        setNudgeData(freshNudge);
        setNudgeDismissed(false);
      } catch (err) {
        console.error('Error fetching fresh nudge:', err);
      }

      await loadHistoryAndCorrelation();
    } catch (err) {
      if (err.data && err.data.error === 'rate_limited') {
        setErrorMsg(err.data.message);
        setHasSubmittedToday(true);
      } else {
        setErrorMsg(err.message || 'Failed to submit check-in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Check if last 5 check-ins show 3+ instances of low mood (<=2) or high stress (>=7)
  const recent5 = history.slice(0, 5);
  const lowMoodOrHighStressCount = recent5.filter(c => c.mood <= 2 || c.stress >= 7).length;
  const showSupportNudge = recent5.length >= 3 && lowMoodOrHighStressCount >= 3;

  const moodEmojis = [
    { value: 1, emoji: '😞', label: 'Very Low' },
    { value: 2, emoji: '🙁', label: 'Low' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' }
  ];

  // Dynamic feedback evaluation based on active or last result
  const activeCheckIn = lastCheckInResult || (history.length > 0 ? history[0] : null);
  const dynamicResultFeedback = activeCheckIn
    ? getResultFeedback({
        stress: activeCheckIn.stress,
        resilienceIndex: activeCheckIn.resilienceIndex || 50,
        history,
        hasPendingTasks
      })
    : null;

  const handleResultAction = (actionType) => {
    if (actionType === 'breathing' || actionType === 'resources' || actionType === 'counselor') {
      onNavigate('resources');
    } else if (actionType === 'tasks') {
      onNavigate('planner');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Smile size={24} color="var(--color-primary)" /> Daily Mental & Stress Assessment Check-in
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Comprehensive wellness reflection: mood, perceived stress scale, academic workload, and recovery metrics. 100% anonymous.
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Check-in Form or Completed Notice */}
      {!hasSubmittedToday ? (
        <div className="card">
          {/* Step Progress Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-card-border)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              className={`nav-btn ${step === 1 ? 'active' : ''}`}
              onClick={() => setStep(1)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Smile size={18} /> 1. Mood & Stress Scale
            </button>
            <button
              type="button"
              className={`nav-btn ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <BookOpen size={18} /> 2. Academic Workload
            </button>
            <button
              type="button"
              className={`nav-btn ${step === 3 ? 'active' : ''}`}
              onClick={() => setStep(3)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Moon size={18} /> 3. Recovery & Support
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: MOOD & STRESS ASSESSMENT QUESTIONS */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                    How are you feeling overall today? (Self-Reported Mood)
                  </label>
                  <div className="emoji-selector">
                    {moodEmojis.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        className={`emoji-btn ${mood === item.value ? 'selected' : ''}`}
                        onClick={() => setMood(item.value)}
                      >
                        <span className="emoji">{item.emoji}</span>
                        <span className="label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Overall Stress Level (1-10)</label>
                    <div className="range-badge">{stress}/10</div>
                  </div>
                  <div className="range-container">
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>1 (Calm)</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="range-slider"
                      value={stress}
                      onChange={(e) => setStress(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>10 (High)</span>
                  </div>
                </div>

                {/* 5 PERCEIVED STRESS ASSESSMENT QUESTIONS */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-card-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HelpCircle size={18} /> Detailed Perceived Stress Assessment Questions
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Q1: Workload Overwhelm */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>1. How often do you feel overwhelmed by your academic tasks today?</label>
                      <select className="form-control" value={workloadOverwhelm} onChange={(e) => setWorkloadOverwhelm(Number(e.target.value))}>
                        <option value="1">1 - Never / Very Rarely</option>
                        <option value="2">2 - Seldom</option>
                        <option value="3">3 - Sometimes</option>
                        <option value="4">4 - Often</option>
                        <option value="5">5 - Almost Constantly Overwhelmed</option>
                      </select>
                    </div>

                    {/* Q2: Focus / Concentration Difficulty */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>2. How often do you experience difficulty focusing or concentrating on study material?</label>
                      <select className="form-control" value={focusDifficulty} onChange={(e) => setFocusDifficulty(Number(e.target.value))}>
                        <option value="1">1 - Clear Focus All Day</option>
                        <option value="2">2 - Minor Focus Drifts</option>
                        <option value="3">3 - Moderate Concentration Difficulty</option>
                        <option value="4">4 - High Difficulty Staying Focused</option>
                        <option value="5">5 - Unable to Concentrate</option>
                      </select>
                    </div>

                    {/* Q3: Evaluation / Deadline Anxiety */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>3. How tense or anxious do you feel about upcoming deadlines/results?</label>
                      <select className="form-control" value={deadlineAnxiety} onChange={(e) => setDeadlineAnxiety(Number(e.target.value))}>
                        <option value="1">1 - Completely Calm & Prepared</option>
                        <option value="2">2 - Slightly Tense</option>
                        <option value="3">3 - Moderately Anxious</option>
                        <option value="4">4 - High Evaluation Anxiety</option>
                        <option value="5">5 - Severe Anxiety / Panic</option>
                      </select>
                    </div>

                    {/* Q4: Physical Stress Symptoms */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>4. Do you experience physical stress symptoms (muscle tension, headaches, fatigue)?</label>
                      <select className="form-control" value={physicalTension} onChange={(e) => setPhysicalTension(Number(e.target.value))}>
                        <option value="1">1 - None / Feeling Physically Great</option>
                        <option value="2">2 - Mild Physical Fatigue</option>
                        <option value="3">3 - Moderate Tension / Tiredness</option>
                        <option value="4">4 - Frequent Headaches or Muscle Strain</option>
                        <option value="5">5 - High Physical Exhaustion / Pain</option>
                      </select>
                    </div>

                    {/* Q5: Perceived Routine Control */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>5. How in control do you feel over your time and daily routine?</label>
                      <select className="form-control" value={perceivedControl} onChange={(e) => setPerceivedControl(Number(e.target.value))}>
                        <option value="5">5 - Fully in Control of My Routine</option>
                        <option value="4">4 - Mostly in Control</option>
                        <option value="3">3 - Moderate Control</option>
                        <option value="2">2 - Frequently Out of Control</option>
                        <option value="1">1 - Completely Helpless / Uncontrolled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Self-Confidence Today</label>
                    <select className="form-control" value={selfConfidence} onChange={(e) => setSelfConfidence(Number(e.target.value))}>
                      <option value="1">1 - Struggling / Low Confidence</option>
                      <option value="2">2 - Somewhat Uncertain</option>
                      <option value="3">3 - Moderate / Steady</option>
                      <option value="4">4 - Confident & Capable</option>
                      <option value="5">5 - Highly Confident</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Procrastination Level Today</label>
                    <select className="form-control" value={procrastinationLevel} onChange={(e) => setProcrastinationLevel(Number(e.target.value))}>
                      <option value="1">1 - Minimal / Focused All Day</option>
                      <option value="2">2 - Mild Delaying</option>
                      <option value="3">3 - Moderate Procrastination</option>
                      <option value="4">4 - Significant Delaying</option>
                      <option value="5">5 - High Procrastination Pressure</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                    Next: Academic Workload <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC WORKLOAD */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Study Hours Today</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      className="form-control"
                      value={studyHours}
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pending Assignments Count</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="form-control"
                      value={assignmentCount}
                      onChange={(e) => setAssignmentCount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Upcoming Exams (Next 7 Days)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="form-control"
                      value={upcomingExams}
                      onChange={(e) => setUpcomingExams(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Deadline Pressure (1-10)</label>
                    <div className="range-badge">{deadlinePressure}/10</div>
                  </div>
                  <div className="range-container">
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>1 (No Urgent Deadlines)</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="range-slider"
                      value={deadlinePressure}
                      onChange={(e) => setDeadlinePressure(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>10 (Extreme Pressure)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Perceived Academic Difficulty</label>
                  <select className="form-control" value={academicDifficulty} onChange={(e) => setAcademicDifficulty(Number(e.target.value))}>
                    <option value="1">1 - Very Manageable / Easy</option>
                    <option value="2">2 - Fairly Easy</option>
                    <option value="3">3 - Moderate Challenge</option>
                    <option value="4">4 - High Difficulty</option>
                    <option value="5">5 - Overwhelmingly Difficult</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back: Mood & Stress
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                    Next: Recovery & Support <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RECOVERY & SUPPORT */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sleep Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      className="form-control"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sleep Quality</label>
                    <select className="form-control" value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value))}>
                      <option value="1">1 - Very Restless / Poor</option>
                      <option value="2">2 - Fair / Disrupted</option>
                      <option value="3">3 - Average Sleep</option>
                      <option value="4">4 - Good & Restful</option>
                      <option value="5">5 - Excellent Deep Sleep</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Physical Activity (Minutes Today)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="300"
                      className="form-control"
                      value={physicalActivityMins}
                      onChange={(e) => setPhysicalActivityMins(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Social Support Feeling Today</label>
                    <select className="form-control" value={socialSupport} onChange={(e) => setSocialSupport(Number(e.target.value))}>
                      <option value="1">1 - Isolated / Supported Low</option>
                      <option value="2">2 - Somewhat Alone</option>
                      <option value="3">3 - Moderately Supported</option>
                      <option value="4">4 - Well Connected</option>
                      <option value="5">5 - Strong Peer/Family Support</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Department (Optional)</label>
                  <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="">-- Select Department --</option>
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electrical Engineering">Electrical & Electronics</option>
                    <option value="Business Administration">Business & Management</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Natural Sciences">Natural & Life Sciences</option>
                    <option value="Medicine & Health">Medicine & Health Sciences</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    💬 {gentlePrompts[promptIndex]} (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Share a quick note or reflection..."
                    maxLength={300}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    {note.length}/300 chars
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back: Workload
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '0.85rem 1.5rem' }}>
                    {submitting ? 'Submitting...' : 'Submit Complete Check-in'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#065f46', marginBottom: '0.4rem' }}>
            Check-in Complete for Today!
          </h3>
          <p style={{ color: '#047857', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto' }}>
            Thank you for checking in across your well-being, perceived stress scale, academic pressure, and recovery metrics.
          </p>
        </div>
      )}

      {/* Calculated Perceived Stress Index, Workload Index & Resilience Index Cards */}
      {lastCheckInResult && (
        <div className="grid-3">
          <div className="card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '1rem' }}>Perceived Stress Index</span>
              <AlertCircle size={20} color="#ef4444" />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#b91c1c', lineHeight: 1.2 }}>
              {lastCheckInResult.perceivedStressIndex || '58'} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '0.4rem' }}>
              Overwhelm: {lastCheckInResult.workloadOverwhelm || 3}/5 • Anxiety: {lastCheckInResult.deadlineAnxiety || 3}/5
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#92400e', fontSize: '1rem' }}>Academic Workload Index</span>
              <BookOpen size={20} color="#d97706" />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#b45309', lineHeight: 1.2 }}>
              {lastCheckInResult.workloadIndex} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.4rem' }}>
              Pressure: {lastCheckInResult.deadlinePressure}/10 • Study: {lastCheckInResult.studyHours}h
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}>Personal Resilience</span>
              <Activity size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#047857', lineHeight: 1.2 }}>
              {lastCheckInResult.resilienceIndex} / 100
            </div>
            <div style={{ fontSize: '0.85rem', color: '#064e3b', marginTop: '0.4rem' }}>
              Sleep Quality: {lastCheckInResult.sleepQuality}/5 • Social Support: {lastCheckInResult.socialSupport}/5
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC "YOUR RESULT" COMMENT SECTION */}
      {dynamicResultFeedback && (
        <div
          className="card"
          style={{
            background: dynamicResultFeedback.cardBg,
            border: `1px solid ${dynamicResultFeedback.cardBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'white',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <MessageCircle size={22} color={dynamicResultFeedback.badgeColor} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Your Result
              </h3>
            </div>

            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                backgroundColor: 'white',
                color: dynamicResultFeedback.badgeColor,
                border: `1px solid ${dynamicResultFeedback.cardBorder}`
              }}
            >
              {dynamicResultFeedback.categoryLabel}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
            {dynamicResultFeedback.text}
          </p>

          {dynamicResultFeedback.actionLabel && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleResultAction(dynamicResultFeedback.actionType)}
                style={{
                  backgroundColor: dynamicResultFeedback.badgeColor,
                  borderColor: dynamicResultFeedback.badgeColor,
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              >
                {dynamicResultFeedback.actionLabel} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* DISMISSIBLE IN-THE-MOMENT NUDGE CARD */}
      {nudgeData && !nudgeDismissed && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <button
            onClick={() => setNudgeDismissed(true)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
            title="Dismiss suggestion"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857' }}>
            <Compass size={20} color="#10b981" />
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
              Quick In-the-Moment Suggestion
            </h4>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
              {nudgeData.category || 'wellness'}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#064e3b', margin: 0, lineHeight: 1.5 }}>
            "{nudgeData.suggestion}"
          </p>

          {/* YouTube Binaural Beats Frequency Audio Link */}
          {nudgeData.binauralBeat && (
            <div style={{ marginTop: '0.25rem', paddingTop: '0.6rem', borderTop: '1px stroke #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🎧 <strong>Sound Therapy:</strong> {nudgeData.binauralBeat.title}</span>
              </div>
              <a
                href={nudgeData.binauralBeat.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', borderColor: '#a7f3d0', color: '#065f46', textDecoration: 'none' }}
              >
                Listen on YouTube <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Personal Workload-Stress Correlation Insight Card */}
      {correlation && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'white', padding: '0.6rem', borderRadius: '10px', color: '#0284c7' }}>
              <Heart size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0369a1' }}>Your Workload vs Stress Insight</h4>
              <div style={{ fontSize: '0.8rem', color: '#075985' }}>Strictly private calculation based on your own entries only</div>
            </div>
          </div>

          <p style={{ fontSize: '1rem', color: '#0c4a6e', fontWeight: 500, lineHeight: 1.5 }}>
            "{correlation.message}"
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '0.85rem', color: '#075985' }}>
              High Workload Stress Avg: <strong>{correlation.pendingTaskAvgStress || 'N/A'} / 10</strong> • Light Days Stress Avg: <strong>{correlation.lightDayAvgStress || 'N/A'} / 10</strong>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('planner')}>
              Plan Tomorrow's Tasks <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Smart Supportive Resource Nudge Card */}
      {showSupportNudge && (
        <div
          className="card"
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <LifeBuoy size={28} color="#d97706" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#92400e', marginBottom: '0.3rem' }}>
              Gentle Support & Campus Resources
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#b45309', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              We noticed you've been navigating a stretch of higher stress lately. Remember that it's okay to take breaks and reach out for support when things get heavy.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-warning btn-sm" onClick={() => onNavigate('resources')}>
                Explore Counseling & Self-Help <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Trend Chart Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Your Mood & Stress Check-in History
        </h3>
        <MoodChart data={history} type="personal" height={240} />
      </div>
    </div>
  );
}
