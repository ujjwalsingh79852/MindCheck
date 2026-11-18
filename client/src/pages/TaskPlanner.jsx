import React, { useState, useEffect } from 'react';
import { getAnonId } from '../utils/anonId';
import { api } from '../utils/api';
import TaskBreakdownModal from '../components/TaskBreakdownModal';
import { Plus, CheckSquare, Trash2, Calendar, AlertTriangle, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function TaskPlanner() {
  const [anonId] = useState(getAnonId);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('study');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(todayStr);

  // Breakdown modal state
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [pendingBreakdownTitle, setPendingBreakdownTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [anonId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(anonId);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkComplexityHeuristic = (taskTitle) => {
    const keywords = ['project', 'assignment', 'prepare', 'complete', 'report', 'exam', 'presentation'];
    const words = taskTitle.toLowerCase().split(/\s+/);
    return words.some(w => keywords.includes(w)) || taskTitle.length > 35;
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskTitle = title.trim();

    // Check if task seems complex
    if (checkComplexityHeuristic(taskTitle)) {
      setPendingBreakdownTitle(taskTitle);
      setBreakdownModalOpen(true);
    }

    try {
      const newTask = await api.createTask({
        anonId,
        title: taskTitle,
        category,
        priority,
        dueDate
      });

      setTasks([newTask, ...tasks]);
      setTitle('');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleAddBreakdownTasks = async (subTasks) => {
    try {
      const promises = subTasks.map(st =>
        api.createTask({
          anonId,
          title: st.title,
          category,
          priority: 'low',
          dueDate
        })
      );
      const created = await Promise.all(promises);
      setTasks(prev => [...created, ...prev]);
    } catch (err) {
      console.error('Error adding breakdown tasks:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await api.completeTask(task.id, anonId, !task.completed);
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId, anonId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleMoveToToday = async (task) => {
    try {
      // Create copy for today or delete/recreate
      await api.deleteTask(task.id, anonId);
      const updated = await api.createTask({
        anonId,
        title: task.title,
        category: task.category,
        priority: task.priority,
        dueDate: todayStr
      });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error('Error moving task to today:', err);
    }
  };

  // Group tasks: Overdue, Today, Upcoming
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && !t.completed);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const upcomingTasks = tasks.filter(t => t.dueDate > todayStr);

  const todayCompletedCount = todayTasks.filter(t => t.completed).length;
  const todayTotalCount = todayTasks.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <CheckSquare size={24} color="var(--color-accent)" /> Daily Task Planner
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Manage your daily priorities with ease. Break big projects down and move tasks at your own pace without pressure.
        </p>
      </div>

      {/* Add Task Form Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>+ Add New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Task Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Prepare Physics Assignment Chapter 4..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="grid-3" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="study">📚 Academic / Study</option>
                <option value="personal">🏠 Personal Wellness</option>
                <option value="other">🎯 Other Goal</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Priority</label>
              <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🔵 Low Priority</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Due Date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Add Task
            </button>
          </div>
        </form>
      </div>

      {/* End-of-Day Supportive Summary Banner */}
      {todayTotalCount > 0 && (
        <div
          className="card"
          style={{
            background: todayCompletedCount === todayTotalCount ? '#ecfdf5' : '#f0f9ff',
            border: `1px solid ${todayCompletedCount === todayTotalCount ? '#a7f3d0' : '#bae6fd'}`,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <Sparkles size={24} color={todayCompletedCount === todayTotalCount ? '#059669' : '#0284c7'} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: todayCompletedCount === todayTotalCount ? '#065f46' : '#0369a1' }}>
              {todayCompletedCount === todayTotalCount
                ? `Wonderful effort! You completed all ${todayTotalCount} tasks today!`
                : `You completed ${todayCompletedCount}/${todayTotalCount} tasks today.`}
            </h4>
            <p style={{ fontSize: '0.875rem', color: todayCompletedCount === todayTotalCount ? '#047857' : '#075985' }}>
              {todayCompletedCount === todayTotalCount
                ? 'Take time to relax and celebrate your progress!'
                : 'Every small step counts towards your goals. Be proud of what you accomplished today!'}
            </p>
          </div>
        </div>
      )}

      {/* Overdue Section (Soft Amber Highlight, Non-judgmental) */}
      {overdueTasks.length > 0 && (
        <div className="card" style={{ borderLeft: '5px solid var(--color-warning)', backgroundColor: '#fffbeb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} color="#d97706" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>
              Rollover Tasks ({overdueTasks.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {overdueTasks.map(t => (
              <div key={t.id} className="task-item overdue">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleComplete(t)}
                  />
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${t.category}`}>{t.category}</span>
                      <span>Originally due: {t.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="btn btn-warning btn-sm" onClick={() => handleMoveToToday(t)}>
                    Move to today?
                  </button>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--color-primary)" /> Today's Tasks ({todayTasks.length})
        </h3>

        {todayTasks.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No tasks set for today. Add one above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {todayTasks.map(t => (
              <div key={t.id} className={`task-item ${t.completed ? 'completed' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleComplete(t)}
                  />
                  <div>
                    <div className={`task-title ${t.completed ? 'strikethrough' : ''}`}>{t.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${t.category}`}>{t.category}</span>
                      <span className={`badge badge-${t.priority}`}>{t.priority} priority</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(t.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks Section */}
      {upcomingTasks.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
            Upcoming Tasks ({upcomingTasks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcomingTasks.map(t => (
              <div key={t.id} className="task-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleComplete(t)}
                  />
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${t.category}`}>{t.category}</span>
                      <span>Due: {t.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(t.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-task Breakdown Modal */}
      <TaskBreakdownModal
        isOpen={breakdownModalOpen}
        taskTitle={pendingBreakdownTitle}
        onClose={() => setBreakdownModalOpen(false)}
        onAddBreakdownTasks={handleAddBreakdownTasks}
      />
    </div>
  );
}
