// src/pages/EventGalleryPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent } from "@/services/EventsService";
import MediaGallery from "@/components/MediaGallery";
import PinModal from "@/components/PinModal";
import { Event } from "@/models/Event";
import axios from "axios"; // Added axios import

const EventGalleryPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null); // Added cover image state
  const [isLoading, setIsLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

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

        // Fetch cover image separately
        try {
          const response = await axios.get<{
            covers: Array<{ url: string; name: string; type: string; size: number }>;
          }>(`http://localhost:3000/s3/eventscover/${eventId}`, {
            withCredentials: true,
          });
          
          if (response.data.covers && response.data.covers.length > 0) {
            setCoverImageUrl(response.data.covers[0].url);
          } else if (eventData.coverImageUrl) {
            // Fallback to event data if exists
            setCoverImageUrl(eventData.coverImageUrl);
          }
        } catch (coverError) {
          console.error("Failed to fetch cover image:", coverError);
          if (eventData.coverImageUrl) {
            setCoverImageUrl(eventData.coverImageUrl);
          }
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

  // Scroll effect handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePinSubmit = (enteredPin: string) => {
    if (event?.pin.toString() === enteredPin) {
      setPinVerified(true);
      setShowPinModal(false);
    } else {
      alert("Incorrect PIN. Please try again.");
    }
  };

  // Calculate header height based on scroll position
  const getHeaderHeight = () => {
    if (!headerRef.current) return "50vh";
    
    const maxHeight = window.innerHeight * 0.7; // 70% of viewport height
    const minHeight = 150; // Minimum height in pixels
    
    // Shrink faster in the first 200px of scroll
    if (scrollY < 200) {
      return `${Math.max(minHeight, maxHeight - scrollY * 1.5)}px`;
    }
    
    // Then shrink slower
    return `${Math.max(minHeight, maxHeight - 300 - (scrollY - 200) * 0.5)}px`;
  };

  // Calculate opacity for text elements
  const getTextOpacity = () => {
    return Math.max(0, 1 - scrollY / 200);
  };

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
          {/* Cover Header with Scroll Effect */}
          <header 
            ref={headerRef}
            className="relative w-full bg-cover bg-center transition-all duration-300 overflow-hidden"
            style={{
              height: getHeaderHeight(),
              backgroundImage: coverImageUrl 
                ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${coverImageUrl})`
                : "linear-gradient(to right, #3B82F6, #8B5CF6)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed"
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 transition-transform duration-300"
                  style={{ 
                    transform: scrollY > 100 
                      ? "translateY(-20px) scale(0.9)" 
                      : "none",
                    opacity: getTextOpacity()
                  }}>
                {event.title}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl transition-all duration-300"
                 style={{ 
                   opacity: getTextOpacity(),
                   transform: scrollY > 100 ? "translateY(20px)" : "none"
                 }}>
                {event.location} • {event.eventDate.toString()}
              </p>
              
              {/* Floating scroll indicator */}
              <div className={`absolute bottom-4 transition-opacity duration-300 ${scrollY > 50 ? 'opacity-0' : 'opacity-100'}`}>
                <div className="animate-bounce w-6 h-10 rounded-full border-2 border-white flex justify-center">
                  <div className="w-1 h-2 bg-white rounded-full mt-2"></div>
                </div>
              </div>
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