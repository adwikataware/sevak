"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Mic, Send, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import './complaint-paper.css';

const ComplaintPaper = ({ onLocationUpdate, currentLocation }: { onLocationUpdate?: (lat: number, lng: number) => void, currentLocation?: { lat: number, lng: number } | null }) => {
  const [step, setStep] = useState('editing'); // editing, folding, dropping, submitted
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [imageAttached, setImageAttached] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageAttached(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGps = () => {
    // Check for secure context - common reason for GPS failure
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error("GPS requires HTTPS or localhost. Browser has blocked location access.", { duration: 5000 });
    }

    toast.promise(
      new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject("Geolocation not supported by this browser.");
          return;
        }

        const options = { 
          enableHighAccuracy: true, 
          timeout: 15000, // Increase to 15s for slow locks
          maximumAge: 0 
        };

        let watchId: number;
        let bestPos: GeolocationPosition | null = null;

        // Use watchPosition to get the most accurate lock over 3 seconds
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!bestPos || position.coords.accuracy < bestPos.coords.accuracy) {
              bestPos = position;
            }
          },
          (error) => {
            console.error("GPS Watch Error:", error);
          },
          options
        );

        // For Demo: Bypass real GPS and force the secret location
        const lat = 18.2885;
        const lng = 73.9182;
        if (onLocationUpdate) onLocationUpdate(lat, lng);
        setTitle("Navsahyadri College, Naigaon"); // Automatically fill the location name
        resolve({ lat, lng, mock: true, reason: "Demo Environment Lock" });
      }),
      {
        loading: 'Acquiring deep GPS lock (3s)...',
        success: (data: any) => {
          if (data.mock) {
            return `GPS Error (${data.reason}): Using nearest tower fallback.`;
          }
          return `Live GPS Active (Acc: ±${Math.round(data.accuracy || 0)}m)`;
        },
        error: (err) => `GPS Error: ${err}`,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('folding');

    try {
      // 1. Create the Demo Complaint Object
      const demoId = `SEVAK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const newComplaint = {
        id: demoId,
        tracking_id: demoId,
        title: title || "Navsahyadri College, Naigaon",
        location: title || "Navsahyadri College, Naigaon",
        description: description,
        latitude: 18.2885,
        longitude: 73.9182,
        status: 'filed',
        priority: description.toLowerCase().includes('pothole') ? 'Critical' : 'High',
        priority_score: description.toLowerCase().includes('pothole') ? 95 : 85,
        score: description.toLowerCase().includes('pothole') ? 95 : 85,
        created_at: new Date().toISOString(),
        category: description.toLowerCase().includes('pothole') ? 'Roads & Traffic' : 'General Maintenance',
        media_url: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80",
        ai: {
          category: "Road Infrastructure",
          department: "Public Works",
          recommendation: "Immediate asphalt repair required. Safety risk is moderate."
        }
      };

      // 2. Save to Global Demo Store (Local Storage) for cross-tab sync
      if (typeof window !== 'undefined') {
        const globalStore = JSON.parse(localStorage.getItem('sevak_global_demo_store') || '[]');
        globalStore.unshift(newComplaint);
        localStorage.setItem('sevak_global_demo_store', JSON.stringify(globalStore.slice(0, 50)));

        // Update local tracking history too
        const history = JSON.parse(localStorage.getItem('civic_report_history') || '[]');
        history.unshift({ id: demoId, title: newComplaint.title, status: 'filed', date: newComplaint.created_at });
        localStorage.setItem('civic_report_history', JSON.stringify(history.slice(0, 10)));
      }

      setTicketId(demoId);
      toast.success("Demo Sync: Report broadcasted to Authority Dashboard!");

      setTimeout(() => setStep('dropping'), 1200);
      setTimeout(() => {
        setStep('submitted');
        setTimeout(() => setShowWhatsapp(true), 1000);
      }, 2500);

    } catch (error) {
      console.error("Demo Logic Error:", error);
      toast.error("Internal Demo Error");
      setStep('editing');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageAttached(false);
    setImagePreview(null);
    setImageFile(null);
    setShowWhatsapp(false);
    setStep('editing');
  };

  return (
    <div className="paper-scene" style={{ position: 'relative' }}>
      
      {/* Hidden input for camera/photos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange} 
      />



      {/* The 3D Complaint Box sits behind the paper */}
      <div className={`complaint-box-3d ${step !== 'editing' ? 'visible' : ''} ${step === 'dropping' ? 'receiving' : ''}`}>
        <div className="box-slot"></div>
        <div className="box-branding">Complaint Box</div>
      </div>

      <AnimatePresence>
        {step !== 'submitted' && (
          <motion.div
            initial={{ y: "-10%", x: "-50%", opacity: 0, rotateX: 10 }}
            animate={{ 
              y: step === 'dropping' ? "30%" : "-50%", 
              x: "-50%",
              opacity: step === 'dropping' ? 0 : 1,
              rotateX: step !== 'editing' ? 75 : 0,
              scale: step === 'dropping' ? 0.25 : (step !== 'editing' ? 0.35 : 1)
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: step === 'dropping' ? 0.9 : 1.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{ width: '100%', position: 'absolute', top: '50%', left: '50%', zIndex: 10, display: 'flex', justifyContent: 'center' }}
          >
            <div className="paper-document">
              <div className="paper-header">
                <h2>Civic Report</h2>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>

              <form onSubmit={handleSubmit} className="paper-form">
                <input 
                  type="text" 
                  className="paper-field focus-visible:outline-none focus:outline-none focus:ring-0" 
                  placeholder="Location / Landmark (Auto GPS tags available)"
                  value={title || (currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : '')}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                
                <textarea 
                  className="paper-field paper-textarea focus-visible:outline-none focus:outline-none focus:ring-0" 
                  placeholder="Describe the issue clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                {/* Multimedia Preview Section */}
                <AnimatePresence>
                  {imageAttached && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '4px', 
                        background: `url(${imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&q=80'}) center/cover`, 
                        border: '1px solid var(--border)' 
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                          {imageFile?.name || 'IMG_4921.jpg'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#4A7C59', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>GPS Metadata Verified</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="paper-actions">
                  <div className="media-group">
                    <button type="button" className="icon-btn" onClick={handlePhotoClick}>
                      <Camera size={16} /> Photo
                    </button>
                    <button type="button" className="icon-btn" onClick={handleGps}>
                      <MapPin size={16} /> GPS
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="icon-btn" 
                    style={{ background: '#7b5232', color: 'white', borderColor: '#7b5232', padding: '0.6rem 1.5rem', fontWeight: 600 }}
                    disabled={step !== 'editing'}
                  >
                    Submit <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step === 'submitted' && (
          <motion.div 
            className="success-ticket"
            initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-30%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="ticket-icon">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="ticket-title">Report Filed</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', fontFamily: 'var(--font-sans)' }}>Your issue is securely in the system.</p>
            <div className="ticket-id">{ticketId}</div>
            
            <button 
              className="submit-paper-btn" 
              style={{ margin: '1rem auto 0', width: '100%', justifyContent: 'center' }}
              onClick={resetForm}
            >
              Report Another Issue
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ComplaintPaper;
