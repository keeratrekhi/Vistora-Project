
import React, { useEffect, useRef } from 'react';

const MovingBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;
      
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / 25;
      const moveY = (clientY - centerY) / 25;
      
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${moveX * -1}px, ${moveY * -1}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${moveX * 1.2}px, ${moveY * 1.2}px)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${moveX * 0.8}px, ${moveY * -0.8}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="moving-background" ref={backgroundRef}>
      <div className="bg-blob blob-1" ref={blob1Ref}></div>
      <div className="bg-blob blob-2" ref={blob2Ref}></div>
      <div className="bg-blob blob-3" ref={blob3Ref}></div>
    </div>
  );
};

export default MovingBackground;
