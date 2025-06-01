// src/pages/EventGalleryPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent } from "@/services/EventsService";
import MediaGallery from "@/components/MediaGallery";
// import LoadingSpinner from "@/components/LoadingSpinner";
import PinModal from "@/components/PinModal";
import { Event } from "@/models/Event";

const EventGalleryPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const eventData = await getEvent(eventId);
        if (!eventData) {
          navigate("/404");
          return;
        }
        setEvent(eventData);
        
        // Skip PIN if not required
        if (!eventData.pin) {
          setPinVerified(true);
        } else {
          setShowPinModal(true);
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEventData();
  }, [eventId, navigate]);

  const handlePinSubmit = (enteredPin: string) => {
    if (event?.pin.toString() === enteredPin) {
      setPinVerified(true);
      setShowPinModal(false);
    } else {
      alert("Incorrect PIN. Please try again.");
    }
  };

//   if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PIN Modal */}
      {showPinModal && (
        <PinModal
          isOpen={showPinModal}
          onSubmit={handlePinSubmit}
          onClose={() => navigate("/")}
        />
      )}
      
      {/* Gallery Content */}
      {pinVerified && event && (
        <div>
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="mt-1 text-gray-500">
                {event.location} • {event.eventDate.toString()}
              </p>
            </div>
          </header>

          {/* Media Gallery */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <MediaGallery
                eventId={eventId!}
                mode="public"
                showDownload={true}
              />
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default EventGalleryPage;