'use client';

import React, { useState } from 'react';
import { ShieldAlert, User, Briefcase, Map, LogOut } from 'lucide-react';
import LandingPage from '@/components/citizen/LandingPage';
import CitizenPortal from '@/components/citizen/CitizenPortal';
import OfficerApp from '@/components/citizen/OfficerApp';
import BulletinBoard from '@/components/citizen/BulletinBoard';
import GovLoginModal from '@/components/citizen/GovLoginModal';

export default function Home() {
  const [userRole, setUserRole] = useState<'citizen' | 'admin' | 'officer' | null>(null);
  const [govModal, setGovModal] = useState<{ open: boolean; role: 'admin' | 'officer' }>({ open: false, role: 'admin' });

  const handleLogin = (role: 'citizen' | 'admin' | 'officer') => {
    if (role === 'admin' || role === 'officer') {
      // Admin/Officer need Supabase auth — open the modal
      setGovModal({ open: true, role });
    } else {
      // Citizen portal is unauthenticated
      setUserRole(role);
    }
  };

  return (
    <div className="civic-app" style={{ minHeight: '100vh' }}>

      {/* Government Login Modal */}
      {govModal.open && (
        <GovLoginModal
          defaultRole={govModal.role}
          onClose={() => setGovModal({ open: false, role: 'admin' })}
        />
      )}

      {!userRole ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <>
          <nav className="navbar">
            <div
              className="logo-container"
              style={{ cursor: 'pointer' }}
              onClick={() => setUserRole(null)}
            >
              <ShieldAlert className="logo-icon" size={28} />
              <span className="logo-text">CivicPulse</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="badge badge-neutral" style={{ padding: '0.4rem 0.8rem' }}>
                {userRole === 'citizen' && <><User size={14} /> Citizen Mode</>}
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                onClick={() => setUserRole(null)}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </nav>

          <main className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BulletinBoard isAdmin={false} />
            <div style={{ flex: 1 }}>
              {userRole === 'citizen' && <CitizenPortal />}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
