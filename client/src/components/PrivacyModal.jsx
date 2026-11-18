import React from 'react';
import { ShieldCheck, Lock, EyeOff, Users, X } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>How We Protect Your Privacy</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#ecfdf5', padding: '0.6rem', borderRadius: '10px', color: '#059669' }}>
              <EyeOff size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>100% Anonymous Device ID</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                MindCheck never asks for your name, student ID, email, or IP address. Your data is tied solely to a randomly generated device token stored locally in your browser.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#eff6ff', padding: '0.6rem', borderRadius: '10px', color: '#2563eb' }}>
              <Users size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Strict k-Anonymity Protection (k &ge; 5)</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Counselors and administrators can only view high-level aggregate trends. The server strictly enforces a minimum group size of 5 unique students before showing any aggregate reports.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', padding: '0.6rem', borderRadius: '10px', color: '#d97706' }}>
              <Lock size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Isolated Personal Insights</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Your task list and stress correlation calculations are processed exclusively for your own device. Individual records are never combined or linked across users for personal insights.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Got It, Thank You!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
