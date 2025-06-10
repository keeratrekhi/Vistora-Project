const NoEventsIllustration = () => {
  return (
    <div className="w-48 h-48 mx-auto mb-6 relative">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.6" />
        
        {/* Floating elements */}
        <circle cx="40" cy="60" r="3" fill="#e5e7eb" opacity="0.8" />
        <circle cx="160" cy="80" r="2" fill="#d1d5db" opacity="0.6" />
        <circle cx="170" cy="140" r="2.5" fill="#e5e7eb" opacity="0.7" />
        <circle cx="30" cy="140" r="2" fill="#d1d5db" opacity="0.5" />
        
        {/* Main calendar */}
        <rect x="70" y="70" width="60" height="70" rx="8" fill="url(#calendarGradient)" />
        
        {/* Calendar top bar */}
        <rect x="70" y="70" width="60" height="15" rx="8" fill="#1e40af" />
        
        {/* Calendar rings */}
        <circle cx="80" cy="65" r="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="120" cy="65" r="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
        
        {/* Calendar grid */}
        <rect x="75" y="90" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="85" y="90" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="95" y="90" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="105" y="90" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="115" y="90" width="6" height="6" rx="1" fill="#bfdbfe" />
        
        <rect x="75" y="100" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="85" y="100" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="95" y="100" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="105" y="100" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="115" y="100" width="6" height="6" rx="1" fill="#bfdbfe" />
        
        <rect x="75" y="110" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="85" y="110" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="95" y="110" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="105" y="110" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="115" y="110" width="6" height="6" rx="1" fill="#bfdbfe" />
        
        <rect x="75" y="120" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="85" y="120" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="95" y="120" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="105" y="120" width="6" height="6" rx="1" fill="#bfdbfe" />
        <rect x="115" y="120" width="6" height="6" rx="1" fill="#bfdbfe" />
        
        {/* Stars around calendar */}
        <g fill="url(#starGradient)">
          <polygon points="50,50 52,56 58,56 53.5,60 55.5,66 50,62 44.5,66 46.5,60 42,56 48,56" />
          <polygon points="150,45 151.5,49 155.5,49 152.5,51.5 153.5,55.5 150,53 146.5,55.5 147.5,51.5 144.5,49 148.5,49" />
          <polygon points="45,120 46.5,124 50.5,124 47.5,126.5 48.5,130.5 45,128 41.5,130.5 42.5,126.5 39.5,124 43.5,124" />
          <polygon points="155,120 156.5,124 160.5,124 157.5,126.5 158.5,130.5 155,128 151.5,130.5 152.5,126.5 149.5,124 153.5,124" />
        </g>
        
        {/* Sparkles */}
        <g fill="#f472b6" opacity="0.7">
          <circle cx="65" cy="45" r="1.5" />
          <circle cx="135" cy="35" r="1" />
          <circle cx="35" cy="95" r="1.5" />
          <circle cx="165" cy="95" r="1" />
          <circle cx="60" cy="160" r="1" />
          <circle cx="140" cy="165" r="1.5" />
        </g>
        
        {/* Plus sign indicating "add" */}
        <g fill="#10b981" opacity="0.8">
          <rect x="98" y="155" width="4" height="12" rx="2" />
          <rect x="96" y="157" width="8" height="4" rx="2" />
        </g>
      </svg>
    </div>
  );
};

export default NoEventsIllustration;