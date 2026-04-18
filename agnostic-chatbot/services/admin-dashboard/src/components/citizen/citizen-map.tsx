"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

interface CitizenMapProps {
  nearbyIssues: any[];
  userLocation?: { lat: number, lng: number } | null;
}

// Subcomponent to handle programmatic map movement
function MapRefocus({ coords }: { coords: { lat: number, lng: number } | null }) {
  const map = require('react-leaflet').useMap();
  React.useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

// Subcomponent to handle manual clicks
function MapEvents({ onLocationUpdate }: { onLocationUpdate?: (lat: number, lng: number) => void }) {
  const map = require('react-leaflet').useMapEvents({
    click(e: any) {
      if (onLocationUpdate) {
        onLocationUpdate(e.latlng.lat, e.latlng.lng);
        toast.info("Location manually set via map click.");
      }
    },
  });
  return null;
}

export default function CitizenMap({ nearbyIssues, userLocation, onLocationUpdate }: CitizenMapProps & { onLocationUpdate?: (lat: number, lng: number) => void }) {
  if (typeof window === 'undefined') return null;

  // Dynamically require leaflet to avoid top-level side effects
  const L = require('leaflet');
  const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const userIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <MapRefocus coords={userLocation || null} />
      <MapEvents onLocationUpdate={onLocationUpdate} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup><b>Your Location</b><br/>Issues below are relative to here.</Popup>
        </Marker>
      )}

      {nearbyIssues.map((issue) => (
        <Marker key={issue.id} position={[issue.lat, issue.lng]} icon={icon}>
          <Popup>
            <div className="p-1">
              <div className="font-bold text-sm mb-1">{issue.title}</div>
              <div className="text-[10px] uppercase text-accent font-bold mb-2">{issue.category}</div>
              <div className="flex items-center justify-between gap-4 border-t pt-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{issue.reports} reports</span>
                <button 
                  onClick={() => toast.success("Voted! This issue's priority increased.")}
                  className="bg-primary text-white text-[10px] px-2 py-1 rounded flex items-center gap-1"
                >
                  <ThumbsUp size={10} /> Me Too
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
