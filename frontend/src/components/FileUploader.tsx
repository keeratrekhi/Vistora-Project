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
  total: number;       // the total size in bytes (client‐calculated)
  loaded: number;      // how many bytes have uploaded so far
  percentage: number;  // (loaded / total) * 100, rounded
}

const FileUploader: React.FC<FileUploadProps> = ({
  eventId,
  onUploadSuccess,
  refreshKey,
}) => {
  const [storage, setStorage] = useState<StorageStatus>({
    used: 0n,
    total: BigInt(10737418240), // default 10 GB
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // We’ll keep the “client‐computed total size” in a ref so it’s stable across re‐renders:
  const totalSizeRef = useRef<number>(0);

  const formatBytes = (bytes: bigint): string => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = Number(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Fetch “used” + “total” storage for this event
  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/user/storage?eventId=${eventId}`,
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
    if (files) {
      setSelectedFiles(files);
      setUploadProgress(null);
      setUploadStatus("");
      // Compute total size (in bytes) of all selected files:
      const total = Array.from(files).reduce((sum, f) => sum + f.size, 0);
      totalSizeRef.current = total;
    }
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

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("file", file);
    });
    formData.append("eventId", eventId);

    try {
      setIsUploading(true);
      setUploadStatus("Uploading…");

      // Initialize our “client‐side total” (just in case):
      const totalSize = totalSizeRef.current;
      setUploadProgress({
        total: totalSize,
        loaded: 0,
        percentage: 0,
      });

      await axios.post("http://localhost:3000/s3/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // progressEvent.loaded is how many bytes have been sent so far
          // We’ll trust totalSizeRef.current instead of progressEvent.total
          const loaded = progressEvent.loaded;
          const percentage = totalSize
            ? Math.round((loaded / totalSize) * 100)
            : 0;
          setUploadProgress({
            total: totalSize,
            loaded,
            percentage,
          });
        },
      }).then((response) => {
        // Once upload finishes, update “used” + “total” from server response
        // (Assume response.data.storageUsed and response.data.totalStorage are strings)
        setStorage({
          used: BigInt(response.data.storageUsed),
          total: BigInt(response.data.totalStorage),
        });
        setUploadStatus("✅ Files uploaded successfully!");
        setSelectedFiles(null);
        setUploadProgress(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      });
    } catch (error) {
      console.error(error);
      setUploadStatus("❌ Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-md shadow-md bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-purple-800">Upload Files</h2>

      {/* Storage Status */}
      <div className="mb-4">
        <h3 className="font-semibold text-purple-800">Storage Usage</h3>
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

      {/* File Input */}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.mp4,.mov,.txt"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
        className="mb-2 text-purple-900 w-full"
      />

      {/* Real‐time Upload Progress Bar */}
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

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFiles || isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 w-full"
      >
        {isUploading ? "Uploading…" : "Upload"}
      </button>

      {/* Status Message */}
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
