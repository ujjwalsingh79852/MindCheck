import React from 'react';
import StudentYogaLogo from '../components/StudentYogaLogo';
import { ShieldCheck, HeartPulse, CheckSquare, BarChart2, ArrowRight, Sparkles } from 'lucide-react';

export default function Landing({ onStartStudent, onStartAdmin, onOpenPrivacy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1rem 0' }}>
      {/* Hero Section with AI Banner Artwork */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%)',
          border: '1px solid #bfdbfe',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          overflow: 'hidden'
        }}
      >
        <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <StudentYogaLogo size={60} />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'white',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <ShieldCheck size={15} color="#10b981" /> 100% Anonymous & Privacy Protected
              </span>
            </div>

            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem' }}>
              MindCheck — College Student Wellness & Task Planner
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Check in with your daily mood and stress while managing your academic tasks. MindCheck correlates your workload with well-being to give you personal insights—without ever tracking your real identity.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onStartStudent} style={{ fontSize: '1.05rem', padding: '0.85rem 1.6rem' }}>
                Go to My Student Dashboard <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" onClick={onStartAdmin} style={{ fontSize: '1.05rem', padding: '0.85rem 1.6rem' }}>
                Counselor Dashboard Portal
              </button>
            </div>
          </div>

          {/* AI Banner Illustration Graphic */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 24px -6px rgba(0,0,0,0.12)', border: '2px solid #ffffff' }}>
            <img
              src="/assets/hero_banner.jpg"
              alt="MindCheck College Students Wellness & Study"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Visual Feature Pillars Grid with Graphic Hero Icons */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HeartPulse size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>1-Minute Daily Check-in</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Track your mood, stress level, and sleep hours in seconds. Reflect on your day with gentle, supportive prompts.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckSquare size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Integrated Task Planner</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Keep track of assignments and study goals. Get gentle, non-judgmental prompts to break down heavy projects into bite-sized steps.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BarChart2 size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Smart Workload Insights</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Privately discover how high task loads affect your stress levels over time with SVG trend graphs, helping you plan better and avoid burnout.
          </p>
        </div>
      </div>

      {/* Wellness Artwork Visual Callout */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f0fdf4 100%)',
          border: '1px solid #d8b4fe',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ width: '120px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <img src="/assets/wellness_card.jpg" alt="Wellness Mind Artwork" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#581c87', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#8b5cf6" /> Designed for Academic Peace & Student Balance
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#4c1d95', lineHeight: 1.5 }}>
            Empowering college students with real-time mood charts, stress correlation analytics, achievement badges, and interactive relaxation visualizers.
          </p>
        </div>
      </div>

      {/* Privacy Callout */}
      <div
        className="card"
        style={{
          borderLeft: '5px solid var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Our Privacy Guarantee</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            No accounts, no email logins. We use a randomly generated device token. Aggregate counselor reports require a minimum group size of 5 (k &ge; 5).
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onOpenPrivacy}>
          Read Full Privacy Notice
        </button>
      </div>
    </div>
  );
}
