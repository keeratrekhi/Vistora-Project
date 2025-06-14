
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
  showDownload = false
}) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < media.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, currentIndex, media.length, onNavigate, onClose]);

  if (!isOpen || !media[currentIndex]) return null;

  const currentItem = media[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-black to-slate-800 items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download button */}
      {showDownload && onDownload && (
        <button
          onClick={() => onDownload(currentItem.name)}
          className="absolute top-4 right-20 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
        >
          <Download className="w-6 h-6" />
        </button>
      )}

      {/* Navigation arrows */}
      {hasPrevious && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Media content - Full screen */}
      <div className="w-full h-full flex items-center justify-center p-4">
        {currentItem.type === 'image' ? (
          <img
            src={currentItem.url}
            alt={currentItem.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full max-w-6xl max-h-[90vh]">
            <ReactPlayer
              url={currentItem.url}
              controls
              width="100%"
              height="100%"
              playing
              style={{ borderRadius: '8px', overflow: 'hidden' }}
            />
          </div>
        )}
      </div>

      {/* Media info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-lg backdrop-blur-sm">
        <p className="text-sm font-medium">{currentItem.name}</p>
        <p className="text-xs text-slate-300 mt-1 text-center">
          {currentIndex + 1} of {media.length}
        </p>
      </div>

      {/* Background click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default MediaViewer;