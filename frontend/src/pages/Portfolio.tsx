import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/portfolio/Header";
import Footer from "../components/portfolio/Footer";
import PortfolioEvent from "../components/portfolio/PortfolioEvent";
import ComingSoon from "./ComingSoon";
import { getPortfolioSite } from "@/services/DashboardService";
import { useSelector } from "react-redux";

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

    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolioSite(name);
        setPortfolioInfo(data);
      } catch (err) {
        console.error("Error fetching portfolio info:", err);
      }
    };

    fetchPortfolio();
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

  // 5) If portfolio doesn’t exist yet (or name is missing), show ComingSoon
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header info={portfolioInfo} />

      <main className="flex-1">
        <section
          className={`relative h-[60vh] ${cover ? "" : "bg-gradient-to-r from-blue-500 to-purple-600"}`}
          style={heroBackgroundStyle}
        >
          <div className={cover ? "absolute inset-0 bg-black opacity-40" : "absolute inset-0 bg-black opacity-50"} />
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {portfolioInfo.name}
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl">
              {portfolioInfo.description || "Passionate about digital experiences"}
            </p>

            {/* Only show upload/delete if the logged‐in user “owns” this portfolio */}
            {currentUser.id === userId && (
              <div className="mt-6 flex space-x-4">
                <label className="inline-flex items-center px-4 py-2 bg-white bg-opacity-25 hover:bg-opacity-40 rounded-md cursor-pointer">
                  <span>Upload Cover</span>
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
                  <button
                    onClick={handleDeleteCover}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete Cover
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioEvent />
        </section>
      </main>

      <Footer info={portfolioInfo} />
    </div>
  );
};

export default Portfolio;
