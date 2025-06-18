import React, { useEffect, useState } from "react";
import { getAllEvents } from "../../services/EventsService";
import { Event } from "../../models/Event";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EventCard from "@/components/EventCard";
import NoEventsIllustration from "@/assets/illustrations/NoEventsIllustration";
import toast from "react-hot-toast";


const env=import.meta.env;

const AdminEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletingEvent, setIsDeletingEvent] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Published" | "Unpublished"
  >("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      toast.error("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Published" && event.isPublished) ||
      (activeFilter === "Unpublished" && !event.isPublished);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (eventToDelete) {
        setIsDeletingEvent(true);
        // Delete entire event folder (media + cover)
        await axios.delete(
          `${env.VITE_BACKEND_URL}/s3/media/event/${eventToDelete}`,
          {
            withCredentials: true,
          }
        );
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete));
        toast.success('Event Deleted');
      }
    } catch (error) {
      toast.error("Failed to delete event. Please try again later.");
    } finally {
      setIsDeletingEvent(false);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl border border-slate-700/50 p-6 backdrop-blur-lg animate-slide-in-left">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            My Events
          </h1>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm shadow-lg"
            />
            <Search className="absolute right-4 top-3.5 w-5 h-5 text-cyan-400" />
          </div>

          {/* Create Event Button */}
          <button
            onClick={() => navigate("/create-event")}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Event</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 border-b border-slate-700/50">
          {(["All", "Published", "Unpublished"] as const).map((filter, index) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 font-medium transition-all duration-300 rounded-t-lg animate-fade-in ${
                activeFilter === filter
                  ? "text-cyan-400 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-b-2 border-cyan-400 shadow-lg"
                  : "text-slate-300 hover:text-cyan-300 hover:bg-slate-700/30"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl border border-slate-700/50 p-6 backdrop-blur-lg animate-slide-in-right">
        {loading && (
          <div className="animate-fade-in">
            <LoadingSpinner message="Fetching events…" />
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="animate-float">
              <NoEventsIllustration />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              You don't have any events
            </h3>
            <p className="text-slate-300 mb-6">
              Create your first event to get started with managing your portfolio
            </p>
            <button
              onClick={() => navigate("/create-event")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Your First Event</span>
              </div>
            </button>
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-fade-in transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <EventCard
                  event={event}
                  onDelete={handleDeleteEvent}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        (isDeletingEvent ? (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50 shadow-2xl animate-scale-in">
              <LoadingSpinner message="Deleting event..." />
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50 shadow-2xl animate-scale-in">
              <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
                Delete Event
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Are you sure you want to delete this event? This action cannot
                be undone and will permanently remove all associated data.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AdminEventsPage;