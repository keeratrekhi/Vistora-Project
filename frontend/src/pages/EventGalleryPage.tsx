import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicEvent } from "@/services/EventsService";
import MediaGallery from "@/components/MediaGallery";
import PinModal from "@/components/PinModal";
import { Event } from "@/models/Event";
import axios from "axios";
import { AccessType } from "@/enums/AccessType";
import { Calendar, MapPin, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventGalleryPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch event and cover
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicEvent(eventId);
        if (!data) return navigate("/404");
        setEvent(data);
        data.accessType === AccessType.Public
          ? setPinVerified(true)
          : setShowPinModal(true);
        const res = await axios.get<{ covers: { url: string }[] }>(
          `http://localhost:3000/api/events/eventscover/${eventId}`,
          { withCredentials: true }
        );
        setCoverImageUrl(res.data.covers[0]?.url || data.coverImageUrl || null);
      } catch {
        navigate("/error");
      }
    };
    load();
  }, [eventId, navigate]);

  if (showPinModal && event) {
    return (
      <PinModal
        isOpen
        onSubmit={(pin) => {
          if (event.pin.toString() === pin) setPinVerified(true);
          else alert("Incorrect PIN");
          setShowPinModal(false);
        }}
        onClose={() => navigate("/")}
      />
    );
  }

  // Enhanced parallax effect with smoother scaling
  const scaleY = scrollY > 0
    ? Math.max(0.85, 1 - scrollY / 1500)
    : Math.min(1.15, 1 - scrollY / 800);

  const opacity = Math.max(0.3, 1 - scrollY / 400);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {pinVerified && event && (
        <>
          {/* Hero Header */}
          <header
            className="relative w-full bg-cover bg-center overflow-hidden"
            style={{
              height: "80vh",
              transform: `scaleY(${scaleY})`,
              transformOrigin: "center top",
              transition: "transform 0.1s ease-out",
              backgroundImage: coverImageUrl
                ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${coverImageUrl})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
            
            {/* Floating Geometric Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400/20 rounded-full blur-lg animate-pulse delay-700"></div>
            
            {/* Content */}
            <div 
              className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6"
              style={{ opacity }}
            >
              <div className="max-w-4xl mx-auto space-y-6">             
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent leading-tight">
                  {event.title}
                </h1>
                
          
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Discover and download beautiful moments captured during this special event
                </p>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </header>

          {/* Gallery Section */}
          <main className="relative -mt-20 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Gallery Header Card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 p-8 md:p-12 mb-12 backdrop-blur-sm">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Event Memories
                  </h2>
                </div>


                {/* Media Gallery */}
                <div className="mt-8">
                  <MediaGallery eventId={eventId!} mode="public" showDownload />
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Camera className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-semibold">Event Gallery</span>
              </div>
              <p className="text-slate-400 mb-4">
                Thank you for being part of this special event. Share these memories with your friends and family.
              </p>
              <div className="text-sm text-slate-500">
                © 2024 Event Gallery. All rights reserved.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default EventGalleryPage;