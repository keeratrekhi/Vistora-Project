
import React, { useState } from "react";
import { X, Lock, Shield } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [pin, setPin] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      onSubmit(pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-slate-200/50 p-8 w-full max-w-md transform animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Protected Event
          </h2>
          
          <p className="text-slate-600 leading-relaxed">
            This event requires a PIN to access. Please enter the 4-digit code provided by the organizer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl text-center text-2xl font-mono tracking-widest bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
              placeholder="••••"
              maxLength={4}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
            />
            
            {/* PIN Progress Indicators */}
            <div className="flex justify-center mt-3 space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < pin.length 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' 
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 focus:ring-4 focus:ring-slate-200/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={pin.length < 4}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
            >
              Access Event
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PinModal;