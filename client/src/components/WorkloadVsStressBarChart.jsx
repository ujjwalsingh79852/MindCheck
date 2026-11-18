import React, { useState } from 'react';

export default function WorkloadVsStressBarChart({ data = [], height = 240 }) {
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed var(--color-card-border)',
        }}
      >
        No comparative workload data available yet.
      </div>
    );
  }

  const chartData = [...data].slice(-7); // Last 7 entries
  const width = 580;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const groupCount = chartData.length;
  const groupWidth = groupCount > 0 ? chartWidth / groupCount : 0;
  const barWidth = Math.max(8, Math.min(22, (groupWidth - 16) / 3));

  const getY = (val, max = 100) => {
    const raw = Number(val) || 0;
    const clamped = Math.max(0, Math.min(max, raw));
    return paddingTop + chartHeight - (clamped / max) * chartHeight;
  };

  const getLabel = (item, idx) => {
    if (item.date) {
      const parts = item.date.split('T')[0].split('-');
      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : item.date;
    }
    return item.name || `Entry ${idx + 1}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '0.5rem' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: `${height}px` }}>
          <defs>
            <linearGradient id="barWorkloadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id="barStressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id="barResilienceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val, 100);
            return (
              <g key={val}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {chartData.map((item, idx) => {
            const groupX = paddingLeft + idx * groupWidth;
            const workloadVal = item.workloadIndex || (item.studyHours ? Math.min(100, item.studyHours * 10) : 45);
            const stressVal = (item.stress || item.avgStress || 5) * 10;
            const resilienceVal = item.resilienceIndex || (item.sleepHours ? Math.min(100, item.sleepHours * 12) : 60);

            const yWorkload = getY(workloadVal, 100);
            const hWorkload = paddingTop + chartHeight - yWorkload;

            const yStress = getY(stressVal, 100);
            const hStress = paddingTop + chartHeight - yStress;

            const yResilience = getY(resilienceVal, 100);
            const hResilience = paddingTop + chartHeight - yResilience;

            const isHovered = hoveredGroupIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredGroupIndex(idx)}
                onMouseLeave={() => setHoveredGroupIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background highlight pill */}
                {isHovered && (
                  <rect
                    x={groupX + 4}
                    y={paddingTop}
                    width={groupWidth - 8}
                    height={chartHeight}
                    fill="#f1f5f9"
                    rx="8"
                    opacity="0.8"
                  />
                )}

                {/* Bar 1: Workload */}
                <rect
                  x={groupX + groupWidth / 2 - barWidth * 1.5 - 2}
                  y={yWorkload}
                  width={barWidth}
                  height={Math.max(2, hWorkload)}
                  fill="url(#barWorkloadGrad)"
                  rx="4"
                />

                {/* Bar 2: Stress */}
                <rect
                  x={groupX + groupWidth / 2 - barWidth / 2}
                  y={yStress}
                  width={barWidth}
                  height={Math.max(2, hStress)}
                  fill="url(#barStressGrad)"
                  rx="4"
                />

                {/* Bar 3: Resilience */}
                <rect
                  x={groupX + groupWidth / 2 + barWidth / 2 + 2}
                  y={yResilience}
                  width={barWidth}
                  height={Math.max(2, hResilience)}
                  fill="url(#barResilienceGrad)"
                  rx="4"
                />

                {/* Group Date Label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={height - 10}
                  fontSize="10"
                  fill="#64748b"
                  textAnchor="middle"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {getLabel(item, idx)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredGroupIndex !== null && chartData[hoveredGroupIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#ffffff',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.3rem', borderBottom: '1px solid #334155', paddingBottom: '0.2rem' }}>
              Comparison: {getLabel(chartData[hoveredGroupIndex], hoveredGroupIndex)}
            </div>
            <div style={{ color: '#93c5fd', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Workload Index:</span> <strong>{chartData[hoveredGroupIndex].workloadIndex || 50}/100</strong>
            </div>
            <div style={{ color: '#fcd34d', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Perceived Stress:</span> <strong>{(chartData[hoveredGroupIndex].stress || 5) * 10}/100</strong>
            </div>
            <div style={{ color: '#6ee7b7', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Resilience Score:</span> <strong>{chartData[hoveredGroupIndex].resilienceIndex || 60}/100</strong>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
          <span style={{ fontWeight: 500, color: '#1d4ed8' }}>Workload Index</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></span>
          <span style={{ fontWeight: 500, color: '#b45309' }}>Perceived Stress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981' }}></span>
          <span style={{ fontWeight: 500, color: '#047857' }}>Resilience Score</span>
        </div>
      </div>
    </div>
  );
}
