import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, X, Check } from 'lucide-react';

export default function TaskBreakdownModal({ isOpen, taskTitle, onClose, onAddBreakdownTasks }) {
  if (!isOpen) return null;

  // Generate suggested sub-tasks based on task title keywords
  const generateInitialSubTasks = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('project') || lower.includes('assignment')) {
      return [
        { id: 1, title: `Outline requirements for ${title}`, done: false },
        { id: 2, title: `Gather research & references`, done: false },
        { id: 3, title: `Draft initial section / prototype`, done: false },
        { id: 4, title: `Review, edit & submit`, done: false }
      ];
    }
    if (lower.includes('prepare') || lower.includes('exam') || lower.includes('study')) {
      return [
        { id: 1, title: `Review lecture notes & slides`, done: false },
        { id: 2, title: `Create summary study sheet`, done: false },
        { id: 3, title: `Practice sample questions`, done: false }
      ];
    }
    return [
      { id: 1, title: `Step 1: Set up materials for ${title}`, done: false },
      { id: 2, title: `Step 2: Focus block (25 mins)`, done: false },
      { id: 3, title: `Step 3: Final review & cleanup`, done: false }
    ];
  };

  const [subTasks, setSubTasks] = useState(() => generateInitialSubTasks(taskTitle));
  const [newSubTitle, setNewSubTitle] = useState('');

  const toggleSubTask = (id) => {
    setSubTasks(subTasks.map(st => st.id === id ? { ...st, done: !st.done } : st));
  };

  const addSubTask = () => {
    if (!newSubTitle.trim()) return;
    setSubTasks([...subTasks, { id: Date.now(), title: newSubTitle.trim(), done: false }]);
    setNewSubTitle('');
  };

  const removeSubTask = (id) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const handleConfirm = () => {
    onAddBreakdownTasks(subTasks);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Break Task Into Smaller Steps</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Big tasks like <strong style={{ color: 'var(--color-text)' }}>"{taskTitle}"</strong> can feel overwhelming. Breaking them into bite-sized steps makes getting started much easier!
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          {subTasks.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.8rem',
                backgroundColor: st.done ? '#f1f5f9' : '#f8fafc',
                border: '1px solid var(--color-card-border)',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: st.done ? 'line-through' : 'none',
                  color: st.done ? 'var(--color-text-muted)' : 'var(--color-text)',
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => toggleSubTask(st.id)}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: '1.5px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: st.done ? 'var(--color-primary)' : 'white'
                  }}
                >
                  {st.done && <Check size={12} color="white" />}
                </div>
                <span>{st.title}</span>
              </div>
              <button
                onClick={() => removeSubTask(st.id)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom step */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Add another step..."
            value={newSubTitle}
            onChange={(e) => setNewSubTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
            style={{ fontSize: '0.875rem' }}
          />
          <button className="btn btn-secondary btn-sm" onClick={addSubTask}>
            <Plus size={16} /> Add
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Skip for Now
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Add All Steps to Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
