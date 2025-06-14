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
import { Upload, Trash2, User, Sparkles } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1) Fetch portfolio JSON by name and derive userId
  useEffect(() => {
    if (!name) return;

    const fetchPortfolioData = async () => {
      try {
        const data = await getPortfolioSite(name);
        setPortfolioInfo(data);
        // assuming API returns owner userId field
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
      }
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-blue-100 to-white flex flex-col">
      <main className="flex-1">
        <section
          className={`relative h-[70vh] overflow-hidden ${
            cover ? "" : "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
          }`}
          style={heroBackgroundStyle}
        >
          <div
            className={`absolute inset-0 ${
              cover
                ? "bg-gradient-to-b from-black/40 via-black/30 to-black/50"
                : "bg-gradient-to-br from-blue-800/20 to-purple-800/20"
            }`}
          />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 text-white/20 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div
              className="absolute top-40 right-32 text-white/30 animate-pulse"
              style={{ animationDelay: '1s' }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div
              className="absolute bottom-32 left-40 text-white/20 animate-pulse"
              style={{ animationDelay: '2s' }}
            >
              <Sparkles className="w-10 h-10" />
            </div>
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
            <div className="mb-8 relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-xl animate-pulse" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              {portfolioInfo.name}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-blue-50 leading-relaxed animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 delay-300">
              {portfolioInfo.description || "Passionate about creating beautiful digital experiences"}
            </p>

          </div>
        </section>

        {/* Portfolio showcase */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-500" />
              Portfolio Showcase
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full" />
          </div>

          <Card className="border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-8">
              <PortfolioEvent id={userId} />
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer info={portfolioInfo} />
    </div>
  );
};

export default Portfolio;
