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
          `http://localhost:3000/s3/media/event/${eventToDelete}`,
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 ">My Events</h1>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          </div>

          {/* Create Event Button */}
          <button
            onClick={() => navigate("/create-event")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 "
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 border-b border-gray-200">
          {(["All", "Published", "Unpublished"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 font-medium transition-colors  ${
                activeFilter === filter
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md p-5">
        {loading && <LoadingSpinner message="Fetching events…" />}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <NoEventsIllustration />
            <h3 className="text-lg font-semibold text-slate-800 mb-2 ">
              You don't have any events
            </h3>
            <button
              onClick={() => navigate("/create-event")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors "
            >
              <div className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </div>
            </button>
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        (isDeletingEvent ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <LoadingSpinner message="Deleting event..." />
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 ">
                Delete Event
              </h3>
              <p className="text-slate-600 mb-6 ">
                Are you sure you want to delete this event? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-slate-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors "
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AdminEventsPage;
