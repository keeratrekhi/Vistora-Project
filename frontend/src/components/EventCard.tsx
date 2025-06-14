import { Event } from "@/models/Event";
import { getEventCovers } from "@/services/EventsService";
import { Settings, Share2, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
  onDelete: (eventId: string) => void;
}

const truncateDescription = (description: string) => {
  if (description.length > 15) {
    return description.substring(0, 15) + ".......";
  }
  return description;
};

const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isCoverLoading, setIsCoverLoading] = useState(true);
  const [coverError, setCoverError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCover = async () => {
      setIsCoverLoading(true);
      setCoverError(false);
      try {
        const covers = await getEventCovers(event.id);
        if (!cancelled) {
          if (Array.isArray(covers) && covers.length > 0) {
            setCoverUrl(covers[0].url);
          } else {
            setCoverUrl(null);
          }
        }
      } catch (err) {
        toast.error("Failed to fetch cover image. Please try again later.");
        if (!cancelled) {
          setCoverError(true);
          setCoverUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsCoverLoading(false);
        }
      }
    };
    fetchCover();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  const placeholder = "/fallback-cover.jpg";

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/20 h-full flex flex-col backdrop-blur-lg animate-fade-in">
      {/* Clickable area for navigation */}
      <Link to={`/events/${event.id}`} className="block flex-1">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          <div className="absolute z-10 top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm ${
                event.isPublished
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30"
                  : "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-500/30"
              }`}
            >
              {event.isPublished ? "Published" : "Unpublished"}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {isCoverLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : coverUrl && !coverError ? (
              <img
                src={coverUrl}
                alt={`Cover for ${event.title}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  setCoverError(true);
                  (e.currentTarget as HTMLImageElement).src = placeholder;
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-slate-400 text-sm">No cover image</span>
              </div>
            )}
          </div>
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {event.title}
          </h3>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            {truncateDescription(event.description)}
          </p>
        </div>
      </Link>
      
      {/* Action Icons */}
      <div className="flex justify-end space-x-1 mt-auto px-6 pb-6">
        <button
          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 hover:scale-110 border border-slate-600/30"
          title="Upload"
          onClick={(e) => e.stopPropagation()}
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 hover:scale-110 border border-slate-600/30"
          title="Share"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-200 hover:scale-110 border border-slate-600/30"
          title="Settings"
          onClick={(e) => e.stopPropagation()}
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200 hover:scale-110 border border-slate-600/30 hover:border-red-500/50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;