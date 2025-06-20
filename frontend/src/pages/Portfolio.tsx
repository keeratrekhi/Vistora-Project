import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/portfolio/Header";
import Footer from "../components/portfolio/Footer";
import PortfolioEvent from "../components/portfolio/PortfolioEvent";
import ComingSoon from "./ComingSoon";
import { getPortfolioevents, getPortfolioSite } from "@/services/DashboardService";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, User, Sparkles, Star, Heart, Zap, Camera } from "lucide-react";

const env = import.meta.env;

interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

const Portfolio: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [portfolioInfo, setPortfolioInfo] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [cover, setCover] = useState<CoverFile | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1) Fetch portfolio JSON by name and derive userId
  useEffect(() => {
    if (!name) return;

    const fetchPortfolioData = async () => {
      try {
        const data = await getPortfolioSite(name);
        setPortfolioInfo(data);
        if (data.userId) setUserId(data.userId);
      } catch (err) {
        console.error("Error fetching portfolio info:", err);
      }
    };

    fetchPortfolioData();
  }, [name]);

  // 2) Fetch cover list when userId is set
  const fetchCover = async () => {
    if (!name || !userId) {
      setCover(null);
      return;
    }
    try {
      const res = await fetch(
        `${env.VITE_PUBLIC_EVENTS_URL}/portfoliocover/${encodeURIComponent(name)}?userId=${encodeURIComponent(userId)}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const covers: CoverFile[] = json.covers;
      setCover(covers.length > 0 ? covers[0] : null);
    } catch (err) {
      console.error("Error fetching cover:", err);
      setCover(null);
    }
  };

  useEffect(() => {
    fetchCover();
  }, [name, userId]);

  // 3) Upload handler
  const handleUploadCover = async () => {
    if (!fileInputRef.current?.files?.[0] || !name || !userId) return;
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch(
        `${env.VITE_PUBLIC_EVENTS_URL}/s3/uploadportfoliocover/${encodeURIComponent(name)}?userId=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Upload failed (${res.status})`);
      }
      await fetchCover();
      fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload cover: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 4) Delete handler
  const handleDeleteCover = async () => {
    if (!cover || !name || !userId) return;
    if (!window.confirm("Are you sure you want to delete the cover image?")) return;

    try {
      const res = await fetch(
        `${env.VITE_PUBLIC_EVENTS_URL}/s3/portfoliocover/${encodeURIComponent(name)}/${encodeURIComponent(
          cover.name
        )}?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Delete failed (${res.status})`);
      }
      setCover(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Failed to delete cover: " + err.message);
    }
  };

  // Handle explore button click
  const handleExploreClick = () => {
    const portfolioSection = document.getElementById('portfolio-showcase');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 5) If portfolio doesn't exist yet, show ComingSoon
  if (!portfolioInfo?.name) {
    return <ComingSoon />;
  }

  // 6) Determine hero background style
  const heroBackgroundStyle: React.CSSProperties = cover
    ? {
        backgroundImage: `url(${cover.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: `translateY(${scrollY * 0.5}px)`,
      }
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-32 w-24 h-24 bg-pink-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-yellow-500/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <section
          className={`relative h-screen overflow-hidden ${
            cover ? "" : "bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900"
          }`}
          style={heroBackgroundStyle}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 ${
              cover
                ? "bg-gradient-to-b from-black/60 via-black/40 to-black/70"
                : "bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-slate-900/50"
            }`}
          />

          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 text-white/30 animate-pulse">
              <Sparkles className="w-8 h-8 animate-spin-slow" />
            </div>
            <div
              className="absolute top-40 right-32 text-purple-300/40 animate-pulse"
              style={{ animationDelay: '1s' }}
            >
              <Star className="w-6 h-6 animate-spin-slow" />
            </div>
            <div
              className="absolute bottom-32 left-40 text-pink-300/30 animate-pulse"
              style={{ animationDelay: '2s' }}
            >
              <Heart className="w-10 h-10 animate-bounce" />
            </div>
            <div
              className="absolute top-1/2 right-20 text-cyan-300/40 animate-pulse"
              style={{ animationDelay: '3s' }}
            >
              <Zap className="w-7 h-7 animate-spin-slow" />
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
            {/* Avatar with glow effect */}
            <div className="mb-12 relative animate-fade-in">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-cyan-500/30 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-2xl relative overflow-hidden group hover:scale-110 transition-all duration-500">
                <User className="w-16 h-16 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-cyan-400/20 blur-xl animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/40 via-pink-400/40 to-cyan-400/40 blur-2xl animate-pulse scale-150" />
            </div>

            {/* Title with enhanced typography */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-slide-in-left">
              {portfolioInfo.studioName}
            </h1>

            {/* Subtitle with staggered animation */}
            <p className="text-xl md:text-3xl max-w-4xl text-slate-200 leading-relaxed mb-12 animate-slide-in-right" style={{animationDelay: '0.3s'}}>
              {portfolioInfo.description || "Passionate about creating beautiful digital experiences"}
            </p>

            {/* Call to action button */}
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <button 
                onClick={handleExploreClick}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Explore My Work
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              </button>
            </div>

            {/* Floating scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio showcase section */}
        <section id="portfolio-showcase" className="py-32 relative z-20 bg-gradient-to-b from-slate-900/95 to-black/95 flex-1">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-20 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl mb-8 animate-float">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                Portfolio Showcase
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mx-auto rounded-full animate-gradient-x" />
              <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
                Discover the creative journey through my latest projects and achievements
              </p>
            </div>

            {/* Portfolio content card */}
            <Card className="bg-gradient-to-br from-slate-900 via-black to-slate-800 backdrop-blur-xl border border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 animate-slide-in-left" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-12 relative overflow-hidden">
                {/* Card background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />
                
                <div className="relative z-10 ">
                  <PortfolioEvent id={userId} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer info={portfolioInfo} />
    </div>
  );
};

export default Portfolio;