import React from 'react';

const CameraIllustration = () => {
  return (
    <div className="w-full h-96 relative">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background elements with gradients */}
        <circle cx="80" cy="60" r="50" fill="url(#gradient1)" opacity="0.3" />
        <circle cx="320" cy="180" r="40" fill="url(#gradient2)" opacity="0.2" />
        <circle cx="300" cy="80" r="35" fill="url(#gradient3)" opacity="0.25" />
        
        {/* Main DSLR Camera */}
        <g transform="translate(150, 120)">
          <rect x="0" y="15" width="80" height="50" rx="8" fill="url(#gradient4)" />
          <rect x="5" y="20" width="70" height="40" rx="5" fill="#2d3748" />
          <circle cx="40" cy="40" r="18" fill="url(#gradient5)" />
          <circle cx="40" cy="40" r="12" fill="#1a202c" />
          <circle cx="40" cy="40" r="8" fill="url(#gradient6)" />
          
          {/* Camera details */}
          <rect x="65" y="8" width="12" height="12" rx="3" fill="url(#gradient7)" />
          <rect x="10" y="5" width="25" height="8" rx="2" fill="url(#gradient4)" />
          <circle cx="70" cy="25" r="3" fill="url(#gradient8)" />
          <rect x="15" y="55" width="50" height="6" rx="3" fill="url(#gradient9)" />
        </g>
        
        {/* Video Camera */}
        <g transform="translate(50, 80)">
          <rect x="0" y="10" width="60" height="35" rx="6" fill="url(#gradient10)" />
          <rect x="55" y="15" width="20" height="25" rx="4" fill="url(#gradient11)" />
          <circle cx="30" cy="27" r="12" fill="url(#gradient12)" />
          <circle cx="30" cy="27" r="8" fill="#1a202c" />
          <rect x="10" y="2" width="30" height="6" rx="3" fill="url(#gradient13)" />
          <circle cx="50" cy="20" r="2" fill="#ef4444" />
        </g>
        
        {/* Tripod */}
        <g transform="translate(180, 180)">
          <line x1="0" y1="0" x2="20" y2="60" stroke="url(#gradient14)" strokeWidth="3" />
          <line x1="0" y1="0" x2="-15" y2="55" stroke="url(#gradient14)" strokeWidth="3" />
          <line x1="0" y1="0" x2="35" y2="50" stroke="url(#gradient14)" strokeWidth="3" />
          <circle cx="0" cy="0" r="4" fill="url(#gradient15)" />
        </g>
        
        {/* Photo Frames */}
        <g transform="translate(280, 40)">
          <rect x="0" y="0" width="40" height="30" rx="3" fill="white" stroke="url(#gradient16)" strokeWidth="2" />
          <rect x="3" y="3" width="34" height="24" fill="url(#gradient17)" />
          <circle cx="20" cy="15" r="8" fill="url(#gradient18)" opacity="0.7" />
        </g>
        
        <g transform="translate(290, 80)">
          <rect x="0" y="0" width="35" height="25" rx="2" fill="white" stroke="url(#gradient16)" strokeWidth="2" />
          <rect x="2" y="2" width="31" height="21" fill="url(#gradient19)" />
          <rect x="8" y="6" width="19" height="13" fill="url(#gradient20)" opacity="0.6" />
        </g>
        
        <g transform="translate(260, 120)">
          <rect x="0" y="0" width="30" height="22" rx="2" fill="white" stroke="url(#gradient16)" strokeWidth="2" />
          <rect x="2" y="2" width="26" height="18" fill="url(#gradient21)" />
          <circle cx="15" cy="11" r="6" fill="url(#gradient22)" opacity="0.8" />
        </g>
        
        {/* Memory Cards */}
        <g transform="translate(100, 200)">
          <rect x="0" y="0" width="25" height="18" rx="2" fill="url(#gradient23)" />
          <rect x="2" y="2" width="21" height="14" fill="#2d3748" />
          <rect x="4" y="4" width="8" height="2" fill="url(#gradient24)" />
          <rect x="4" y="7" width="12" height="2" fill="url(#gradient24)" />
        </g>
        
        <g transform="translate(130, 205)">
          <rect x="0" y="0" width="20" height="15" rx="2" fill="url(#gradient25)" />
          <rect x="2" y="2" width="16" height="11" fill="#1a202c" />
          <rect x="3" y="3" width="6" height="1.5" fill="url(#gradient26)" />
        </g>
        
        {/* Lens */}
        <g transform="translate(70, 150)">
          <circle cx="0" cy="0" r="20" fill="url(#gradient27)" />
          <circle cx="0" cy="0" r="15" fill="#2d3748" />
          <circle cx="0" cy="0" r="10" fill="url(#gradient28)" />
          <circle cx="0" cy="0" r="6" fill="#1a202c" />
        </g>
        
        {/* Studio Light */}
        <g transform="translate(320, 120)">
          <rect x="0" y="10" width="30" height="20" rx="15" fill="url(#gradient29)" />
          <rect x="25" y="0" width="8" height="40" rx="4" fill="url(#gradient30)" />
          <circle cx="15" cy="20" r="8" fill="#fbbf24" opacity="0.8" />
        </g>
        
        {/* Film Strip */}
        <g transform="translate(40, 40)">
          <rect x="0" y="0" width="80" height="15" rx="2" fill="url(#gradient31)" opacity="0.9" />
          <rect x="5" y="2" width="8" height="11" fill="#4a5568" />
          <rect x="18" y="2" width="8" height="11" fill="#4a5568" />
          <rect x="31" y="2" width="8" height="11" fill="#4a5568" />
          <rect x="44" y="2" width="8" height="11" fill="#4a5568" />
          <rect x="57" y="2" width="8" height="11" fill="#4a5568" />
          
          {/* Film perforations */}
          <circle cx="2" cy="3" r="1" fill="#2d3748" />
          <circle cx="2" cy="7" r="1" fill="#2d3748" />
          <circle cx="2" cy="11" r="1" fill="#2d3748" />
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#E2E8F0', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E2E8F0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1a202c', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.4 }} />
          </linearGradient>
          <linearGradient id="gradient10" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1a202c', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient11" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient12" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a202c', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient13" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient14" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6b7280', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient15" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient16" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient17" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient18" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.4 }} />
          </linearGradient>
          <linearGradient id="gradient19" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f1f5f9', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient20" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient21" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f7fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#edf2f7', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient22" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.5 }} />
          </linearGradient>
          <linearGradient id="gradient23" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient24" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="gradient25" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6b7280', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient26" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="gradient27" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1f2937', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient28" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1C41B8', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#A6B5E2', stopOpacity: 0.4 }} />
          </linearGradient>
          <linearGradient id="gradient29" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f7fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#edf2f7', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient30" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2d3748', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient31" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A6B5E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1C41B8', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CameraIllustration;