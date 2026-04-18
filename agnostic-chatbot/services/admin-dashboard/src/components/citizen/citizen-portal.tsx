"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import ComplaintPaper from './complaint-paper';
import { Search, Clock, FileCheck2, Map as MapIcon, ThumbsUp } from 'lucide-react';
import { toast } from "sonner";

// Dynamic import for the Map component to prevent SSR and multiple initialization issues
const CitizenMap = dynamic(() => import('./citizen-map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Initializing Map...</div>
});

const mockNearby = [
  { id: 1, category: "Pothole", title: "Large crater on Main St", lat: 18.5204, lng: 73.8567, reports: 12 },
  { id: 2, category: "Garbage", title: "Overflowing bin near park", lat: 18.5224, lng: 73.8587, reports: 4 },
  { id: 3, category: "Streetlight", title: "Light pole #42 completely off", lat: 18.5184, lng: 73.8547, reports: 8 }
];

export default function CitizenPortal() {
  const [trackingId, setTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);
  const [nearbyIssues, setNearbyIssues] = useState<any[]>(mockNearby);
  const [isSearching, setIsSearching] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocationUpdate = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    // Update nearby issues to be around the new location
    const newNearby = [
      { id: Date.now(), category: "Pothole", title: "New Issue Near You", lat: lat + 0.002, lng: lng + 0.001, reports: 1 },
      { id: Date.now() + 1, category: "Streetlight", title: "Unreported Fault", lat: lat - 0.001, lng: lng + 0.002, reports: 3 },
      { id: Date.now() + 2, category: "Sanitation", title: "Garbage Accumulation", lat: lat + 0.001, lng: lng - 0.002, reports: 5 }
    ];
    setNearbyIssues(newNearby);
    toast.success("Map synchronized with your current location.");
  };

  useEffect(() => {
    setMounted(true);
    const history = JSON.parse(localStorage.getItem('civic_report_history') || '[]');
    if (history.length === 0) {
      setReportHistory([
        { id: 'CIV-2024-882', title: 'Road Pothole - Baner' },
        { id: 'CIV-2024-104', title: 'Streetlight Repair' },
        { id: 'CIV-2024-429', title: 'Water Leakage' }
      ]);
    } else {
      setReportHistory(history);
    }
    const fetchNearby = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/api/complaints`, {
          headers: { 'X-Tenant-ID': 'pune-slug' }
        });
        const result = await response.json();
        const rawData = result.complaints || (Array.isArray(result) ? result : []);
        
        const mapped = rawData.map((c: any) => ({
          id: c.id,
          category: c.category || 'General',
          title: c.title,
          lat: c.latitude || 18.5204 + (Math.random() - 0.5) * 0.01,
          lng: c.longitude || 73.8567 + (Math.random() - 0.5) * 0.01,
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
    
    if (trackingId.startsWith('CIV-2024') || trackingId.startsWith('MOCK')) {
      setTimeout(() => {
        setTrackedComplaint({
          title: trackingId.includes('882') ? "Road Pothole - Baner" : "Streetlight Repair - Sector 4",
          status_logs: [
            { status: 'Received', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), notes: 'Issue registered via Citizen Portal' },
            { status: 'AI Verified', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'AI confirmed severity and categorized as High Impact' },
            { status: 'In Progress', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Field team dispatched for inspection' },
          ]
        });
        setIsSearching(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/api/complaints/${trackingId}`);
      const data = await response.json();
      if (data.complaint) {
        setTrackedComplaint(data.complaint);
      } else {
        setTrackedComplaint({
          title: "General Maintenance Request",
          status_logs: [
            { status: 'Received', timestamp: new Date(), notes: 'Issue captured by CivicPulse AI' },
            { status: 'Pending Review', timestamp: new Date(), notes: 'Queueing for department assignment' }
          ]
        });
      }
    } catch (e) {
      toast.error("Offline Mode: Showing cached status.");
      setTrackedComplaint({
        title: "System Connection: Offline",
        status_logs: [{ status: 'Offline Mode', timestamp: new Date(), notes: 'Displaying local cached data.' }]
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTrackingId(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_500px_1fr] gap-4 max-w-[1500px] mx-auto py-6 px-4">
      
      {/* Left Sidebar: Tracking & Impact */}
      <div className="flex flex-col gap-4">
        {/* Track Report Section */}
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-4">
          <h3 className="flex items-center gap-2 font-serif text-primary text-base font-bold mb-3">
            <Search size={16} /> Track Report
          </h3>
          
          {reportHistory.length > 0 && (
            <div className="mb-3">
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">History</label>
              <select 
                className="w-full bg-secondary border border-border rounded p-1 text-[11px] text-primary outline-none"
                onChange={handleHistorySelect}
                value={trackingId}
              >
                <option value="">-- Select --</option>
                {reportHistory.map(item => (
                  <option key={item.id} value={item.id}>{item.id}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">ID</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-[13px] text-foreground font-sans transition-colors" 
              placeholder="e.g. CIV-2024-084" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>
          <button 
            className="w-full bg-transparent border border-border text-primary text-[12px] font-medium py-1.5 px-3 rounded hover:bg-secondary transition-colors"
            onClick={handleTrack}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Check Status"}
          </button>

          {trackedComplaint && (
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              <div className="bg-secondary/40 p-2 rounded border border-border/50">
                <div className="text-[8px] font-bold uppercase text-accent mb-0.5">Status</div>
                <div className="font-bold text-[11px] text-primary">{trackedComplaint.title}</div>
              </div>
              {trackedComplaint.status_logs?.map((log: any, i: number) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="text-chart-3 mt-1">
                    {log.status === 'Resolved' ? <FileCheck2 size={12} /> : <Clock size={12} />}
                  </div>
                  <div>
                    <div className="font-semibold text-[10px]">{log.status}</div>
                    <div className="text-[8px] text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Civic Impact Section */}
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-4">
          <h3 className="flex items-center gap-2 font-serif text-primary text-base font-bold mb-3">
            <ThumbsUp size={16} /> Civic Impact
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-secondary/30 p-2 rounded text-center border border-border/30">
              <div className="text-[16px] font-bold text-primary">1.2k</div>
              <div className="text-[8px] uppercase font-bold text-muted-foreground">Resolved</div>
            </div>
            <div className="bg-secondary/30 p-2 rounded text-center border border-border/30">
              <div className="text-[16px] font-bold text-accent">94%</div>
              <div className="text-[8px] uppercase font-bold text-muted-foreground">Efficiency</div>
            </div>
          </div>

          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Live Feed</label>
          <div className="flex flex-col gap-2">
            {[
              { text: "Road repair completed in Baner", time: "2h ago" },
              { text: "New waste management route added", time: "5h ago" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5 border-l-2 border-border pl-2 py-0.5">
                <div className="text-[10px] font-medium leading-tight">{item.text}</div>
                <div className="text-[8px] text-muted-foreground font-bold">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Complaint Paper */}
      <div className="flex justify-center items-start pt-0">
        <div className="w-full">
          <ComplaintPaper onLocationUpdate={handleLocationUpdate} currentLocation={userLocation} />
        </div>
      </div>

      {/* Right Sidebar: Nearby Map */}
      <div className="flex flex-col gap-4">
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-5 h-fit flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-serif text-primary text-xl font-bold">
              <MapIcon size={20} /> Locality Insights
            </h3>
            <span className="text-[10px] font-bold uppercase bg-accent/10 text-accent px-2 py-0.5 rounded">Live Area</span>
          </div>
          
          {/* Square Map Container */}
          <div className="aspect-square w-full rounded-lg overflow-hidden border border-border relative z-0">
            {mounted && <CitizenMap nearbyIssues={nearbyIssues} userLocation={userLocation} onLocationUpdate={handleLocationUpdate} />}
          </div>
          
          <div className="mt-5 p-4 bg-secondary/30 rounded-lg border border-border/50">
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              "The map above shows real-time civic issues in your immediate vicinity. Click on markers to upvote priority repairs in your neighborhood."
            </p>
          </div>
        </div>
      </div>

    </div>

  );
}
