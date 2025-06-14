import React from 'react';
import { Progress } from '@/components/ui/progress';

interface StorageCardProps {
  usedStorage: string;
  totalStorage: string;
  percentage: number;
}

const StorageCard: React.FC<StorageCardProps> = ({ usedStorage, totalStorage, percentage }) => {
  const formatBytes = (bytes: string): string => {
    const num = Number(bytes);
    if (num === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = num;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getAvailableStorage = () => {
    const used = Number(usedStorage);
    const total = Number(totalStorage);
    const available = total - used;
    return formatBytes(available.toString());
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-fade-in hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Storage Usage
        </h2>
        <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Used</span>
            <span className="text-white font-medium">{percentage}%</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3 bg-slate-700/50 border border-slate-600/30"
          />
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="text-2xl font-bold text-cyan-400">
              {formatBytes(usedStorage)}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Used Storage
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="text-2xl font-bold text-green-400">
              {getAvailableStorage()}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Available
            </div>
          </div>
        </div>

        {/* Total Storage */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Storage</span>
            <span className="text-white font-semibold text-lg">
              {formatBytes(totalStorage)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageCard;