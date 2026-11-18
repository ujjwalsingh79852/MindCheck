import React from 'react';
import BreathingWidget from '../components/BreathingWidget';
import { PhoneCall, Calendar, Users, ExternalLink, ShieldCheck, Heart, Radio, Music } from 'lucide-react';

export default function Resources() {
  const binauralBeatTracks = [
    {
      title: "432 Hz Solfeggio — Deep Stress Release & Natural Harmony",
      description: "Promotes natural relaxation, reduces anxiety, and brings mental harmony.",
      url: "https://www.youtube.com/results?search_query=432+hz+binaural+beats+stress+relief"
    },
    {
      title: "528 Hz — Transformation & Positive Mood",
      description: "Associated with mood enhancement, inner calm, and positive energy.",
      url: "https://www.youtube.com/results?search_query=528+hz+binaural+beats+positive+mood"
    },
    {
      title: "10 Hz Alpha Waves — Smooth Focus & Calm Mind",
      description: "Encourages relaxed alertness, perfect for light studying or winding down.",
      url: "https://www.youtube.com/results?search_query=10+hz+alpha+waves+binaural+beats"
    },
    {
      title: "6 Hz Theta Waves — Mindful Rest & Evening Relaxation",
      description: "Supports deep meditation, restorative breaks, and evening tranquility.",
      url: "https://www.youtube.com/results?search_query=6+hz+theta+waves+binaural+beats"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Heart size={24} color="var(--color-accent)" /> Campus Support & Wellness Directory
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Confidential campus resources, sound therapy frequencies, peer networks, helpline services, and self-guided relaxation exercises.
        </p>
      </div>

      {/* Interactive 4-7-8 Breathing Exercise Widget */}
      <BreathingWidget />

      {/* YouTube Binaural Beats Sound Therapy Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '12px', color: '#059669' }}>
            <Radio size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Binaural Beats Sound Therapy (YouTube Frequencies)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Gentle audio frequencies to aid focus, mood elevation, and stress reduction. (Best listened with headphones)
            </span>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1rem' }}>
          {binauralBeatTracks.map((track, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                border: '1px solid var(--color-card-border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Music size={16} color="var(--color-primary)" /> {track.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {track.description}
                </p>
              </div>

              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
              >
                Listen on YouTube <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid-2">
        {/* Book Counselor Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px', color: '#2563eb' }}>
                <Calendar size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Book a Campus Counselor</h3>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>100% Confidential & Free</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Schedule a one-on-one session with certified student wellness counselors at Student Health Services. Walk-in hours available Mon-Fri, 9am - 4pm.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => alert('Campus Counselor Booking Portal opened (Mock Link). Email: counseling@college.edu | Tel: (555) 019-2834')}
          >
            Schedule Appointment <ExternalLink size={16} />
          </button>
        </div>

        {/* Campus Helpline Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '12px', color: '#d97706' }}>
                <PhoneCall size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>24/7 Campus Helpline</h3>
                <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>Available 24 Hours / 7 Days</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Immediate, crisis-free listening support for urgent stress, anxiety, or academic pressure. Speak or text with a trained listener anytime.
            </p>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem 1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 700, color: '#92400e', fontSize: '1.05rem' }}>
            Call or Text: 1-800-273-TALK (8255)
          </div>
        </div>

        {/* Peer Support Group Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f3e8ff', padding: '0.75rem', borderRadius: '12px', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Peer Support Circles</h3>
              <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600 }}>Student-Led Group Meetings</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Join informal weekly discussions with fellow students. Share experiences about exam stress, time management, and balanced living.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
            📍 Student Center Room 204 • Wednesdays 5:00 PM
          </div>
        </div>

        {/* Self-Help Guided Resources Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Guided Self-Help Library</h3>
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Articles & Audios</span>
            </div>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              • <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Opening article: Overcoming Academic Procrastination'); }} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Overcoming Academic Procrastination (5-Min Read)</a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              • <a href="#sleep" onClick={(e) => { e.preventDefault(); alert('Opening audio: Guided Progressive Muscle Relaxation for Sleep'); }} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Progressive Muscle Relaxation Audio (10 Mins)</a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              • <a href="#boundaries" onClick={(e) => { e.preventDefault(); alert('Opening guide: Setting Healthy Academic Boundaries'); }} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Setting Healthy Academic Boundaries</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
