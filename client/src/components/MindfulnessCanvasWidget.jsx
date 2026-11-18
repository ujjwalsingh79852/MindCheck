import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Sparkles, RefreshCw } from 'lucide-react';

export default function MindfulnessCanvasWidget() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [colorMode, setColorMode] = useState('emerald'); // 'emerald', 'sunset', 'cosmic'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth || 500);
    let height = (canvas.height = 220);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = 220;
      }
    };
    window.addEventListener('resize', handleResize);

    // Dynamic wave parameters
    let step = 0;
    const lines = 5;

    // Interactive ripple particles on click/mousemove
    let ripples = [];

    const handlePointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({ x, y, radius: 5, maxRadius: 60, opacity: 1 });
      if (ripples.length > 8) ripples.shift();
    };

    canvas.addEventListener('mousemove', handlePointer);
    canvas.addEventListener('click', handlePointer);

    const getColor = (index, opacity) => {
      if (colorMode === 'emerald') {
        const colors = [
          `rgba(16, 185, 129, ${opacity})`,
          `rgba(52, 211, 153, ${opacity})`,
          `rgba(110, 231, 183, ${opacity})`,
          `rgba(14, 165, 233, ${opacity})`,
          `rgba(56, 189, 248, ${opacity})`
        ];
        return colors[index % colors.length];
      } else if (colorMode === 'sunset') {
        const colors = [
          `rgba(245, 158, 11, ${opacity})`,
          `rgba(251, 191, 36, ${opacity})`,
          `rgba(244, 63, 94, ${opacity})`,
          `rgba(251, 113, 133, ${opacity})`,
          `rgba(168, 85, 247, ${opacity})`
        ];
        return colors[index % colors.length];
      } else {
        const colors = [
          `rgba(139, 92, 246, ${opacity})`,
          `rgba(167, 139, 250, ${opacity})`,
          `rgba(99, 102, 241, ${opacity})`,
          `rgba(129, 140, 248, ${opacity})`,
          `rgba(236, 72, 153, ${opacity})`
        ];
        return colors[index % colors.length];
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background soft gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw soothing wave lines
      if (isPlaying) {
        step += 0.015;
      }

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = getColor(i, 0.75 - i * 0.1);

        const waveHeight = 25 + i * 8;
        const speed = step + i * 0.3;

        for (let x = 0; x <= width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * 0.01 + speed) * waveHeight * Math.cos(speed * 0.5) +
            Math.cos(x * 0.015 + speed * 0.7) * (waveHeight * 0.5);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw interactive ripples
      ripples.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = getColor(idx, r.opacity);
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isPlaying) {
          r.radius += 1.5;
          r.opacity -= 0.02;
        }
      });
      ripples = ripples.filter((r) => r.opacity > 0);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handlePointer);
        canvas.removeEventListener('click', handlePointer);
      }
    };
  }, [isPlaying, colorMode]);

  return (
    <div className="card" style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #334155', borderRadius: '20px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#34d399" /> Interactive Canvas Relaxation Flow
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Move mouse or tap canvas to create glowing calming ripples
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Color theme toggle */}
          <select
            className="form-control"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
            style={{ background: '#1e293b', color: '#f8fafc', borderColor: '#475569', fontSize: '0.8rem', padding: '0.2rem 0.5rem', width: 'auto' }}
          >
            <option value="emerald">Emerald Flow</option>
            <option value="sunset">Amber Sunset</option>
            <option value="cosmic">Cosmic Violet</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: '#1e293b', color: '#f8fafc', borderColor: '#475569' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '220px', display: 'block', cursor: 'crosshair' }} />
      </div>
    </div>
  );
}
