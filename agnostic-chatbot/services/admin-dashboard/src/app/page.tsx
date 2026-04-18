"use client";

import React from 'react';
import { ShieldAlert, User, Briefcase, Map, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Squares, FloatingParticles, SocialConnectivity } from '@/components/civic/background-elements';

export default function LandingPage() {
  const router = useRouter();

  const onLogin = (role: string) => {
    if (role === 'admin') {
      router.push('/login');
    } else if (role === 'citizen') {
      router.push('/citizen');
    } else if (role === 'officer') {
      router.push('/officer');
    }
  };

  const [wordIndex, setWordIndex] = React.useState(0);
  const words = ["AI.", "Precision.", "Unity.", "Impact."];
  const colors = ["var(--accent)", "#4A7C59", "#7b5232", "#111111"];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background text-foreground" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Premium Background Textures */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Soft Organic Blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', opacity: 0.4, filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.08, filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '70vw', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', opacity: 0.25, filter: 'blur(150px)' }} />
        
        {/* React Bits Inspired Elements */}
        <Squares />
        <FloatingParticles />
        <SocialConnectivity />
      </div>

      {/* Tactile Grain Filter */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.04, background: 'url(https://www.transparenttextures.com/patterns/stardust.png)' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Bar */}
        <div style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
          <ShieldAlert size={28} color="var(--accent)" />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Playfair Display' }}>SEVAK</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontFamily: 'Inter' }}>AI-Powered Governance Platform</div>
      </div>

      {/* Hero Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="bg-secondary text-secondary-foreground rounded-full" style={{ marginBottom: '2rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>
          Welcome to the future of civic resolution
        </div>
        <h1 style={{ fontSize: '4.5rem', fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', maxWidth: '900px', lineHeight: 1.1, textAlign: 'center' }}>
          Your city, resolved<br />
          through <div style={{ display: 'inline-block', height: '1.1em', overflow: 'hidden', verticalAlign: 'bottom', position: 'relative', textAlign: 'left' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)', 
              transform: `translateY(-${wordIndex * 1.1}em)`,
              color: '#b5835a',
              fontStyle: 'italic'
            }}>
              {words.map((w, i) => (
                <span key={i} style={{ height: '1.1em', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{w}</span>
              ))}
            </div>
          </div>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', maxWidth: '600px', marginBottom: '4rem', lineHeight: 1.6, fontFamily: 'Inter' }}>
          Automated routing, instant GPS tracking, and real-time SLA management to bridge the gap between citizens and authorities.
        </p>

        {/* Login Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]">

          {/* Citizen Card */}
          <div className="bg-card text-card-foreground border-t-4 border-t-[#4A7C59] border-x border-b border-border rounded-lg shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => onLogin('citizen')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: '#f2f7f3', color: '#4a7c59', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <User size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display', color: 'var(--primary)' }}>Citizen Portal</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: 'Inter' }}>Report issues, upvote local problems, and track resolutions in real-time.</p>
            <button className="flex items-center justify-center gap-2 bg-transparent text-primary border border-border px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-secondary w-full">
              Login as Citizen <ArrowRight size={16} />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-card text-card-foreground border-t-4 border-t-[#D96C4A] border-x border-b border-border rounded-lg shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => onLogin('admin')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: '#fdf2f0', color: '#d96c4a', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display', color: 'var(--primary)' }}>Authority Dashboard</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: 'Inter' }}>AI queue management, automated officer routing, and zone analytics.</p>
            <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-accent w-full">
              Login as Admin <ArrowRight size={16} />
            </button>
          </div>

          {/* Officer Card */}
          <div className="bg-card text-card-foreground border-t-4 border-t-[#7b5232] border-x border-b border-border rounded-lg shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => onLogin('officer')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: '#f9f6f2', color: '#7b5232', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Map size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display', color: 'var(--primary)' }}>Field Officer App</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: 'Inter' }}>GPS-optimized routes, task checklist, and AI photo verification.</p>
            <button className="flex items-center justify-center gap-2 bg-transparent text-primary border border-border px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-secondary w-full">
              Login as Officer <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
