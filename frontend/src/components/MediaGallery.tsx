import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, X, Download } from 'lucide-react';
import ReactPlayer from 'react-player';


interface MediaItem {
  url: string;
  name: string;
  type: 'image' | 'video' | 'other';
}

interface MediaGalleryProps {
  eventId: string;
  refreshKey?: number;
  onDeleteSuccess?: () => void; 
  mode?: "admin" | "public";
  showDownload?: boolean;
}

const MediaGallery = ({ 
  eventId, 
  refreshKey,
  onDeleteSuccess,  
  mode = "admin",
  showDownload = false,
}: MediaGalleryProps) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError('');
        setSelectedItems([]);
        
        const response = await axios.get<MediaItem[]>(
          `http://localhost:3000/api/events/${eventId}`,
          {
            withCredentials: true,
            signal: abortController.signal
          }
        );
        
        setMedia(response.data.filter(item => item.type !== 'other'));
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to load media');
          console.error(err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMedia();

    return () => abortController.abort();
  }, [eventId, refreshKey]);

  const toggleSelectItem = (name: string) => {
    setSelectedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name) 
        : [...prev, name]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(media.map(item => item.name));
    }
  };

  const deleteSelected = async () => {
    if (!selectedItems.length || deleting) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleting(true);
      
      await axios.post(
        `http://localhost:3000/s3/media/bulk-delete/${eventId}`,
        { fileNames: selectedItems },
        { withCredentials: true }
      );
      
      setMedia(prev => prev.filter(item => !selectedItems.includes(item.name)));
      setSelectedItems([]);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      setError('Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  const deleteSingleItem = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleting(true);
      await axios.delete(`http://localhost:3000/s3/media/${eventId}/${fileName}`, {
        withCredentials: true
      });
      
      setMedia(prev => prev.filter(item => item.name !== fileName));
      setSelectedItems(prev => prev.filter(item => item !== fileName));
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      setError('Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  // Handle download for a single item using backend route
  const handleDownload = async (fileName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/events/download/${eventId}/${fileName}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  // Handle bulk download using backend route

  //download individual files with multiple requests . Not Viable


// const handleBulkDownload = async () => {
//   if (!selectedItems.length || downloading) return;
  
//   try {
//     setDownloading(true);
    
//     // Get signed URLs from backend
//     const response = await axios.post(
//       `http://localhost:3000/api/events/download-multiple-urls/${eventId}`,
//       { fileNames: selectedItems },
//       { withCredentials: true }
//     );
    
//     // Create hidden iframe for each download
//     for (const item of response.data) {
//       const iframe = document.createElement("iframe");
//       iframe.src = item.url;
//       iframe.style.display = "none";
//       document.body.appendChild(iframe);
      
//       // Clean up after delay
//       setTimeout(() => {
//         document.body.removeChild(iframe);
//       }, 10000);
//     }
//   } catch (err) {
//     setError('Failed to download media');
//   } finally {
//     setDownloading(false);
//   }
// };

  // Handle ZIP download using backend route
  const handleZipDownload = async () => {
    if (!selectedItems.length || downloading) return;
    
    try {
      setDownloading(true);
      
      const response = await axios.post(
        `http://localhost:3000/api/events/download-multiple-zip/${eventId}`,
        { fileNames: selectedItems },
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${eventId}_media.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to create zip file');
    } finally {
      setDownloading(false);
    }
  };

  const isSelected = (name: string) => selectedItems.includes(name);
  const allSelected = media.length > 0 && selectedItems.length === media.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < media.length;

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">
      {error} - <button 
        onClick={() => window.location.reload()}
        className="text-blue-500 hover:underline"
      >
        Try Again
      </button>
    </div>
  );

  if (media.length === 0) return (
    <div className="text-gray-500 text-center p-8">
      No media found for this event
    </div>
  );

  return (
    <div>
      {/* Selection Control Bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-blue-300 p-3 mb-4 rounded-lg shadow flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            ref={input => {
              if (input) {
                input.indeterminate = someSelected;
              }
            }}
            onChange={toggleSelectAll}
            className="h-5 w-5 mr-3"
          />
          <span className="text-sm font-medium">
            {selectedItems.length > 0 
              ? `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`
              : 'Select media'}
          </span>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {/* <button
              onClick={handleBulkDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Download size={18} />
              )}
              Download Selected
            </button> */}
            
            <button
              onClick={handleZipDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 disabled:opacity-50"
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Download size={18} />
              )}
              Download as ZIP
            </button>
            
            {mode === "admin" && (
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Trash2 size={18} />
                )}
                Delete Selected
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {media.map((item) => (
          <div 
            key={item.url} 
            className={`
              relative group aspect-square rounded-lg overflow-hidden
              cursor-pointer
              ${isSelected(item.name) ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}
            `}
            onClick={() => toggleSelectItem(item.name)}
          >
            {/* Selection checkbox */}
            <div 
              className={`absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full 
                ${isSelected(item.name) ? 'bg-blue-500' : 'bg-white/80 hover:bg-white'}
              `}
            >
              {isSelected(item.name) && (
                <div className="text-white font-bold">✓</div>
              )}
            </div>
            
            {/* Delete button - Admin only */}
            {mode === "admin" && (
              <button
                onClick={(e) => deleteSingleItem(item.name, e)}
                className="absolute top-2 left-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Download button - Single item download */}
            {showDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item.name);
                }}
                className="absolute bottom-2 right-2 z-10 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <Download size={16} />
              </button>
            )}

            {/* Media content */}
           {item.type === 'image' ? (
  <img 
    src={item.url} 
    alt={item.name}
    loading="lazy"
    className="w-full h-full object-fill hover:scale-105 transition-transform duration-300 bg-black"
  />
) : (
  <div className="relative w-full h-full bg-black">
    <ReactPlayer
      url={item.url}
      controls
      width="100%"
      height="100%"
      style={{ objectFit: 'cover' }}
    />
  </div>
)}

          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;