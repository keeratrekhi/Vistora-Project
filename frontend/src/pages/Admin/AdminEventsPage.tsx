

import React, { useEffect, useState } from "react";
import EventsHeader from "../../components/EventsHeader";
import { getAllEvents } from "../../services/EventsService";
import { sampleEvents } from "../../DummyData";
import { Event } from "../../models/Event";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error occurred while fetching events:", error);
      setEvents(sampleEvents);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Delete entire event folder (media + cover)
      await axios.delete(`http://localhost:3000/s3/media/event/${eventId}`, {
        withCredentials: true,
      });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      console.log(`Event ${eventId} deleted successfully`);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  return (
    <div>
      <EventsHeader />
      <div className="bg-gray-400 h-[0.1px]" />
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
        ))}
      </div>
    </div>
  );
};

export default AdminEventsPage;



interface EventCardProps {
  event: Event;
  onDelete: (eventId: string) => void;
}

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
        const res = await axios.get<{
          covers: Array<{ url: string; name: string; type: string; size: number }>;
        }>(`http://localhost:3000/s3/eventscover/${event.id}`, {
          withCredentials: true,
        });
        if (!cancelled) {
          const covers = res.data.covers;
          if (Array.isArray(covers) && covers.length > 0) {
            setCoverUrl(covers[0].url);
          } else {
            setCoverUrl(null);
          }
        }
      } catch (err) {
        console.error("Failed to load cover:", err);
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

  // 2) Delete handler (prevent Link navigation)
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete(event.id);
    }
  };

  // Placeholder used if cover fails or is missing
  const placeholder = "/fallback-cover.jpg";

  return (
    <div className="relative h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
        aria-label="Delete event"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <Link to={`/events/${event.id}`} className="block h-full">
        {/* Cover Image */}
        <div className="h-48 w-full overflow-hidden rounded-lg mb-4 bg-gray-100">
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
            <div className="h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">No cover image</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="px-4 pb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
          <p className="text-gray-600 line-clamp-2">{event.description}</p>
        </div>
      </Link>
    </div>
  );
};
