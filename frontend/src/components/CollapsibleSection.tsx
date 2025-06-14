import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  animationDelay?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  animationDelay = '0s'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div 
      className="bg-gradient-to-br from-slate-900 via-black to-slate-800 rounded-2xl border border-slate-600/50 hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{animationDelay}}
    >
      {/* Header Bar */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400 transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200" />
        )}
      </div>

      {/* Expanded Content */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;