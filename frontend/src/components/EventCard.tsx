import { Event } from "@/models/Event";
import { getEventCovers } from "@/services/EventsService";
import axios from "axios";
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

  // 1) Fetch cover URL on mount
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

  // Placeholder used if cover fails or is missing
  const placeholder = "/fallback-cover.jpg";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:scale-105 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      {/* Clickable area for navigation */}
      <Link to={`/events/${event.id}`} className="block flex-1">
        {/* Cover Image */}
        <div className="relative h-48 bg-gray-100">
          <div className="absolute z-10 top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium  ${
                event.isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {event.isPublished ? "Published" : "Unpublished"}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {isCoverLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            ) : coverUrl && !coverError ? (
              <img
                src={coverUrl}
                alt={`Cover for ${event.title}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  setCoverError(true);
                  (e.currentTarget as HTMLImageElement).src = placeholder;
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">No cover image</span>
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-2 ">
            {event.title}
          </h3>
          <p className="text-sm text-slate-600 mb-2 ">
            {truncateDescription(event.description)}
          </p>
        </div>
      </Link>
      {/* Action Icons (not inside Link) */}
      <div className="flex justify-end space-x-2 mt-auto px-4 pb-4">
        <button
          className="p-2 hover:text-blue-600 transition-colors"
          title="Upload"
          onClick={(e) => e.stopPropagation()}
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-blue-600 transition-colors"
          title="Share"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-blue-600 transition-colors"
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
          className="p-2 hover:text-red-600 transition-colors z-10"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
