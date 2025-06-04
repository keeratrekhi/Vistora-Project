import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";

interface EventCoverImageProps {
  eventId: string;
  currentCoverUrl: string | null;                   
  onCoverImageChanged: (newUrl: string | null) => void; 
}

const EventCoverImage: React.FC<EventCoverImageProps> = ({
  eventId,
  currentCoverUrl,
  onCoverImageChanged,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);


  useEffect(() => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    axios
      .get<{
        covers: Array<{ url: string; name: string; type: string; size: number }>;
      }>(`http://localhost:3000/s3/eventscover/${eventId}`, {
        withCredentials: true,
      })
      .then((res) => {
        const covers = res.data.covers;
        if (Array.isArray(covers) && covers.length > 0) {
          setFetchedUrl(covers[0].url);
        } else {
          setFetchedUrl(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load existing cover:", err);
        setError(
          err.response?.data?.error || err.message || "Could not fetch cover"
        );
        setFetchedUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [eventId]);

  

  const displayedUrl =
    previewUrl || currentCoverUrl || fetchedUrl || "/fallback-cover.jpg";

  
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !eventId) return;
      setIsLoading(true);
      setError(null);

      // Local preview immediately
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);

      try {
        // --- DELETE previous cover if it exists ---
        const prevUrl = fetchedUrl || currentCoverUrl;
        if (prevUrl) {
          const prevFileName = decodeURIComponent(prevUrl.split("/").pop()!);
          try {
            await axios.delete(
              `http://localhost:3000/s3/mediacover/${eventId}/${prevFileName}`,
              { withCredentials: true }
            );
            console.log(`Deleted previous cover: ${prevFileName}`);
            // Clear local state so UI switches immediately if desired
            setFetchedUrl(null);
          } catch (delErr) {
            console.warn("Failed to delete previous cover:", delErr);
          }
        }

        // --- UPLOAD the new cover ---
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await axios.post<{
          cover: { url: string; name: string; type: string; size: number };
        }>(
          `http://localhost:3000/s3/uploadcover/${eventId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        // The controller returns { cover: { url, name, type, size } }
        const newCover = uploadRes.data.cover;
        setFetchedUrl(newCover.url);           // update local “fetched” state
        onCoverImageChanged(newCover.url);      // inform parent exactly once
        setPreviewUrl(null);                    // clear the temporary preview
      } catch (err: any) {
        console.error("Error uploading cover:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to upload new cover"
        );
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
        if (e.target) e.target.value = "";
      }
    },
    [eventId, fetchedUrl, currentCoverUrl, onCoverImageChanged]
  );

  return (
    <div className="relative group w-full">
      <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={displayedUrl}
          alt="Event cover"
          className="w-full h-full object-cover"
        />
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white">Loading…</div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center p-1 text-sm rounded-b-lg">
          {error}
        </div>
      )}

      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
        <div className="text-white flex items-center gap-2">
          <FiEdit2 size={20} />
          <span>Change Cover</span>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default EventCoverImage;
