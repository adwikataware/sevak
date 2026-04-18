"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, MapPin, TrendingUp, AlertTriangle, Filter, Eye, 
  UserCheck, ShieldAlert, List, Map as MapIcon, Mic, BarChart2 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area, 
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import BulletinBoard from "./bulletin-board";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const analyticsData = [
  { name: 'Mon', Resolved: 12, Reported: 18 },
  { name: 'Tue', Resolved: 19, Reported: 15 },
  { name: 'Wed', Resolved: 15, Reported: 25 },
  { name: 'Thu', Resolved: 22, Reported: 20 },
  { name: 'Fri', Resolved: 30, Reported: 28 },
  { name: 'Sat', Resolved: 14, Reported: 10 },
  { name: 'Sun', Resolved: 8, Reported: 12 },
];

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [viewMode, setViewMode] = useState('list');
  const [activeDept, setActiveDept] = useState('All Departments');
  const [isLoading, setIsLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Initialize Leaflet on client side
    import('leaflet').then(leaflet => {
      setL(leaflet);
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });

    const fetchComplaints = async () => {
      try {
        const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3000';
        const response = await fetch(`${aiServiceUrl}/api/complaints`, {
          headers: { 'X-Tenant-ID': 'pune-slug' }
        });
        const result = await response.json();
        const rawData = result.complaints || (Array.isArray(result) ? result : []);
        
        // --- Demo Strategy: Combine Live API + Demo Sync Store + Base Mock Data ---
        const baseMocks = [
          {
            id: 'MOCK-101',
            title: 'Major Water Leak - Baner Main Rd',
            location: 'Baner, Pune',
            priority_score: 92,
            reports_count: 14,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            latitude: 18.559,
            longitude: 73.779,
            description: 'Continuous water leakage from main pipeline near Axis Bank. Flooding on road.',
            status: 'filed',
            sla_breach_risk: 'high',
            category: 'Water & Sanitation'
          },
          {
            id: 'MOCK-102',
            title: 'Streetlight Failure - Sector 4',
            location: 'Hinjewadi, Pune',
            priority_score: 45,
            reports_count: 3,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            latitude: 18.591,
            longitude: 73.738,
            description: 'Multiple streetlights not working in the internal lane of Sector 4.',
            status: 'assigned',
            sla_breach_risk: 'breached',
            category: 'Electrical'
          }
        ];

        const demoStore = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sevak_global_demo_store') || '[]') : [];
        let finalData = [...demoStore, ...rawData, ...baseMocks];

        // Map data to high-fidelity UI structure
        const mappedData = finalData.map((c: any) => ({
          id: c.tracking_id || c.id,
          title: c.title,
          location: c.location || 'Pune, MH',
          priority: c.priority_score >= 80 ? 'Critical' : (c.priority_score >= 50 ? 'High' : 'Medium'),
          score: Math.round(c.priority_score || 0),
          reports: c.reports_count || 1,
          daysPending: Math.floor((new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          lat: c.latitude || 18.5204 + (Math.random() - 0.5) * 0.1,
          lng: c.longitude || 73.8567 + (Math.random() - 0.5) * 0.1,
          desc: c.description,
          status: c.status,
          slaRisk: c.sla_breach_risk || 'normal',
          ai: {
            severity: `${Math.round(c.priority_score || 70)}/100 Impact`,
            category: c.category || 'General',
            recommendation: c.ai_verification_notes || "Dispatch inspection team to verify structural integrity and impact on traffic.",
            department: c.category || 'Roads & Infrastructure'
          }
        }));

        // Sort by creation date descending (newest first)
        const sortedData = mappedData.sort((a, b) => b.daysPending - a.daysPending);

        setComplaints(sortedData);
        if (mappedData.length > 0) setSelectedComplaint(mappedData[0]);
      } catch (error) {
        console.error("Backend fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const createCustomIcon = (priority: string) => {
    if (typeof window === 'undefined' || !L) return null;
    const color = priority === 'Critical' ? '#c24127' : (priority === 'High' ? '#D96C4A' : '#4A7C59');
    try {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    } catch (e) {
      return null;
    }
  };

  const departments = ['All Departments', 'Roads & Infrastructure', 'Water & Sanitation', 'Electrical'];

  const filteredComplaints = complaints.filter(c => {
    if (activeDept === 'All Departments') return true;
    return c.ai.department === activeDept;
  });

  const stats = {
    critical: complaints.filter(c => c.priority === 'Critical' || c.slaRisk === 'breached').length,
    pending: complaints.filter(c => c.status !== 'resolved').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  };

  if (isLoading) return <div className="p-12 text-center font-serif text-2xl">Loading Authority Command Center...</div>;

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Top Gazette Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-primary pb-6 overflow-hidden">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="border-r-2 border-primary pr-6 flex-shrink-0">
            <h1 className="text-4xl font-black font-serif uppercase leading-[0.85] tracking-tight">Official<br />Gazette</h1>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
          <div className="flex-1 max-w-2xl overflow-hidden">
            <BulletinBoard showStats={false} isAdmin={true} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 text-right min-w-[300px] flex-shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Active Tickets</div>
            <div className="text-xl font-bold font-serif">{stats.pending + stats.resolved}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Avg. Resolution</div>
            <div className="text-xl font-bold font-serif">3.2 Days</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">System Health</div>
            <div className="text-xl font-bold font-serif text-[#4a7c59]">98.4%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        
        {/* Main Queue Panel */}
        <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col gap-6 p-8">
          
          {/* Department Tabs */}
          <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
            {departments.map(dept => (
              <button 
                key={dept}
                onClick={() => { setActiveDept(dept); setSelectedComplaint(null); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeDept === dept ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* AI Copilot Bar */}
          <div className="bg-secondary/50 border border-accent/30 rounded-full px-6 py-3 flex items-center gap-4 shadow-inner">
            <div className="text-accent animate-pulse"><Mic size={20} /></div>
            <input 
              type="text" 
              placeholder={`Ask AI Copilot: 'Show me critical issues in ${activeDept}'...`}
              className="bg-transparent flex-1 text-sm text-primary outline-none placeholder:text-muted-foreground"
            />
            <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold">Enter</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold font-serif text-primary">{activeDept} Queue</h2>
              <p className="text-sm text-muted-foreground mt-1">Zone B Overview • {filteredComplaints.length} Active Tickets</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-secondary p-1 rounded-lg border border-border">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <List size={14} /> List
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <MapIcon size={14} /> Map
                </button>
                <button 
                  onClick={() => setViewMode('analytics')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'analytics' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <BarChart2 size={14} /> Analytics
                </button>
              </div>
              <button className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-[#fdf2f0] border border-[#f5e1dd]">
              <div className="text-[#c24127] font-bold text-xs uppercase tracking-wider">Critical SLAs Risk</div>
              <div className="text-4xl font-bold text-[#c24127] mt-2">{stats.critical}</div>
            </div>
            <div className="p-6 rounded-xl bg-secondary border border-border">
              <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Pending Issues</div>
              <div className="text-4xl font-bold text-primary mt-2">{stats.pending}</div>
            </div>
            <div className="p-6 rounded-xl bg-[#f2f7f3] border border-[#e1e9e3]">
              <div className="text-[#4a7c59] font-bold text-xs uppercase tracking-wider">Resolved Today</div>
              <div className="text-4xl font-bold text-[#4a7c59] mt-2">{stats.resolved}</div>
            </div>
          </div>

          {/* Views */}
          <div className="flex-1">
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4">
                {filteredComplaints.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedComplaint(c)}
                    className={`p-6 rounded-xl border transition-all cursor-pointer flex items-center gap-6 ${
                      selectedComplaint?.id === c.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-accent hover:bg-secondary/30'
                    }`}
                  >
                    <div className="text-center min-w-[60px]">
                      <div className={`text-2xl font-bold font-serif ${c.priority === 'Critical' ? 'text-[#c24127]' : 'text-primary'}`}>
                        {c.score}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Score</div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold font-serif text-primary truncate">{c.title}</h4>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {c.location}</span>
                        <span className="flex items-center gap-1.5"><TrendingUp size={12} /> {c.reports} Reports</span>
                        <span className={`flex items-center gap-1.5 ${c.daysPending > 3 ? 'text-[#c24127] font-bold' : ''}`}>
                          <AlertTriangle size={12} /> Day {c.daysPending}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      c.priority === 'Critical' ? 'bg-[#fdf2f0] text-[#c24127]' : 
                      (c.priority === 'High' ? 'bg-secondary text-primary' : 'bg-[#f2f7f3] text-[#4a7c59]')
                    }`}>
                      {c.priority}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'map' && MapContainer && (
              <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border shadow-inner relative z-0">
                <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {filteredComplaints.map((c) => (
                    <Marker 
                      key={c.id} 
                      position={[c.lat, c.lng]} 
                      icon={createCustomIcon(c.priority)}
                      eventHandlers={{ click: () => setSelectedComplaint(c) }}
                    >
                      <Popup>
                        <div className="font-bold">{c.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">Score: {c.score} | Reports: {c.reports}</div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {viewMode === 'analytics' && (
              <div className="flex flex-col gap-8">
                {/* Row 1: Area & Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 1. Resolution Trend - Area Chart with Gradient */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 font-serif flex items-center gap-2">
                      <TrendingUp className="text-accent" size={20} />
                      Intake & Resolution Velocity
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Mon', intake: 12, resolved: 8 },
                          { name: 'Tue', intake: 19, resolved: 14 },
                          { name: 'Wed', intake: 15, resolved: 18 },
                          { name: 'Thu', intake: 22, resolved: 12 },
                          { name: 'Fri', intake: 30, resolved: 25 },
                          { name: 'Sat', intake: 18, resolved: 20 },
                          { name: 'Sun', intake: 10, resolved: 15 },
                        ]}>
                          <defs>
                            <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1e1c1a" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1e1c1a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#4A7C59" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#736c64', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#736c64', fontSize: 12}} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece4" />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="intake" stroke="#1e1c1a" strokeWidth={3} fillOpacity={1} fill="url(#colorIntake)" />
                          <Area type="monotone" dataKey="resolved" stroke="#4A7C59" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. Departmental Efficiency - Radar Chart */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 font-serif flex items-center gap-2">
                      <ShieldAlert className="text-accent" size={20} />
                      Departmental Health Matrix
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { subject: 'Speed', Roads: 80, Water: 90, Elect: 70, fullMark: 100 },
                          { subject: 'Accuracy', Roads: 70, Water: 60, Elect: 85, fullMark: 100 },
                          { subject: 'Citizen Sat', Roads: 60, Water: 80, Elect: 90, fullMark: 100 },
                          { subject: 'Cost-Eff', Roads: 85, Water: 75, Elect: 65, fullMark: 100 },
                          { subject: 'Tech-Adop', Roads: 90, Water: 85, Elect: 80, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="#e2dcd0" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#736c64', fontSize: 12}} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Water & San." dataKey="Water" stroke="#1e1c1a" fill="#1e1c1a" fillOpacity={0.5} />
                          <Radar name="Electrical" dataKey="Elect" stroke="#d96c4a" fill="#d96c4a" fillOpacity={0.3} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Row 2: Distribution & SLA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* 3. Ticket Distribution - Donut Chart */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm md:col-span-2">
                     <h3 className="text-xl font-bold mb-6 font-serif">Authority Distribution (by Zone)</h3>
                     <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Zone A', open: 45, closed: 32 },
                            { name: 'Zone B', open: 52, closed: 48 },
                            { name: 'Zone C', open: 38, closed: 60 },
                            { name: 'Zone D', open: 65, closed: 22 },
                          ]} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                            <Tooltip cursor={{fill: '#fdfbf7'}} />
                            <Bar dataKey="open" fill="#1e1c1a" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="closed" fill="#eae5d9" radius={[0, 4, 4, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* 4. Risk Pie Chart */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 font-serif">SLA Compliance</h3>
                    <div className="h-[250px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'On Track', value: 65 },
                              { name: 'At Risk', value: 20 },
                              { name: 'Breached', value: 15 },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#4A7C59" />
                            <Cell fill="#D96C4A" />
                            <Cell fill="#c24127" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black font-serif">82%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Efficiency</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Sidebar */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 h-fit sticky top-8">
          {selectedComplaint ? (
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    selectedComplaint.priority === 'Critical' ? 'bg-[#fdf2f0] text-[#c24127]' : 'bg-secondary text-primary'
                  }`}>
                    {selectedComplaint.priority}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{selectedComplaint.id}</div>
                </div>
                <h2 className="text-3xl font-bold font-serif text-primary leading-tight mb-4">{selectedComplaint.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedComplaint.desc}
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-xl border border-border space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-primary text-sm">
                    <ShieldAlert size={18} className="text-accent" /> Priority Engine (Master)
                  </div>
                  <div className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded">v2.1 AI-Postgres</div>
                </div>

                <div className="space-y-3">
                  {/* Formula Breakdown */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Base Severity (AI):</span>
                    <span className="font-mono font-bold">{Math.round(selectedComplaint.score * 0.4)} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Volume Boost ({selectedComplaint.reports} reports):</span>
                    <span className="font-mono font-bold">+{ (selectedComplaint.reports * 0.5).toFixed(1) } pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Time Decay ({selectedComplaint.daysPending} days):</span>
                    <span className="font-mono font-bold">+{ (selectedComplaint.daysPending * 1.5).toFixed(1) } pts</span>
                  </div>
                  
                  <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">Master Score:</span>
                    <span className="text-xl font-black text-accent">{selectedComplaint.score}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 font-bold text-primary text-[10px] uppercase tracking-wider mb-2">
                    AI Action Protocol
                  </div>
                  <div className="bg-white p-4 rounded-lg text-xs leading-relaxed border border-border shadow-sm italic text-muted-foreground">
                    "{selectedComplaint.ai.recommendation}"
                    <div className="mt-3 flex gap-4 text-[10px] font-bold text-accent not-italic">
                      <span>Est. Cost: ₹{selectedComplaint.score * 120}</span>
                      <span>Category: {selectedComplaint.ai.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="flex items-center gap-2"><UserCheck size={18} /> AI Auto-Routing</span>
                  <span className="text-[10px] uppercase text-[#4a7c59] bg-[#f2f7f3] px-2 py-1 rounded font-bold">Routed</span>
                </div>
                <div className="bg-secondary/40 p-4 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-bold">{selectedComplaint.ai.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned Officer:</span>
                    <span className="bg-primary text-white px-3 py-1 rounded-full font-bold">Ravi Kumar</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={async () => {
                    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3000';
                    try {
                      // 1. Update Global Demo Store for Officer Sync
                      if (typeof window !== 'undefined') {
                        const store = JSON.parse(localStorage.getItem('sevak_global_demo_store') || '[]');
                        const updatedStore = store.map((item: any) => 
                          item.id === selectedComplaint.id ? { ...item, status: 'assigned' } : item
                        );
                        localStorage.setItem('sevak_global_demo_store', JSON.stringify(updatedStore));
                      }

                      const response = await fetch(`${aiServiceUrl}/api/complaints/${selectedComplaint.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'pune-slug' },
                        body: JSON.stringify({ status: 'assigned' })
                      });
                      if (response.ok) {
                        import('sonner').then(({ toast }) => toast.success(`Task dispatched to Ravi Kumar successfully!`));
                        // Refresh the list locally
                        setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: 'assigned' } : c));
                        setSelectedComplaint(prev => ({ ...prev, status: 'assigned' }));
                      }
                    } catch (e) {
                      console.error("Dispatch Error:", e);
                    }
                  }}
                  className="bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent shadow-md transition-all"
                >
                  Confirm & Dispatch
                </button>
                <button className="text-destructive font-bold text-sm py-2">Override Assignment</button>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground italic text-sm text-center px-8">
              Select a complaint from the queue to generate AI analysis and routing protocols.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
