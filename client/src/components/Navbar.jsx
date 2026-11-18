import React from 'react';
import StudentYogaLogo from './StudentYogaLogo';
import { HeartPulse, CheckSquare, Smile, LifeBuoy, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenPrivacy }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-brand" onClick={() => setActiveTab('landing')}>
          <StudentYogaLogo size={40} />
          <div>
            <span>MindCheck</span>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '-3px' }}>
              Campus Mental Wellness
            </div>
          </div>
        </div>

        <ul className="nav-links">
          <li>
            <button
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <HeartPulse size={18} /> Student Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              <CheckSquare size={18} /> Task Planner
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'checkin' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkin')}
            >
              <Smile size={18} /> Daily Check-in
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <LifeBuoy size={18} /> Resources
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <UserCheck size={18} /> Counselor Portal
            </button>
          </li>
        </ul>

        <button className="privacy-badge-btn" onClick={onOpenPrivacy}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Anonymous & Protected</span>
        </button>
      </div>
    </nav>
  );
}
