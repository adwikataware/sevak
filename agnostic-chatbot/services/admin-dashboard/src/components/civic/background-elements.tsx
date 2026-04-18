"use client";

import React, { useEffect, useRef, useState } from 'react';

export const Squares = () => {
  const [squares, setSquares] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Generate a grid of squares
    const count = 100;
    setSquares(Array.from({ length: count }, (_, i) => i));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-4 p-8 opacity-20 pointer-events-none">
      {squares.map((i) => (
        <div 
          key={i}
          className="bg-primary/5 rounded-sm border border-primary/10 transition-all duration-1000"
          style={{
            animation: `pulse ${2 + Math.random() * 4}s infinite alternate ${Math.random() * 2}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.2; transform: scale(0.95); }
          100% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-accent/20"
          style={{
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `float ${10 + Math.random() * 20}s infinite linear`,
            filter: 'blur(2px)'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(${Math.random() * 50 - 25}px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
export const SocialConnectivity = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.09] z-0"
      style={{ 
        backgroundImage: `url('/bg-community.png')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        mixBlendMode: 'multiply'
      }}
    >
      {/* Secondary Web Layer for Density */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ 
          backgroundImage: `url('/bg-network.png')`, 
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};
