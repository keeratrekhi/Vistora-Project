import axios from "axios";
import { Download } from "lucide-react";

interface ImageCardProps {
  imageUrl: string
  className?: string;
}

export const DownloadableImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  className = "",
}) => {
  const handleDownload = async () => {
    try {
      //call backend api to download the original image
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <img
        src={imageUrl}
        alt="Event"
        className="w-full h-auto rounded-lg shadow-lg"
      />
      <button
        onClick={handleDownload}
        className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Download Image"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
};
