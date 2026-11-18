import React, { useState } from 'react';

export default function MoodChart({ data = [], type = 'personal', height = 260 }) {
  const [activeMetric, setActiveMetric] = useState('all'); // 'all', 'mood', 'stress', 'workload', 'resilience'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed var(--color-card-border)',
        }}
      >
        No check-in entries to graph yet. Complete your first check-in to see your trend graphics!
      </div>
    );
  }

  // Chronological order
  const chartData = [...data].reverse();
  const width = 600;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const pointsCount = chartData.length;
  const xStep = pointsCount > 1 ? chartWidth / (pointsCount - 1) : 0;

  const getMoodVal = (item) => (type === 'personal' ? (item.mood || 3) : (item.avgMood || 3));
  const getStressVal = (item) => (type === 'personal' ? (item.stress || 5) : (item.avgStress || 5));
  const getWorkloadVal = (item) => (type === 'personal' ? (item.workloadIndex || 50) : (item.avgWorkloadIndex || 50));
  const getResilienceVal = (item) => (type === 'personal' ? (item.resilienceIndex || 50) : (item.avgResilienceIndex || 50));

  const getLabel = (item) => {
    if (type === 'personal') {
      const d = new Date(item.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    const parts = item.date ? item.date.split('-') : [];
    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : item.date;
  };

  // Scaled Y position (0-100 scale for consistency)
  const getY = (val, max = 100) => {
    const rawVal = Number(val) || 0;
    const clamped = Math.max(0, Math.min(max, rawVal));
    return paddingTop + chartHeight - (clamped / max) * chartHeight;
  };

  // Helper for smooth Bezier curve control points
  const createBezierPath = (points) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    return path;
  };

  // Metric series coordinates (scaled to 100)
  const moodCoords = chartData.map((item, idx) => ({
    x: paddingLeft + idx * xStep,
    y: getY(getMoodVal(item) * 20, 100) // Scale 1-5 to 100
  }));

  const stressCoords = chartData.map((item, idx) => ({
    x: paddingLeft + idx * xStep,
    y: getY(getStressVal(item) * 10, 100) // Scale 1-10 to 100
  }));

  const workloadCoords = chartData.map((item, idx) => ({
    x: paddingLeft + idx * xStep,
    y: getY(getWorkloadVal(item), 100)
  }));

  const resilienceCoords = chartData.map((item, idx) => ({
    x: paddingLeft + idx * xStep,
    y: getY(getResilienceVal(item), 100)
  }));

  const moodPath = createBezierPath(moodCoords);
  const stressPath = createBezierPath(stressCoords);
  const workloadPath = createBezierPath(workloadCoords);
  const resiliencePath = createBezierPath(resilienceCoords);

  // Closed area paths for gradient fills
  const getAreaPath = (coords, path) => {
    if (!path || coords.length === 0) return '';
    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const bottomY = paddingTop + chartHeight;
    return `${path} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Metric Selector Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeMetric === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMetric('all')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
          >
            All Metrics
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeMetric === 'mood' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMetric('mood')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderColor: '#10b981', color: activeMetric === 'mood' ? '#fff' : '#059669' }}
          >
            Mood Trend
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeMetric === 'stress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMetric('stress')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderColor: '#f59e0b', color: activeMetric === 'stress' ? '#fff' : '#d97706' }}
          >
            Stress Trend
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeMetric === 'workload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMetric('workload')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderColor: '#3b82f6', color: activeMetric === 'workload' ? '#fff' : '#2563eb' }}
          >
            Workload Index
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeMetric === 'resilience' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMetric('resilience')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderColor: '#8b5cf6', color: activeMetric === 'resilience' ? '#fff' : '#7c3aed' }}
          >
            Resilience
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          💡 Hover nodes for detailed metric breakdown
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '0.5rem' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: `${height}px` }}>
          <defs>
            {/* Gradient Fills */}
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="resilienceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val, 100);
            return (
              <g key={val}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeDasharray="4,4" />
                <text x={paddingLeft - 8} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {(activeMetric === 'all' || activeMetric === 'mood') && (
            <path d={getAreaPath(moodCoords, moodPath)} fill="url(#moodGradient)" />
          )}
          {(activeMetric === 'all' || activeMetric === 'stress') && (
            <path d={getAreaPath(stressCoords, stressPath)} fill="url(#stressGradient)" />
          )}
          {(activeMetric === 'all' || activeMetric === 'workload') && (
            <path d={getAreaPath(workloadCoords, workloadPath)} fill="url(#workloadGradient)" />
          )}
          {(activeMetric === 'all' || activeMetric === 'resilience') && (
            <path d={getAreaPath(resilienceCoords, resiliencePath)} fill="url(#resilienceGradient)" />
          )}

          {/* Bezier Smooth Lines */}
          {pointsCount > 1 && (activeMetric === 'all' || activeMetric === 'mood') && (
            <path d={moodPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          )}
          {pointsCount > 1 && (activeMetric === 'all' || activeMetric === 'stress') && (
            <path d={stressPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          )}
          {pointsCount > 1 && (activeMetric === 'all' || activeMetric === 'workload') && (
            <path d={workloadPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6,3" />
          )}
          {pointsCount > 1 && (activeMetric === 'all' || activeMetric === 'resilience') && (
            <path d={resiliencePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
          )}

          {/* Data Points */}
          {chartData.map((item, idx) => {
            const x = paddingLeft + idx * xStep;
            const yMood = moodCoords[idx].y;
            const yStress = stressCoords[idx].y;
            const yWorkload = workloadCoords[idx].y;
            const yResilience = resilienceCoords[idx].y;
            const label = getLabel(item);
            const isHovered = hoveredPoint === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#cbd5e1"
                    strokeDasharray="2,2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Mood Dot */}
                {(activeMetric === 'all' || activeMetric === 'mood') && (
                  <circle cx={x} cy={yMood} r={isHovered ? 7 : 5} fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                )}
                {/* Stress Dot */}
                {(activeMetric === 'all' || activeMetric === 'stress') && (
                  <circle cx={x} cy={yStress} r={isHovered ? 7 : 5} fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                )}
                {/* Workload Dot */}
                {(activeMetric === 'all' || activeMetric === 'workload') && (
                  <circle cx={x} cy={yWorkload} r={isHovered ? 6 : 4} fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                )}
                {/* Resilience Dot */}
                {(activeMetric === 'all' || activeMetric === 'resilience') && (
                  <circle cx={x} cy={yResilience} r={isHovered ? 6 : 4} fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                )}

                {/* X Axis Date Label */}
                <text x={x} y={height - 10} fontSize="10" fill="#64748b" textAnchor="middle" fontWeight={isHovered ? '700' : '500'}>
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && chartData[hoveredPoint] && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#ffffff',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.3rem', borderBottom: '1px solid #334155', paddingBottom: '0.2rem' }}>
              Date: {getLabel(chartData[hoveredPoint])}
            </div>
            <div style={{ color: '#6ee7b7', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Mood:</span> <strong>{getMoodVal(chartData[hoveredPoint])}/5</strong>
            </div>
            <div style={{ color: '#fcd34d', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Stress:</span> <strong>{getStressVal(chartData[hoveredPoint])}/10</strong>
            </div>
            <div style={{ color: '#93c5fd', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Workload Index:</span> <strong>{getWorkloadVal(chartData[hoveredPoint])}/100</strong>
            </div>
            <div style={{ color: '#c4b5fd', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Resilience Score:</span> <strong>{getResilienceVal(chartData[hoveredPoint])}/100</strong>
            </div>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.2rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 500, color: '#047857' }}>Mood (1-5 x20)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 500, color: '#b45309' }}>Stress (1-10 x10)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 500, color: '#1d4ed8' }}>Workload Index (0-100)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 500, color: '#6d28d9' }}>Resilience (0-100)</span>
        </div>
      </div>
    </div>
  );
}
