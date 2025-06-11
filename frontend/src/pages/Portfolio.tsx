import React, { useEffect, useState, useRef, useId } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/portfolio/Header";
import Footer from "../components/portfolio/Footer";
import PortfolioEvent from "../components/portfolio/PortfolioEvent";
import ComingSoon from "./ComingSoon";
import { getPortfolioevents, getPortfolioSite } from "@/services/DashboardService";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Camera, Sparkles, User } from "lucide-react";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

const Portfolio: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const query = useQuery();
  const userId = query.get("userId") || "";
  const navigate = useNavigate();

  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: { id: string };
      };
    }) => state.user
  );

  const [portfolioInfo, setPortfolioInfo] = useState<any>(null);
  const [cover, setCover] = useState<CoverFile | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1) Fetch portfolio JSON by name
  useEffect(() => {
    if (!name) return;

    const fetchPortfolioData = async () => {
      try {
        const data = await getPortfolioSite(name);
        setPortfolioInfo(data);
      } catch (err) {
        console.error("Error fetching portfolio info:", err);
      }
    };

    fetchPortfolioData();
  }, [name]);

  // 2) Fetch cover list (just take the first if exists)
  const fetchCover = async () => {
    if (!name || !userId) {
      setCover(null);
      return;
    }
    try {
       const res = await fetch(
    `http://localhost:3000/s3/portfoliocover/${encodeURIComponent(name)}?userId=${encodeURIComponent(userId)}`,
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
  formData.append("file", file); // Changed from "coverImage" to "file"

  try {
    setUploading(true);
const res = await fetch(
   `http://localhost:3000/s3/uploadportfoliocover/${encodeURIComponent(name)}?userId=${encodeURIComponent(userId)}`,
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
    `http://localhost:3000/s3/portfoliocover/${encodeURIComponent(name)}/${encodeURIComponent(cover.name)}?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE",
          credentials:"include"
         }
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

  // 5) If portfolio doesn't exist yet (or name is missing), show ComingSoon
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
    : {}; // fallback to gradient via Tailwind classes

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-blue-100 to-white flex flex-col">
      {/* <Header info={portfolioInfo} /> */}

      <main className="flex-1">
        <section
          className={`relative h-[70vh] overflow-hidden ${cover ? "" : "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"}`}
          style={heroBackgroundStyle}
        >
          {/* Animated gradient overlay */}
          <div className={`absolute inset-0 ${cover ? "bg-gradient-to-b from-black/40 via-black/30 to-black/50" : "bg-gradient-to-br from-blue-800/20 to-purple-800/20"}`} />
          
          {/* Floating sparkles animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 text-white/20 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="absolute top-40 right-32 text-white/30 animate-pulse" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-32 left-40 text-white/20 animate-pulse" style={{ animationDelay: '2s' }}>
              <Sparkles className="w-10 h-10" />
            </div>
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
            {/* Profile icon with glow effect */}
            <div className="mb-8 relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-xl animate-pulse"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              {portfolioInfo.name}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-blue-50 leading-relaxed animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 delay-300">
              {portfolioInfo.description || "Passionate about creating beautiful digital experiences"}
            </p>

            {/* Enhanced upload/delete controls for owner */}
            {currentUser.id === userId && (
              <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-500">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="group cursor-pointer">
                      <Button
                        className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                        variant="outline"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                            Upload Cover
                          </>
                        )}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={() => {
                          if (fileInputRef.current?.files?.[0]) {
                            handleUploadCover();
                          }
                        }}
                        disabled={uploading}
                      />
                    </label>

                    {cover && (
                      <Button
                        onClick={handleDeleteCover}
                        className="bg-red-500/80 hover:bg-red-600/90 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                        disabled={uploading}
                      >
                        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Delete Cover
                      </Button>
                    )}
                  </div>
                  
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Enhanced content section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-500" />
              Portfolio Showcase
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <Card className="border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-8">
              <PortfolioEvent id={userId}/>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer info={portfolioInfo} />
    </div>
  );
};

export default Portfolio;