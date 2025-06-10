import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface FileUploadProps {
  eventId: string;
  onUploadSuccess?: () => void;
  refreshKey: any;
}

interface StorageStatus {
  used: bigint;
  total: bigint;
}

interface UploadProgress {
  total: number;
  loaded: number;
  percentage: number;
}

const FileUploader: React.FC<FileUploadProps> = ({
  eventId,
  onUploadSuccess,
  refreshKey,
}) => {
  const [storage, setStorage] = useState<StorageStatus>({
    used: 0n,
    total: BigInt(10 * 1024 ** 3), // 10 GB default
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const totalSizeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatBytes = (bytes: bigint) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = Number(bytes);
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(2)} ${units[unit]}`;
  };

  // Fetch “used” + “total” storage for this event
  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/storage/user/storage?eventId=${eventId}`,
          { withCredentials: true }
        );
        if (
          !response.data ||
          typeof response.data.used !== "string" ||
          typeof response.data.total !== "string"
        ) {
          throw new Error("Invalid storage data format");
        }
        setStorage({
          used: BigInt(response.data.used),
          total: BigInt(response.data.total),
        });
      } catch (error) {
        console.error("Error fetching storage:", error);
        setStorage({ used: 0n, total: BigInt(10737418240) });
      }
      setSelectedFiles(null);
      setUploadStatus("");
      setUploadProgress(null);
    };

    fetchStorage();
  }, [eventId, refreshKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setSelectedFiles(files);
    // reset
    setUploadProgress(null);
    setUploadStatus("");

    // compute total size client‐side
    const total = Array.from(files).reduce((sum, f) => sum + f.size, 0);
    totalSizeRef.current = total;
  };

  const getEstimatedSpeedBps = () => {
    // use navigator.connection.downlink (in Mb/s)
    const nav = (navigator as any).connection;
    if (nav && nav.downlink) {
      // downlink is in Mb/s
      return nav.downlink * 1_000_000 / 8; // convert to bytes per second
    }
    // fallback to, say, 1 MB/s
    return 1_000_000;
  };

const startFakeProgress = () => {
  const total = totalSizeRef.current;
  const speed = getEstimatedSpeedBps();
  let loaded = 0;

  setUploadProgress({
    total,
    loaded,
    percentage: 0,
  });

  const maxFakeLoaded = Math.floor(total * 0.99); // cap at 99%

  timerRef.current = setInterval(() => {
    loaded = Math.min(loaded + speed, maxFakeLoaded);
    const pct = Math.round((loaded / total) * 100);

    setUploadProgress({
      total,
      loaded,
      percentage: pct,
    });

    if (loaded >= maxFakeLoaded && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, 1000);
};

  const stopFakeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleUpload = async () => {
    if (!eventId) {
      setUploadStatus("⚠️ Please create an event first");
      return;
    }
    if (!selectedFiles) {
      setUploadStatus("No files selected");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading…");
    startFakeProgress();

    const formData = new FormData();
    Array.from(selectedFiles).forEach((f) => formData.append("file", f));
    formData.append("eventId", eventId);

    try {
      const resp = await axios.post(
        "http://localhost:3000/s3/upload",
        formData,
        { withCredentials: true }
      );

      stopFakeProgress();
      // ensure progress goes to 100%
      setUploadProgress((p) =>
        p ? { ...p, loaded: p.total, percentage: 100 } : p
      );
      setStorage({
        used: BigInt(resp.data.storageUsed),
        total: BigInt(resp.data.totalStorage),
      });
      setUploadStatus("✅ Files uploaded successfully!");
      setSelectedFiles(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      stopFakeProgress();
      setUploadStatus("❌ Upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-md shadow-md bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-purple-800">
        Upload Files
      </h2>

      {/* Storage Status */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-500 h-2.5"
            style={{
              width: `${
                storage.total === 0n
                  ? 0
                  : Math.min(
                      Number((storage.used * 100n) / storage.total),
                      100
                    )
              }%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {formatBytes(storage.used)} of {formatBytes(storage.total)} used
        </p>
      </div>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
        className="mb-2 text-purple-900 w-full"
      />

      {/* Fake Progress Bar */}
      {isUploading && uploadProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading…</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-green-500 h-2.5"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatBytes(BigInt(uploadProgress.loaded))} of{" "}
            {formatBytes(BigInt(uploadProgress.total))}
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFiles || isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 w-full"
      >
        {isUploading ? "Uploading…" : "Upload"}
      </button>

      {uploadStatus && !isUploading && (
        <p
          className={`mt-2 text-sm ${
            uploadStatus.startsWith("❌") ? "text-red-600" : "text-blue-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
