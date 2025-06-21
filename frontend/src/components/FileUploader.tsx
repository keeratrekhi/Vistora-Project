import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload, Cloud, CheckCircle, AlertCircle, File, X, ChevronDown, ChevronUp, Image } from "lucide-react";
import toast from "react-hot-toast";
import { fetchlogoImage } from "@/services/DashboardService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import LoadingSpinner from "./ui/loading-spinner";


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

interface logoFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

const env = import.meta.env;

const FileUploader: React.FC<FileUploadProps> = ({
  eventId,
  onUploadSuccess,
  refreshKey,
}) => {
  // State declarations
  const [storage, setStorage] = useState<StorageStatus>({
    used: 0n,
    total: BigInt(10 * 1024 ** 3),
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchinglogoImage, setFetchinglogoImage] = useState<boolean>(false);
  const [uploadinglogoImage, setUploadinglogoImage] = useState<boolean>(false);
  const [logoImage, setlogoImage] = useState<logoFile | null>(null);
  const [applyLogo, setApplyLogo] = useState(()=>{
    const saved = localStorage.getItem('applyLogo');
    return saved==='true';
  })
  const [showAllowed, setShowAllowed] = useState(false);
  const toggleAllowed = () => setShowAllowed((prev) => !prev);
  
  // Refs
  const totalSizeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const allowedExt = [
    ".jpg", ".jpeg", ".png", 
    ".mp4", ".mov", ".mkv", ".avi", ".flv", ".webm", ".is",
    ".txt",
    ".mp3", ".wav", ".ogg"
  ];

  // Format bytes utility function
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



    useEffect(()=>{
      localStorage.setItem('applyLogo',String(applyLogo));

    },[applyLogo])




  // Fetch storage data
  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await axios.get(
          `${env.VITE_BACKEND_URL}/api/storage/user/storage?eventId=${eventId}`,
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

  // Fetch logo image
  useEffect(() => {
    const fetchlogo = async (eventId: string) => {
      if (!eventId) {
        setlogoImage(null);
        return;
      }
      try {
        setFetchinglogoImage(true);
        const response: any = await fetchlogoImage(eventId);
        const covers: logoFile[] = response.covers;
        setlogoImage(covers.length > 0 ? covers[0] : null);
      } catch (err) {
        toast.error("Error fetching logo image. Please try again later.");
        setlogoImage(null);
      } finally {
        setFetchinglogoImage(false);
      }
    };

    fetchlogo(eventId);
  }, [eventId, refreshKey]);

  // Handle file selection
  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.slice(files[i].name.lastIndexOf(".")).toLowerCase();
      if (!allowedExt.includes(ext)) {
        toast.error(
          `“${files[i].name}” is not an allowed file type.\n` +
          `Allowed extensions: ${allowedExt.join(", ")}`
        );

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFiles(null);
        setUploadProgress(null);
        setUploadStatus("");
        return;
      }
    }

    setSelectedFiles(files);
    setUploadProgress(null);
    setUploadStatus("");
    totalSizeRef.current = Array.from(files).reduce((sum, f) => sum + f.size, 0);
  };

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropzoneRef.current && 
        !dropzoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  // File management
  const removeFile = (index: number) => {
    if (!selectedFiles) return;
    const dt = new DataTransfer();
    Array.from(selectedFiles).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    setSelectedFiles(dt.files.length > 0 ? dt.files : null);
  };

  // Upload progress simulation
  const getEstimatedSpeedBps = () => {
    const nav = (navigator as any).connection;
    if (nav && nav.downlink) {
      return nav.downlink * 1_000_000 / 8;
    }
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

    const maxFakeLoaded = Math.floor(total * 0.99);

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Upload handlers
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
        `${env.VITE_BACKEND_URL}/s3/upload`,
        formData,
        { withCredentials: true }
      );

      stopFakeProgress();
      setUploadProgress((p) => p ? { ...p, loaded: p.total, percentage: 100 } : p);
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

  const handleUploadwithlogo = async () => {
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
        `${env.VITE_BUCKET_URL}/logoimageupload/${eventId}`,
        formData,
        { withCredentials: true }
      );

      stopFakeProgress();
      setUploadProgress((p) => p ? { ...p, loaded: p.total, percentage: 100 } : p);
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

  const handleUploadLogo = async () => {
    if (!logoInputRef.current?.files?.length) {
      toast.error("Select a file first");
      return;
    }
    
    const form = new FormData();
    form.append("file", logoInputRef.current.files[0]);

    setUploadinglogoImage(true);
    try {
      await axios.post(
        `${env.VITE_BUCKET_URL}/uploadlogo/${encodeURIComponent(eventId)}`,
        form,
        { withCredentials: true }
      );
      toast.success("Logo uploaded successfully!");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploadinglogoImage(false);
    }
  };

  const handleDeleteLogo = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this logo?")) return;

    setUploadinglogoImage(true);
    try {
      await axios.delete(
        `${env.VITE_BUCKET_URL}/deletelogo/${encodeURIComponent(eventId)}/${encodeURIComponent(fileName)}`,
        { withCredentials: true }
      );
      toast.success("Logo deleted");
      setlogoImage(null);
    } catch {
      toast.error("Failed to delete logo");
    } finally {
      setUploadinglogoImage(false);
    }
  };

  // Calculate storage percentage
  const storagePercentage = storage.total === 0n ? 0 : 
    Math.min(Number((storage.used * 100n) / storage.total), 100);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-black to-slate-800 backdrop-blur-xl rounded-2xl border border-slate-600/50 animate-fade-in hover:shadow-lg transition-all duration-300">
      {/* Collapsed Header Bar */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Cloud className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Upload Media</h3>
            <p className="text-xs text-slate-400">
              {selectedFiles ? `${selectedFiles.length} files selected` : 'Click to upload files'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mini storage indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-16 bg-slate-600/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 transition-all duration-300"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{storagePercentage.toFixed(0)}%</span>
          </div>
          
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-6 pt-2 space-y-6">
          {/* Storage Status */}
          <div className="animate-slide-in-right">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-300">Storage Used</span>
              <span className="text-sm text-slate-400">{storagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-600/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-700 ease-out animate-gradient-x"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatBytes(storage.used)} of {formatBytes(storage.total)} used
            </p>
          </div>

                <div className="mb-4">
                <button
                  onClick={toggleAllowed}
                  className="px-4 py-2 w-50% bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl animate-fade-in mb-5 mr-44 rounded-md"
                  >
                 {showAllowed ? "Hide allowed types" : "Show allowed types"}
                       </button>

                      <div
                 className={
                  `overflow-hidden transition-all duration-300 mt-2 ` +
                     (showAllowed ? "max-w-full opacity-100" : "max-w-0 opacity-0")
                   }
                   style={{ whiteSpace: "nowrap" }}
                    >
                {allowedExt.map((ext) => (
                  <span
                   key={ext}
                 className="inline-block px-2 py-1 mr-2 mb-1 bg-gray-700 rounded text-sm text-white"
                   >
                       {ext}
                         </span>
                        ))}
                </div>
                  </div>


          {/* Logo Management Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-400" />
                Event Logo
              </h3>
              
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyLogo}
                    onChange={() => setApplyLogo((v) => !v)}
                    className="sr-only peer"
                    disabled={isUploading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                </label>
                <span className="ml-3 text-sm text-slate-300">Apply Logo to uploads</span>
              </div>
            </div>


              {applyLogo && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                {fetchinglogoImage || uploadinglogoImage ? (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-500 rounded-lg">
                    <LoadingSpinner message={fetchinglogoImage ? "Loading logo..." : "Updating logo..."} />
                  </div>
                ) : logoImage ? (
                  <div className="space-y-4">
                    <div className="w-full h-32 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <img
                        src={logoImage.url}
                        alt="Event Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label
                        className="flex-1 flex items-center justify-center cursor-pointer border border-slate-500 rounded-lg px-3 py-2 bg-slate-700 hover:bg-slate-600 transition-colors text-slate-200 text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleUploadLogo}
                          className="hidden"
                          id="logo-upload"
                          ref={logoInputRef}
                        />
                      </label>
                      <Button
                        onClick={() => logoImage && handleDeleteLogo(logoImage.name)}
                        variant="destructive"
                        size="sm"
                        className="text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleUploadLogo}
                      className="hidden"
                      ref={logoInputRef}
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-500 rounded-lg hover:border-slate-400 cursor-pointer transition-colors text-slate-400"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm font-medium">
                          Upload Event Logo
                        </span>
                        <p className="text-xs mt-1">
                          PNG or JPG, max 2MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
              )}
          </div>

          {/* Drop Zone */}
          <div
            ref={dropzoneRef}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              group hover:scale-[1.02] animate-fade-in
              ${isDragOver 
                ? 'border-purple-400 bg-purple-500/10 scale-[1.02] shadow-lg' 
                : 'border-slate-500 hover:border-purple-400 hover:bg-purple-500/5'
              }
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={isUploading}
              className="hidden"
              accept="image/*,video/*,audio/*,text/*"
            />
            
            <div className="space-y-4 pointer-events-none">
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${isDragOver ? 'animate-bounce' : ''}`}>
                <Upload className={`w-8 h-8 text-purple-400 transition-transform duration-300 ${isDragOver ? 'scale-110' : 'group-hover:scale-110'}`} />
              </div>
              
              <div>
                <p className="text-white font-medium mb-1">
                  {isDragOver ? 'Drop files here' : 'Choose files or drag & drop'}
                </p>
                <p className="text-sm text-slate-400">
                  Images, videos, audio, and text files
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2 animate-slide-in-left">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <File className="w-4 h-4" />
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-600/30 rounded-lg p-3">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2 group hover:bg-slate-700/70 transition-colors duration-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-white truncate">{file.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        ({formatBytes(BigInt(file.size))})
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors duration-200 flex-shrink-0"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
                <span className="text-sm text-purple-400 font-medium">{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-slate-600/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-300 animate-gradient-x"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {formatBytes(BigInt(uploadProgress.loaded))} of{" "}
                {formatBytes(BigInt(uploadProgress.total))}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={applyLogo ? handleUploadwithlogo : handleUpload}
            disabled={!selectedFiles || isUploading}
            className={`
              w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform
              ${!selectedFiles || isUploading
                ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                {applyLogo ? 'Upload with Logo' : 'Upload Files'}
              </div>
            )}
          </button>

          {/* Status Message */}
          {uploadStatus && !isUploading && (
            <div className={`p-3 rounded-lg flex items-center gap-2 animate-fade-in ${
              uploadStatus.startsWith("❌") 
                ? "bg-red-500/20 border border-red-500/30 text-red-300" 
                : uploadStatus.startsWith("✅")
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
            }`}>
              {uploadStatus.startsWith("✅") && <CheckCircle className="w-5 h-5" />}
              {uploadStatus.startsWith("❌") && <AlertCircle className="w-5 h-5" />}
              {uploadStatus.startsWith("⚠️") && <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{uploadStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;