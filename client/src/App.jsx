import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PrivacyModal from './components/PrivacyModal';
import Landing from './pages/Landing';
import StudentHome from './pages/StudentHome';
import TaskPlanner from './pages/TaskPlanner';
import CheckInForm from './pages/CheckInForm';
import Resources from './pages/Resources';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activeTab === 'landing' && (
          <Landing
            onStartStudent={() => setActiveTab('home')}
            onStartAdmin={() => setActiveTab('admin')}
            onOpenPrivacy={() => setPrivacyModalOpen(true)}
          />
        )}
        {activeTab === 'home' && <StudentHome onNavigate={setActiveTab} />}
        {activeTab === 'planner' && <TaskPlanner />}
        {activeTab === 'checkin' && <CheckInForm onNavigate={setActiveTab} />}
        {activeTab === 'resources' && <Resources />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>MindCheck</strong> — Anonymous Student Mental Wellness & Daily Task Planner
          </div>
          <div>
            k-Anonymity Threshold: k &ge; 5 • Zero PII Data Logged
          </div>
        </div>
      </footer>

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
