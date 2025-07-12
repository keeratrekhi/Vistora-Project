import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, X, Download, Image as ImageIcon, Video, Grid, List, Search, Filter } from 'lucide-react';
import ReactPlayer from 'react-player';
import MediaViewer from './MediaViewer';

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
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);

  const env=import.meta.env;

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError('');
        setSelectedItems([]);
        
        const response = await axios.get<MediaItem[]>(
          `${env.VITE_BACKEND_URL}/api/events/${eventId}`,
          {
            withCredentials: true,
            signal: abortController.signal
          }
        );
        
        const mediaItems = response.data.filter(item => item.type !== 'other');
        setMedia(mediaItems);
        setFilteredMedia(mediaItems);
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

  // Filter and search logic
  useEffect(() => {
    let filtered = media;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMedia(filtered);
    // Clear selection when filters change
    setSelectedItems([]);
  }, [media, filterType, searchQuery]);

  const toggleSelectItem = (name: string) => {
    setSelectedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name) 
        : [...prev, name]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map(item => item.name));
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
        `${env.VITE_BACKEND_URL}/s3/media/bulk-delete/${eventId}`,
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
      await axios.delete(`${env.VITE_BACKEND_URL}/s3/media/${eventId}/${fileName}`, {
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

  const handleDownload = async (fileName: string) => {
    try {
      const response = await axios.get(
        `${env.VITE_BACKEND_URL}/api/events/download/${eventId}/${fileName}`,
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

const handleZipDownload = async () => {
  if (!selectedItems.length || downloading) return;
  
  try {
    setDownloading(true);
    
    // Convert array to query string
    const queryString = selectedItems
      .map(fileName => `fileNames=${encodeURIComponent(fileName)}`)
      .join('&');
    
    const response = await axios.get(
      `${env.VITE_BACKEND_URL}/api/events/download-multiple-zip/${eventId}?${queryString}`,
      {
        responseType: 'blob',
        withCredentials: true
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventId}_media.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  } finally {
    setDownloading(false);
  }
};

  const handleMediaClick = (index: number, e: React.MouseEvent) => {
    // Only open viewer if not clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    setCurrentViewerIndex(index);
    setViewerOpen(true);
  };

  const isSelected = (name: string) => selectedItems.includes(name);
  const allSelected = filteredMedia.length > 0 && selectedItems.length === filteredMedia.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < filteredMedia.length;

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

  if (filteredMedia.length === 0 && media.length === 0) return (
    <div className="text-gray-500 text-center p-8">
      No media found for this event
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter and View Mode Controls */}
      <div className="bg-gradient-to-tr from-slate-900 via-purple-900/20 to-slate-900  rounded-xl  border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
          {/* Filter by type */}
          <div className="flex items-center gap-3 ">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'video')}
              className="bg-slate-900 border border-slate-300 rounded-lg text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm"
            >
              <option value="all" className='bg-slate-900'>All Media</option>
              <option value="image" className='bg-slate-900'>Images</option>
              <option value="video" className='bg-slate-900'>Videos</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-purple-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Control Bar */}
      {filteredMedia.length > 0 && (
        <div className="sticky top-0 z-10 bg-gradient-to-tr from-slate-900 via-purple-900/20 to-slate-900  backdrop-blur-xl  border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded border-slate-300 text-gray-500 focus:ring-gray-500"
              />
              <span className="text-sm font-medium text-white">
                {selectedItems.length > 0 
                  ? `${selectedItems.length} of ${filteredMedia.length} selected`
                  : `${filteredMedia.length} item${filteredMedia.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            
            {selectedItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleZipDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {downloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download ZIP
                </button>
                
                {mode === "admin" && (
                  <button
                    onClick={deleteSelected}
                    disabled={deleting}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Display */}
      {filteredMedia.length === 0 ? (
        <div className="text-center p-8">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <Search className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No results found</h3>
            <p className="text-slate-600">Try adjusting your filter settings</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Masonry Grid Layout */
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {filteredMedia.map((item, index) => (
            <div 
              key={item.url} 
              className={`
                group relative mb-4 overflow-hidden cursor-pointer transition-all duration-300 break-inside-avoid
                rounded-xl shadow-sm hover:shadow-lg ${isSelected(item.name) ? 'ring-4 ring-purple-500 scale-[0.98]' : 'hover:ring-2 hover:ring-purple-400 hover:scale-[1.02]'}
              `}
              onClick={(e) => handleMediaClick(index, e)}
            >
              {/* Selection indicator */}
              <div className="absolute top-3 right-3 z-10">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isSelected(item.name) 
                      ? 'bg-purple-500 scale-110' 
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectItem(item.name);
                  }}
                >
                  {isSelected(item.name) ? (
                    <div className="text-white text-sm font-bold">✓</div>
                  ) : (
                    <div className="w-3 h-3 border-2 border-slate-400 rounded-full"></div>
                  )}
                </div>
              </div>
              
              {/* Delete button - Admin only */}
              {mode === "admin" && (
                <button
                  onClick={(e) => deleteSingleItem(item.name, e)}
                  className="absolute top-3 left-3 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Download button */}
              {showDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.name);
                  }}
                  className="absolute bottom-3 right-3 z-10 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {/* Media content */}
              <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="relative w-full bg-slate-100 flex items-center justify-center aspect-video">
                    <Video className="w-8 h-8 text-purple-500 absolute z-10" />
                    <ReactPlayer
                      url={item.url}
                      width="100%"
                      height="100%"
                      style={{ opacity: 0.7 }}
                      muted
                      loop
                      playing={false}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredMedia.map((item, index) => (
            <div 
              key={item.url}
              className={`
                group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md
                ${isSelected(item.name) ? 'ring-4 ring-purple-500 bg-purple-50' : 'hover:ring-2 hover:ring-purple-400 hover:bg-slate-50'} bg-white border border-slate-200
              `}
              onClick={(e) => handleMediaClick(index, e)}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item.name}</p>
                <p className="text-slate-400 text-sm capitalize">{item.type}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Selection checkbox */}
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected(item.name) 
                      ? 'bg-purple-500' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectItem(item.name);
                  }}
                >
                  {isSelected(item.name) && (
                    <div className="text-white text-sm font-bold">✓</div>
                  )}
                </div>

                {/* Download button */}
                {showDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item.name);
                    }}
                    className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Delete button - Admin only */}
                {mode === "admin" && (
                  <button
                    onClick={(e) => deleteSingleItem(item.name, e)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer */}
      <MediaViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        media={filteredMedia}
        currentIndex={currentViewerIndex}
        onNavigate={setCurrentViewerIndex}
        onDownload={showDownload ? handleDownload : undefined}
        showDownload={showDownload}
      />
    </div>
  );
};

export default MediaGallery;