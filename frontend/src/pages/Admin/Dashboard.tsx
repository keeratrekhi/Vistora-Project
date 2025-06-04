import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import CircularProgress from "../../components/CircularProgress";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";

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
  
  // Add portfolio state with proper type
  const [portfolio, setPortfolio] = useState<{
    id: string;
    name: string;
    portfolioQrCode: string;
  } | null>(null);
  
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [storageData, setStorageData] = useState<{
    used: string;
    total: string;
    remaining: string;
  } | null>(null);
  
  const [storageLoading, setStorageLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        setStorageLoading(true);
        setPortfolioLoading(true);
        
        // Fetch portfolio data
        const portRes = await fetch(
          `http://localhost:3000/api/portfolio/${currentUser.id}`,
          { method: "GET", credentials: "include" }
        );
        
        if (portRes.ok) {
          const portData = await portRes.json();
          setPortfolio(portData);
        } else {
          const errorData = await portRes.json();
          console.error("Portfolio fetch error:", errorData.message);
          setPortfolio(null);
        }

        // Fetch storage data
        const storageRes = await fetch(
          `http://localhost:3000/api/user/${currentUser.id}`,
          { method: "GET", credentials: "include" }
        );
        
        if (storageRes.ok) {
          const storageData = await storageRes.json();
          setStorageData(storageData);
        } else {
          const errorData = await storageRes.json();
          console.error("Storage fetch error:", errorData.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setStorageLoading(false);
        setPortfolioLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getPercentage = () => {
    if (!storageData || Number(storageData.total) === 0) return 0;

    const used = Number(storageData.used);
    const total = Number(storageData.total);
    return Math.round((used / total) * 100);
  };

  useEffect(() => {
    if (currentUser && username !== currentUser.username) {
      navigate(`/dashboard/${currentUser.username}`, { replace: true });
    }
  }, [username, currentUser, navigate]);

  // Handle QR code download
  const handleDownloadQRCode = () => {
    if (!qrContainerRef.current) return;

    const svgElement = qrContainerRef.current.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-5">
        {/* Storage Status Card */}
        <DashboardCard
          title="STORAGE STATUS"
          subTitle={
            <div className="flex justify-start items-center gap-2 mt-2 text-gray-600">
              <div>Total Storage :</div>
              {storageData ? formatBytes(storageData.total) : "0 B"}
            </div>
          }
          cardBody={
            <div className="flex-col items-center justify-center mt-4">
              {storageLoading ? (
                <div className="flex justify-center items-center h-32">
                  Loading storage data...
                </div>
              ) : storageData ? (
                <>
                  <div className="flex justify-center items-center w-full text-l my-1 gap-2 text-gray-700">
                    <span className="mx-3 font-bold w-10 h-3 bg-green-500"></span>{" "}
                    <span className="w-35">Max Storage</span>
                  </div>
                  <div className="flex justify-center items-center w-full text-l mb-5 gap-2 text-gray-700">
                    <span className="mx-3 font-bold w-10 h-3 bg-gray-300"></span>
                    <span className="w-35">Storage Used</span>
                  </div>
                  <div className="flex justify-center items-center w-full text-l gap-2">
                    <CircularProgress percentage={getPercentage()} />
                  </div>
                  <div className="flex justify-center items-center w-full text-sm gap-1 mt-2 text-gray-700">
                    Used Storage:{" "}
                    <span className="font-medium">
                      {formatBytes(storageData.used)}
                    </span>
                  </div>
                  <div className="flex justify-center items-center w-full text-sm gap-1 text-gray-700">
                    Free Storage:{" "}
                    <span className="font-medium">
                      {formatBytes(storageData.remaining)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Storage data not available
                </div>
              )}
            </div>
          }
        />

        {/* QR Code Card */}
        <DashboardCard
          cardBody={
            <div className="flex flex-col h-full justify-between">
              {portfolio?.portfolioQrCode ? (
                <div>
                  <div
                    ref={qrContainerRef}
                    className="h-50 flex justify-center py-4 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <QRCode
                      size={128}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      value={portfolio.portfolioQrCode}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
  
                  <div className="flex justify-center items-center gap-2 mt-3">
                    <Button
                      onClick={handleDownloadQRCode}
                      variant="default"
                      className="flex items-center gap-1 border-yellow-400 bg-yellow-400 text-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-700"
                    >
                      <span>Download QR</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-50 flex justify-center py-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="text-black">
                    {portfolioLoading 
                      ? "Loading portfolio..." 
                      : "Create a Portfolio to get a QR Code"}
                  </div>
                </div>
              )}


               
              <div className="mt-5 w-full">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between border-gray-600 text-gray-600 bg-white hover:bg-gray-700 hover:text-white rounded-md text-sm"
                  onClick={() => {
                    if (portfolio?.portfolioQrCode) {
                      window.open(portfolio.portfolioQrCode, '_blank');
                    }
                  }}
                >
                  
                  <span className="w-65 overflow-hidden text-ellipsis">
                    {/* Portfolio name in the span element */}
                    {portfolioLoading 
                      ? "Loading..." 
                      : `https://site.captus.cloud/${portfolio?.name}` || "Your Portfolio"}
                  </span>
                  <ExternalLink size={15} />
                </Button>
              </div>
  
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;