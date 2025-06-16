import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import ReactPlayer from 'react-player';

interface MediaItem {
  url: string;
  name: string;
  type: 'image' | 'video' | 'other';
}

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onDownload?: (fileName: string) => void;
  showDownload?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  isOpen,
  onClose,
  media,
  currentIndex,
  onNavigate,
  onDownload,
  showDownload = false,
}) => {
  // handle Escape / arrows
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) return onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < media.length - 1) return onNavigate(currentIndex + 1);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, currentIndex, media.length, onNavigate, onClose]);

  if (!isOpen || !media[currentIndex]) return null;
  const item = media[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Prevent click-through */}
      <div className="absolute inset-0" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download */}
      {showDownload && onDownload && (
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(item.name); }}
          className="absolute top-4 right-16 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <Download className="w-6 h-6" />
        </button>
      )}

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Media */}
      <div
        className="relative z-10 max-w-full max-h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.name}
            className="max-w-screen max-h-screen "
          />
        ) : (
          <div className="w-full h-full max-w-screen max-h-screen">
            <ReactPlayer
              url={item.url}
              controls
              width="100%"
              height="100%"
            />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center text-white">
        <p className="text-sm">{item.name}</p>
        <p className="text-xs mt-1">{currentIndex + 1} / {media.length}</p>
      </div>
    </div>
  );
};

export default MediaViewer;
