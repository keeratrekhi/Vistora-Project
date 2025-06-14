import React from 'react';
import { AccessType } from '@/enums/AccessType';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, X } from 'lucide-react';

interface EventVisibilityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  accessType: AccessType.Public | AccessType.Private;
  onAccessToggle: (checked: boolean) => void;
  isPublished: boolean;
}

const EventVisibilityPopup: React.FC<EventVisibilityPopupProps> = ({
  isOpen,
  onClose,
  accessType,
  onAccessToggle,
  isPublished
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-slate-700/50 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Event Visibility
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Control who can access your event:
          </p>

          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-3">
              {accessType === AccessType.Public ? (
                <Eye className="w-5 h-5 text-emerald-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <h3 className="text-white font-medium">
                  {accessType === AccessType.Public ? 'Public Event' : 'Private Event'}
                </h3>
                <p className="text-xs text-slate-400">
                  {accessType === AccessType.Public 
                    ? 'Anyone with the link can view' 
                    : 'Requires PIN to access'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Public</span>
              <Switch
                checked={accessType === AccessType.Private}
                onCheckedChange={onAccessToggle}
                disabled={!isPublished}
              />
              <span className="text-xs text-slate-400">Private</span>
            </div>
          </div>

          {!isPublished && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-300">
                Event must be published before changing visibility settings.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/25 transition-all duration-300"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventVisibilityPopup;