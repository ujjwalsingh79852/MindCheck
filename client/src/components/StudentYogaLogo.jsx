import React from 'react';

export default function StudentYogaLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Soft Muted Background Aura Ring */}
      <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="38" fill="#F1F5F9" opacity="0.9" />

      {/* Gentle Lotus Base Leaf (Soft Sage Green) */}
      <path
        d="M28 72C38 77 62 77 72 72C68 80 32 80 28 72Z"
        fill="#A7F3D0"
        opacity="0.85"
      />

      {/* Student Head (Muted Slate) */}
      <circle cx="50" cy="30" r="7.5" fill="#475569" />

      {/* Upper Body & Shoulders */}
      <path
        d="M42 40C42 38 46 37 50 37C54 37 58 38 58 40L60 52H40L42 40Z"
        fill="#475569"
      />

      {/* Yoga Arms holding the book */}
      <path
        d="M38 43L30 52C29 53 30 55 32 55L44 54"
        stroke="#475569"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M62 43L70 52C71 53 70 55 68 55L56 54"
        stroke="#475569"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cross-Legged Lotus Yoga Legs */}
      <path
        d="M24 67C24 62 30 57 38 57C44 57 50 60 50 60C50 60 56 57 62 57C70 57 76 62 76 67C76 72 68 74 50 74C32 74 24 72 24 67Z"
        fill="#64748B"
      />

      {/* Knee Nodes */}
      <ellipse cx="28" cy="66" rx="7" ry="4" fill="#475569" />
      <ellipse cx="72" cy="66" rx="7" ry="4" fill="#475569" />

      {/* Open Book in Lap */}
      <g transform="translate(0, 2)">
        {/* Left Book Page */}
        <path
          d="M50 51C44 49 37 50 32 52V62C37 60 44 59 50 61V51Z"
          fill="#38BDF8"
        />
        {/* Right Book Page */}
        <path
          d="M50 51C56 49 63 50 68 52V62C63 60 56 59 50 61V51Z"
          fill="#0EA5E9"
        />
        {/* Spine Line */}
        <line x1="50" y1="50" x2="50" y2="62" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
        {/* Page Line Accents */}
        <line x1="36" y1="54" x2="46" y2="53" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
        <line x1="54" y1="53" x2="64" y2="54" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      </g>
    </svg>
  );
}
