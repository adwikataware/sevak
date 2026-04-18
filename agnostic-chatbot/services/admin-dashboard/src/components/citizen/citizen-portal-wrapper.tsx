"use client";

import dynamic from 'next/dynamic';

const CitizenPortal = dynamic(() => import('./citizen-portal'), { 
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-serif text-lg">Loading Secure Citizen Portal...</p>
    </div>
  )
});

export default function CitizenPortalWrapper() {
  return <CitizenPortal />;
}
