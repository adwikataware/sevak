import React, { useState, useEffect } from 'react';
import ComplaintPaper from './ComplaintPaper';
import { MapPin, Search, Clock, FileCheck2, AlertCircle } from 'lucide-react';
import BulletinBoard from './BulletinBoard';

const CitizenPortal = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [nearbyIssues, setNearbyIssues] = useState(mockNearby);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/complaints', {
          headers: { 'X-Tenant-ID': 'pune-slug' }
        });
        const result = await response.json();
        const rawData = result.complaints || (Array.isArray(result) ? result : []);
        
        const mapped = rawData.slice(0, 3).map(c => ({
          category: c.category || 'General',
          title: c.title,
          distance: "Within 500m",
          reports: c.reports_count || 1
        }));
        if (mapped.length > 0) setNearbyIssues(mapped);
      } catch (e) { console.log("Nearby fetch failed", e); }
    };
    fetchNearby();
  }, []);

  const handleTrack = async () => {
    if (!trackingId) return;
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3000/api/complaints/${trackingId}`);
      const data = await response.json();
      if (data.complaint) {
        setTrackedComplaint(data.complaint);
      } else {
        alert("Complaint not found");
      }
    } catch (e) {
      console.log("Tracking failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="grid-layout grid-cols-sidebar">
      {/* Left Sidebar: Tracking and Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Track Report Section */}
        <div className="flat-panel">
          <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            <Search size={20} /> Track Your Report
          </h3>
          <div className="input-group">
            <input 
              type="text" 
              className="text-input" 
              placeholder="Enter Tracking ID (e.g., CIV-2024-084)" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleTrack}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Check Status"}
          </button>

          {/* Dynamic Timeline */}
          {trackedComplaint && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              {trackedComplaint.status_logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--success)' }}>
                    {log.status === 'Resolved' ? <FileCheck2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.status}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleDateString()} • {log.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Issues Section */}
        <div className="flat-panel">
          <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            <MapPin size={20} /> Nearby Issues
          </h3>
          <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>
            Issues reported within 500m of you. Tap "Me Too" to upvote priority.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nearbyIssues.map((issue, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>{issue.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{issue.distance}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{issue.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.reports} citizens reported</span>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Me Too</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Side: Complaint Paper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <ComplaintPaper />
      </div>
    </div>
  );
};

const mockNearby = [
  { category: "Pothole", title: "Large crater on Main St", distance: "120m away", reports: 12 },
  { category: "Garbage", title: "Overflowing bin near park", distance: "340m away", reports: 4 },
  { category: "Streetlight", title: "Light pole #42 completely off", distance: "450m away", reports: 8 }
];

export default CitizenPortal;
