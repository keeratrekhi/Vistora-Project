import React, { useEffect, useState } from "react";
import EventsHeader from "../../components/EventsHeader";
import { getAllEvents } from "../../services/EventsService";
import ImageCard from "../../components/ImageCard";
import EventCardBody from "../../components/EventCardBody";
import { EventCardBodyProps } from "../../models/Props";
import { sampleEvents } from "../../DummyData";
import { Event } from "./../../models/Event";
import { Link } from "react-router-dom";
import axios from "axios";

// AdminEventsPage.tsx
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
      // Fallback to sample events if needed
      setEvents(sampleEvents);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Call backend to delete event folder
      await axios.delete(`http://localhost:3000/s3/media/event/${eventId}`, {
        withCredentials: true,
      });
      
      // Optimistically remove from UI
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      console.log(`Event ${eventId} deleted successfully`);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const eventCards = events.map((event, id) => (
    <EventCard 
      key={id} 
      event={event} 
      onDelete={handleDeleteEvent} // Pass delete handler
    />
  ));

  return (
    <div>
      <EventsHeader />
      <div className="bg-gray-400 h-[0.1px]"></div>
      <div className="mt-7 flex flex-wrap justify-start gap-5 items-center">
        {eventCards}
      </div>
    </div>
  );
};

export default AdminEventsPage;




// EventCard component in AdminEventsPage.tsx
interface EventCardProps {
  event: Event;
  onDelete: (eventId: string) => void; // Add onDelete prop
}
const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDelete
}) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  return (
    <Link 
      id={event.id} 
      to={`/events/${event.id}`} 
      className="flex-1 block h-full"
      onClick={(e) => {
        // Handle prevention here if needed
      }}
    >
      <div className="h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <ImageCard
            imageURL={event.coverImageUrl}
            title={event.title}
            description={event.description}
            body={<EventCardBody onDelete={handleDelete} />}
          />
        </div>
      </div>
    </Link>
  );
};