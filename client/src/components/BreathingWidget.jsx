import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

export default function BreathingWidget() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // Inhale (4s), Hold (7s), Exhale (8s)
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Transition phase
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            return 4;
          }
        });
      }, 1000);
    } else {
      setPhase('Inhale');
      setSecondsLeft(4);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const toggleSession = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text)' }}>
        4-7-8 Relaxing Breath Guide
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Inhale through nose (4s) • Hold breath (7s) • Exhale slowly through mouth (8s)
      </p>

      <div className="breathing-circle-container">
        <div className={`breathing-circle ${isActive ? phase.toLowerCase() : ''}`}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {isActive ? phase : 'Ready?'}
            </div>
            {isActive && <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{secondsLeft}s</div>}
          </div>
        </div>

        <button
          className={`btn ${isActive ? 'btn-secondary' : 'btn-accent'}`}
          onClick={toggleSession}
          style={{ minWidth: '160px' }}
        >
          {isActive ? (
            <>
              <Square size={18} /> Stop Exercise
            </>
          ) : (
            <>
              <Play size={18} /> Start Breathing
            </>
          )}
        </button>
      </div>
    </div>
  );
}
