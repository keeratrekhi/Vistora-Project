import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "../../components/CircularProgress";
import {
  BriefcaseBusiness,
  Copy,
  Download,
  ExternalLink,
  ServerCrash,
} from "lucide-react";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PORTFOLIO_INFO_ROUTE } from "@/constants/RouteContant";
import {
  getPortfolioURL,
  getUserStorageInfo,
} from "@/services/DashboardService";
import { UserStorageDto } from "@/models/User";
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

  const formatBytes = (bytes: string): string => {
    const num = Number(bytes);
    if (num === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = num;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Fetch portfolio data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        setIsPortfolioURLFetching(true);

        const portfolioUrl = await getPortfolioURL(currentUser.id);
        setPortfolioURL(portfolioUrl as string);
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

  const getAvailableStorage = () => {
    if (!storageData || Number(storageData.storageLimit) === 0) return "0 B";
    const used = Number(storageData.storageUsed);
    const total = Number(storageData.storageLimit);
    const available = total - used;
    return formatBytes(available.toString());
  };

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
      alert("Failed to convert QR code to image.");
    };

    img.src = url;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portfolioURL || "");
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2 ">
          Welcome back, {currentUser.username}
        </h1>
        <p className="text-slate-600 ">
          For assistance contact us at:
          <br />
          Phone: +91 9723394996
          <br />
          Email: Vistora.help@gmail.com
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Card */}
        {storageLoading ? (
          <LoadingSpinner message="Fetching Storage Usage" />
        ) : storageData?.storageLimit && storageData?.storageUsed ? (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 ">
              Storage Info
            </h2>

            <div className="flex flex-col items-center space-y-4">
              <CircularProgress percentage={getPercentage()} />

              <div className="text-center space-y-2">
                <div className="flex justify-between items-center w-full max-w-xs">
                  <span className="text-slate-600">Used Storage:</span>
                  <span className="font-semibold text-slate-800">
                    {formatBytes(storageData?.storageUsed)}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full max-w-xs">
                  <span className="text-slate-600 ">Available Storage:</span>
                  <span className="font-semibold text-slate-800">
                    {getAvailableStorage()}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full max-w-xs border-t pt-2">
                  <span className="text-slate-600">Total Storage:</span>
                  <span className="font-semibold text-slate-800">
                    {formatBytes(storageData?.storageLimit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-50 flex flex-col items-center justify-center py-8 bg-gray-100 rounded-lg border border-gray-200">
            <div className="text-lg flex gap-2 font-semibold text-slate-800 mb-4">
              <ServerCrash />
              Unable to fetch storage data.
            </div>
          </div>
        )}

        {/* QR Code Card */}
        {isPortfolioURLFetching ? (
          <LoadingSpinner message="Loading QR Code" />
        ) : portfolioURL ? (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Portfolio QR Code
            </h2>

            <div className="flex flex-col items-center space-y-4">
              {/* QR Code Placeholder */}
              <div
                ref={qrContainerRef}
                className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>

              {/* Portfolio URL */}
              <div className="w-full">
                <p className="text-sm text-slate-600 mb-2 ">Portfolio URL:</p>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-slate-800 flex-1  font-mono">
                    {portfolioURL}
                  </span>
                  <button
                    onClick={handleOpenPortfolio}
                    className="p-1 hover:text-blue-600 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1 hover:text-blue-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-50 flex flex-col items-center justify-center py-8 bg-gray-100 rounded-lg border border-gray-200">
            <div className="text-lg flex gap-2 font-semibold text-slate-800 mb-4">
              <BriefcaseBusiness />
              Create your own portfolio website.
            </div>
            <button
              onClick={handleCreatePortfolio}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
            >
              Create Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
