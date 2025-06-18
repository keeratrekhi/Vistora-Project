import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicEvent } from "@/services/EventsService";
import MediaGallery from "@/components/MediaGallery";
import PinModal from "@/components/PinModal";
import { Event } from "@/models/Event";
import axios from "axios";
import { AccessType } from "@/enums/AccessType";
import { Calendar, MapPin, Camera, ArrowLeft, Sparkles, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const env=import.meta.env;

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
          `${env.VITE_BACKEND_URL}/api/events/eventscover/${eventId}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {pinVerified && event && (
        <>
          {/* Hero Header */}
          <header
            className="relative w-full bg-cover bg-center overflow-hidden"
            style={{
              height: "85vh",
              transform: `scaleY(${scaleY})`,
              transformOrigin: "center top",
              transition: "transform 0.1s ease-out",
              backgroundImage: coverImageUrl
                ? `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%), url(${coverImageUrl})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            }}
          >
            {/* Animated Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-pink-900/40 animate-gradient-x"></div>
            
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-pink-400/25 to-purple-400/25 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
              
              {/* Sparkle Effects */}
              <div className="absolute top-32 left-1/3 text-white/30 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute top-64 right-1/3 text-white/20 animate-pulse" style={{animationDelay: '1.5s'}}>
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="absolute bottom-40 right-1/4 text-white/25 animate-pulse" style={{animationDelay: '3s'}}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            
            {/* Back Button */}
            <div className="absolute top-8 left-8 z-20">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            {/* Content */}
            <div 
              className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6"
              style={{ opacity }}
            >
              <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Event Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-sm font-medium">
                  <Camera className="w-4 h-4" />
                  Event Gallery
                </div>
                             
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent leading-tight animate-slide-in-left">
                  {event.title}
                </h1>
                
                {event.description && (
                  <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed animate-slide-in-right">
                    {event.description}
                  </p>
                )}

                {/* Event Info Cards */}
                <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  {event.location && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm">
                      <MapPin className="w-4 h-4 text-pink-300" />
                      {event.location}
                    </div>
                  )}
                </div>
          
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.7s'}}>
                  Discover and download beautiful moments captured during this special event
                </p>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm">
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </header>

          {/* Gallery Section */}
          <main className="relative -mt-24 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Gallery Header Card */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-3xl shadow-2xl shadow-purple-900/20 border border-slate-200/50 p-8 md:p-12 mb-12 backdrop-blur-sm">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-3 text-sm font-medium mb-6">
                    <Heart className="w-4 h-4" />
                    Captured Memories
                  </div>
                  
                  {/* <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-6">
                    Event Gallery
                  </h2> */}
                  
                  <div className="w-32 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mx-auto rounded-full mb-6"></div>
                  
                  <p className="text-white text-lg max-w-2xl mx-auto leading-relaxed">
                    Browse through all the amazing photos and videos from this event. Click on any image to view it in full size, or download your favorites.
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="text-center p-6 bg-gradient-to-tr from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">High Quality</h3>
                    <p className="text-sm text-white">Professional photos & videos</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-tr from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Free Download</h3>
                    <p className="text-sm text-white">Download all your favorites</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-tr from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-pink-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Memories</h3>
                    <p className="text-sm text-white">Relive the special moments</p>
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="rounded-2xl p-6 ">
                  <MediaGallery eventId={eventId!} mode="public" showDownload />
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900 text-white py-16 mt-20 border-t border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Event Gallery
                </span>
              </div>
              
              <p className="text-slate-300 mb-6 text-lg max-w-2xl mx-auto leading-relaxed">
                Thank you for being part of this special event. Share these memories with your friends and family.
              </p>
              
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full mb-6"></div>
              
              <div className="text-sm text-slate-400">
                © 2024 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">Event Gallery</span>. All rights reserved.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default EventGalleryPage;