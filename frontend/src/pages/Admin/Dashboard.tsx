import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  Copy,
  Download,
  ExternalLink,
  ServerCrash,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import { PORTFOLIO_INFO_ROUTE } from "@/constants/RouteContant";
import {
  getPortfolioURL,
  getUserStorageInfo,
} from "@/services/DashboardService";
import { UserStorageDto } from "@/models/User";
import StorageCard from "@/components/StorageCard";
import LoadingCard from "@/components/LoadingCard";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: {
          id: string;
          username: string;
        };
      };
    }) => state.user
  );

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const [portfolioURL, setPortfolioURL] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<UserStorageDto | null>(null);

  const [isPortfolioURLFetching, setIsPortfolioURLFetching] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);

  // Fetch portfolio data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
         setIsPortfolioURLFetching(true);
        const slug = await getPortfolioURL(currentUser.id);
        setPortfolioURL(`${window.location.origin}/portfolio/${slug}`);
        
      } catch (error) {
        toast.error("Error fetching portfolio URL. Please try again later.");
      } finally {
        setIsPortfolioURLFetching(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Fetch storage data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        setStorageLoading(true);

        const userStorage = await getUserStorageInfo(currentUser.id);
        setStorageData(userStorage);
      } catch (error) {
        toast.error("Error fetching storage data. Please try again later.");
      } finally {
        setStorageLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getPercentage = () => {
    if (!storageData || Number(storageData.storageLimit) === 0) return 0;

    const used = Number(storageData.storageUsed);
    const total = Number(storageData.storageLimit);
    return Math.round((used / total) * 100);
  };

  useEffect(() => {
    if (currentUser && username !== currentUser.username) {
      navigate(`/dashboard/${currentUser.username}`, { replace: true });
    }
  }, [username, currentUser, navigate]);

  //QR code download
  const handleDownloadQRCode = () => {
    if (!qrContainerRef.current) return;

    const svgElement = qrContainerRef.current.querySelector("svg");
    if (!svgElement) return;

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Create an image from SVG
    const img = new window.Image();
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
      // Create a canvas and draw the image
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.width.baseVal.value || 256;
      canvas.height = svgElement.height.baseVal.value || 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Download as PNG
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "portfolio-qr.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      toast.error("Failed to convert QR code to image.");
    };

    img.src = url;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portfolioURL || "");
    toast.success("Portfolio URL copied to clipboard!");
  };

  const handleOpenPortfolio = () => {
    if (portfolioURL) {
      window.open(portfolioURL, "_blank");
    }
  };

  const handleCreatePortfolio = () => {
    navigate(PORTFOLIO_INFO_ROUTE);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome back, {currentUser.username}
              </h1>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <p className="text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-semibold">Need assistance?</span> Our support team is here to help:
              <br />
              <span className="flex items-center mt-2 space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Phone: <span className="text-white font-medium">+91 9723394996</span></span>
              </span>
              <span className="flex items-center mt-1 space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Email: <span className="text-white font-medium">Vistora.help@gmail.com</span></span>
              </span>
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Storage Card */}
          {storageLoading ? (
            <LoadingCard message="Fetching Storage Usage" />
          ) : storageData?.storageLimit && storageData?.storageUsed ? (
            <StorageCard 
              usedStorage={storageData.storageUsed}
              totalStorage={storageData.storageLimit}
              percentage={getPercentage()}
            />
          ) : (
            <div className="bg-gradient-to-br from-red-900/50 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-red-500/30 animate-fade-in">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="p-4 bg-red-500/20 rounded-full">
                  <ServerCrash className="w-12 h-12 text-red-400" />
                </div>
                <div className="text-xl font-semibold text-white text-center">
                  Unable to fetch storage data
                </div>
                <div className="text-slate-400 text-center">
                  Please check your connection and try again
                </div>
              </div>
            </div>
          )}

          {/* QR Code Card */}
          {isPortfolioURLFetching ? (
            <LoadingCard message="Loading QR Code" />
          ) : portfolioURL ? (
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-fade-in hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Portfolio QR Code
                </h2>
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {/* QR Code */}
                <div
                  ref={qrContainerRef}
                  className="p-4 bg-white rounded-xl shadow-lg"
                >
                  <QRCode
                    size={128}
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    value={portfolioURL}
                    viewBox={`0 0 256 256`}
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadQRCode}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR</span>
                </button>

                {/* Portfolio URL */}
                <div className="w-full">
                  <p className="text-sm text-slate-400 mb-3 font-medium">Portfolio URL:</p>
                  <div className="flex items-center space-x-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <span className="text-sm text-slate-200 flex-1 font-mono break-all">
                      {portfolioURL}
                    </span>
                    <button
                      onClick={handleOpenPortfolio}
                      className="p-2 hover:text-cyan-400 transition-colors bg-slate-700/50 rounded-lg hover:bg-slate-600/50"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      className="p-2 hover:text-cyan-400 transition-colors bg-slate-700/50 rounded-lg hover:bg-slate-600/50"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-fade-in">
              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                  <BriefcaseBusiness className="w-16 h-16 text-purple-400" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-white">
                    Create Your Portfolio
                  </div>
                  <div className="text-slate-400">
                    Build a stunning portfolio website to showcase your work
                  </div>
                </div>
                <button
                  onClick={handleCreatePortfolio}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25 hover:scale-105 flex items-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Create Portfolio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;