import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingCardProps {
  message: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ message }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white font-medium">{message}</span>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4 bg-slate-700/50" />
          <Skeleton className="h-20 w-full bg-slate-700/50" />
          <div className="flex space-x-2">
            <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
            <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;