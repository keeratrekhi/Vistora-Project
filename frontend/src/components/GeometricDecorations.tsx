import React from 'react';

interface GeometricDecorationsProps {
  side: 'left' | 'right';
}

const GeometricDecorations: React.FC<GeometricDecorationsProps> = ({ side }) => {
  const isLeft = side === 'left';
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
      {/* Large floating geometric shapes */}
      <div
        className={`absolute ${isLeft ? 'top-20 left-10' : 'top-16 right-8'} w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl animate-float blur-sm`}
        style={{ animationDelay: '0s' }}
      />
      
      <div
        className={`absolute ${isLeft ? 'top-60 left-20' : 'top-52 right-16'} w-24 h-24 bg-gradient-to-br from-blue-500/25 to-cyan-500/25 animate-morph animate-float-reverse`}
        style={{ animationDelay: '1s' }}
      />
      
      <div
        className={`absolute ${isLeft ? 'bottom-40 left-8' : 'bottom-32 right-12'} w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full animate-pulse-glow`}
        style={{ animationDelay: '2s' }}
      />
      
      <div
        className={`absolute ${isLeft ? 'bottom-20 left-16' : 'bottom-16 right-6'} w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 transform rotate-45 animate-spin-slow`}
        style={{ animationDelay: '3s' }}
      />
      
      {/* Medium decorative elements */}
      <div
        className={`absolute ${isLeft ? 'top-40 left-32' : 'top-36 right-24'} w-12 h-12 bg-gradient-to-br from-violet-500/40 to-purple-500/40 rounded-xl animate-float`}
        style={{ animationDelay: '1.5s' }}
      />
      
      <div
        className={`absolute ${isLeft ? 'top-80 left-4' : 'top-72 right-4'} w-10 h-10 bg-gradient-to-br from-pink-500/35 to-rose-500/35 rounded-full animate-pulse-glow`}
        style={{ animationDelay: '2.5s' }}
      />
      
      {/* Small floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full animate-float`}
          style={{
            [isLeft ? 'left' : 'right']: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
      
      {/* Gradient orbs */}
      <div
        className={`absolute ${isLeft ? 'top-32 left-24' : 'top-28 right-20'} w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-2xl animate-pulse-glow`}
        style={{ animationDelay: '0.5s' }}
      />
      
      <div
        className={`absolute ${isLeft ? 'bottom-32 left-12' : 'bottom-28 right-8'} w-36 h-36 bg-gradient-to-br from-blue-600/15 to-cyan-600/15 rounded-full blur-xl animate-float-reverse`}
        style={{ animationDelay: '1.8s' }}
      />
    </div>
  );
};

export default GeometricDecorations;