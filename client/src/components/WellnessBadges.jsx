import React from 'react';
import { Flame, Award, ShieldCheck, Moon, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export default function WellnessBadges({ totalCheckIns = 0, streak = 0 }) {
  const badges = [
    {
      id: 'streak_3',
      name: '3-Day Habit Flame',
      description: 'Maintained 3 consecutive days of daily check-ins',
      unlocked: streak >= 3 || totalCheckIns >= 3,
      progress: Math.min(100, Math.round((Math.max(streak, totalCheckIns) / 3) * 100)),
      icon: Flame,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fde68a'
    },
    {
      id: 'consistency_7',
      name: '7-Day Reset Master',
      description: 'Completed 7 days of mental wellness tracking',
      unlocked: totalCheckIns >= 7,
      progress: Math.min(100, Math.round((totalCheckIns / 7) * 100)),
      icon: Sparkles,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      borderColor: '#d8b4fe'
    },
    {
      id: 'workload_wizard',
      name: 'Workload Planner Guru',
      description: 'Balanced academic task planner with stress tracking',
      unlocked: totalCheckIns >= 1,
      progress: 100,
      icon: Award,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderColor: '#bfdbfe'
    },
    {
      id: 'rested_mind',
      name: 'Rested Mind Champion',
      description: 'Logged healthy sleep duration & recovery metrics',
      unlocked: totalCheckIns >= 5,
      progress: Math.min(100, Math.round((totalCheckIns / 5) * 100)),
      icon: Moon,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      borderColor: '#a7f3d0'
    }
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={22} color="var(--color-primary)" /> Graphical Achievement Badges
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
        </span>
      </div>

      <div className="grid-4" style={{ gap: '1rem' }}>
        {badges.map((badge) => {
          const IconComp = badge.icon;

          return (
            <div
              key={badge.id}
              style={{
                background: badge.unlocked ? badge.gradient : '#f8fafc',
                border: `1.5px solid ${badge.unlocked ? badge.borderColor : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {/* Badge Icon with SVG Progress Circle */}
              <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '0.75rem' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={badge.unlocked ? badge.color : '#cbd5e1'}
                    strokeWidth="4"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * badge.progress) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: badge.unlocked ? '#ffffff' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: badge.unlocked ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <IconComp size={24} color={badge.unlocked ? badge.color : '#94a3b8'} />
                </div>

                {badge.unlocked ? (
                  <CheckCircle2
                    size={18}
                    color="#10b981"
                    style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%' }}
                  />
                ) : (
                  <Lock
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%' }}
                  />
                )}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: badge.unlocked ? '#0f172a' : '#64748b', marginBottom: '0.25rem' }}>
                {badge.name}
              </h4>

              <p style={{ fontSize: '0.75rem', color: badge.unlocked ? '#475569' : '#94a3b8', lineHeight: 1.3 }}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
