import { useEffect, useState, useCallback } from "react";
import { Event, EventMedia } from "../../models/Event";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_EVENTS_ROUTE, DASHBOARD_ROUTE } from "../../constants/RouteContant";
import { getEvent, updateEvent } from "@/services/EventsService";
import DateWrapper from "@/utils/DateUtil";
import FileUploader from "@/components/FileUploader";
import MediaGallery from "@/components/MediaGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import EventCoverImage from "@/components/EventImageCover";
import { Calendar, MapPin, Users, Edit3, Eye, Copy, Sparkles, QrCode, Upload, Image, ArrowLeft, Settings } from "lucide-react";
import { AccessType } from "@/enums/AccessType";
import { Switch } from "@/components/ui/switch";
import CollapsibleSection from "@/components/CollapsibleSection";
import EventVisibilityPopup from "@/components/EventVisibilityPopup";

interface UpdateEventPayload {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  eventDate?: string;
  isPublished?: boolean;
  publishedUrl?: string;
  coverImageUrl?: string;
  accessType?:AccessType;
}

const AdminEventPage = () => {
  
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Event | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [mediaItems, setMediaItems] = useState<EventMedia[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accessType, setAccessType] = useState<AccessType.Public | AccessType.Private>(AccessType.Public);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishAccessType, setPublishAccessType] = useState<AccessType>(AccessType.Public);
  const [isVisibilityPopupOpen, setIsVisibilityPopupOpen] = useState(false);

  const openPublishModal = () => {
    setPublishAccessType(event?.accessType || AccessType.Public);
    setIsPublishModalOpen(true);
  };

  const displayFields = ["title", "description", "eventDate", "pin", "location"];

  const fetchEventData = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const eventData = await getEvent(eventId);
      if (!eventData) {
        navigate(ADMIN_EVENTS_ROUTE);
        return;
      }
      setEvent(eventData);
       setAccessType(eventData.accessType);
      setMediaItems(eventData.media || []);
      console.log("[AdminEventPage] fetched eventData.coverImageUrl:", eventData.coverImageUrl);
      console.log("[AdminEventPage] fetched eventData.media:", eventData.media);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, navigate]);

  useEffect(() => {
    fetchEventData();
  }, [eventId, fetchEventData, refreshKey]);

  const handleAccessToggle = (checked: boolean) => {
    const newType = checked ? AccessType.Private : AccessType.Public;
    setAccessType(newType);
    handleAccessTypeChange(newType);
  };
    
  const handleOpenEditModal = () => {
    setEditForm({ ...event } as Event);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm(null);
  };

  const isValidForm = (): boolean => {
    if (!editForm) return false;
    if (!editForm.title?.trim()) {
      alert("Title should not be empty");
      return false;
    }
    if (!editForm.description?.trim()) {
      alert("Description should not be empty");
      return false;
    }
    if (!editForm.eventDate) {
      alert("Event date should not be empty");
      return false;
    }
    if (!editForm.location?.trim()) {
      alert("Location should not be empty");
      return false;
    }
    return true;
  };

  const handleSaveEdit = async () => {
    if (!editForm || !isValidForm()) return;

    const formattedDate = (editForm.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD");

    const payloadToSend: UpdateEventPayload = {
      id: editForm.id,
      title: editForm.title!.trim(),
      description: editForm.description!.trim(),
      location: editForm.location!.trim(),
      eventDate: formattedDate,
    };

    try {
      await updateEvent(payloadToSend);
      await fetchEventData();
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Failed to update event");
      console.error(err);
    }
  };

  const updateEventCoverImage = useCallback(
    async (newCoverUrl: string | null) => {
      if (!event || !eventId) return;

      const eventDateString =
        typeof event.eventDate === "string"
          ? event.eventDate
          : (event.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD");

      const payload: UpdateEventPayload = {
        id: eventId,
        coverImageUrl: newCoverUrl || "",
        eventDate: eventDateString,
      };

      try {
        await updateEvent(payload);
        await fetchEventData();
      } catch (err) {
        console.error("Failed to save new coverImageUrl to database:", err);
      }
    },
    [event, eventId, fetchEventData]
  );

  const handlePublish = async (accessType: AccessType) => {
    if (!event || !eventId) return;

    try {
      const shareLink = `${window.location.origin}/gallery/${eventId}`;
      const eventDateString =
        typeof event.eventDate === "string"
          ? event.eventDate
          : (event.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD");

      const payloadToSend: UpdateEventPayload = {
        id: eventId,
        isPublished: true,
        publishedUrl: shareLink,
        eventDate: eventDateString,
        accessType: accessType,
      };

      await updateEvent(payloadToSend);
      await fetchEventData();
      setIsPublishModalOpen(false);
      alert(`Event published successfully as ${accessType === AccessType.Public ? "Public" : "Private"}! Share this link: ${shareLink}`);
    } catch (err) {
      alert("Failed to publish event");
      console.error(err);
    }
  };

  const handleAccessTypeChange = async (newAccessType: AccessType.Public | AccessType.Private) => {
    if (!event || !eventId) return;

    try {
      const eventDateString = 
        typeof event.eventDate === "string"
          ? event.eventDate
          : (event.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD");

      const payload: UpdateEventPayload = {
        id: eventId,
        accessType: newAccessType,
        eventDate: eventDateString,
      };

      console.log(payload);
      await updateEvent(payload);
      await fetchEventData();
    } catch (err) {
      console.error("Failed to update access type", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700/50 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <div>
              <p className="text-lg font-semibold text-white">Loading event...</p>
              <p className="text-sm text-slate-400">Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-md mx-4 animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
            <p className="text-slate-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => navigate(ADMIN_EVENTS_ROUTE)}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl"
            >
              Return to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 relative overflow-hidden">
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-br from-slate-900 via-black to-slate-800 backdrop-blur-xl shadow-2xl border-r border-slate-700/50 overflow-y-auto animate-slide-in-left">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center relative animate-fade-in">
              
            <Button
              onClick={() => navigate(ADMIN_EVENTS_ROUTE)}
              className="w-50% bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl animate-fade-in mb-5 mr-44"
              style={{animationDelay: '0.1s'}}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
              <div className="absolute -top-2 -right-2 text-purple-400 animate-pulse">
                {/* <Sparkles className="w-6 h-6" /> */}
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Event Dashboard
              </h2>
              <p className="text-sm text-slate-400 mt-1">Manage with love</p>
            </div>


            {/* Event Management Section */}
            <CollapsibleSection
              title="Event Management"
              icon={<Settings className="w-4 h-4 text-purple-400" />}
              defaultExpanded={true}
              animationDelay="0.2s"
            >
              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <h4 className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Image className="w-3 h-3 text-purple-400" />
                    Cover Image
                  </h4>
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <EventCoverImage
                      eventId={eventId}
                      currentCoverUrl={event.coverImageUrl || null}
                      onCoverImageChanged={updateEventCoverImage}
                    />
                  </div>
                </div>

                
                {/* QR Code */}
                <div>
                  <h4 className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <QrCode className="w-3 h-3 text-purple-400" />
                    QR Code
                  </h4>
                  {event.publishedUrl ? (
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 text-center hover:border-purple-400 transition-colors duration-200">
                      <QRCode
                        size={128}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        value={event.publishedUrl}
                        viewBox={`0 0 256 256`}
                      />
                      <p className="text-xs text-slate-600 mt-2">Scan to view event</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Publish to generate QR code</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Event Details Section */}
            <CollapsibleSection
              title="Event Details"
              icon={<Calendar className="w-4 h-4 text-purple-400" />}
              animationDelay="0.3s"
            >
              <div className="space-y-4">
                {displayFields.map((field, index) => (
                  <div key={field}>
                    <div className="flex items-center gap-2 mb-1">
                      {field === 'location' && <MapPin className="w-3 h-3 text-purple-400" />}
                      {field === 'eventDate' && <Calendar className="w-3 h-3 text-purple-400" />}
                      {field === 'pin' && <QrCode className="w-3 h-3 text-purple-400" />}
                      <label className="text-xs font-medium text-slate-300 capitalize">
                        {field === 'eventDate' ? 'Date' : field}
                      </label>
                    </div>
                    <div className="bg-slate-600/50 p-3 rounded-lg border border-slate-500/50 hover:bg-slate-600/70 transition-colors duration-200">
                      <p className="text-sm text-white font-medium">
                        {field === "eventDate"
                          ? (event[field] as DateWrapper).getDisplayFormat("DD-MM-YYYY")
                          : event[field]}
                      </p>
                    </div>
                  </div>
                ))}
                              {/* Edit Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl group"
                  onClick={handleOpenEditModal}
                >
                  <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Edit
                </Button>
              </div>



            </CollapsibleSection>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 via-black to-slate-800 backdrop-blur-xl border-b border-slate-700/50 p-6 animate-slide-in-right">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {/* <Sparkles className="w-6 h-6 text-purple-400" /> */}
                  Media Management
                </h1>
                <p className="text-slate-400 mt-1">Upload and organize your event media</p>
              </div>

              <div className="flex gap-3">
                {event.isPublished ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsVisibilityPopupOpen(true)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50 shadow-md hover:shadow-lg transition-all duration-300 group bg-slate-800/50 backdrop-blur-sm transform hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      Event Visibility
                    </Button>

                    <Button
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => window.open(event.publishedUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      View Live Site
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50 shadow-md hover:shadow-lg transition-all duration-300 group bg-slate-800/50 backdrop-blur-sm transform hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => {
                        navigator.clipboard.writeText(event.publishedUrl || "");
                        alert("Link copied to clipboard!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Copy Link
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl group"
                    onClick={openPublishModal}
                  >
                    {/* <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> */}
                    Publish Event
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Upload Section */}
            <div className="rounded-lg p-4">
              {eventId && (
                <FileUploader
                  eventId={eventId}
                  onUploadSuccess={() => setRefreshKey((prev) => prev + 1)}
                  refreshKey={refreshKey}
                />
              )}
            </div>

            {/* Media Gallery */}
            <div className="bg-gradient-to-br from-slate-900 via-black to-slate-800 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:shadow-lg transition-all duration-300 flex-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Image className="w-5 h-5 text-purple-400" />
                  Media Gallery
                </h3>
              </div>
              <div className="px-6 pb-6 flex-1">
                <div className="rounded-lg p-4 h-full border border-slate-600/20">
                  {eventId ? (
                    <MediaGallery
                      eventId={eventId}
                      key={refreshKey}
                      onDeleteSuccess={() => setRefreshKey((prev) => prev + 1)}
                    />
                  ) : (
                    <div className="text-center text-slate-400 py-12">
                      <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No event selected for media management</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Visibility Popup */}
        <EventVisibilityPopup
          isOpen={isVisibilityPopupOpen}
          onClose={() => setIsVisibilityPopupOpen(false)}
          accessType={accessType}
          onAccessToggle={handleAccessToggle}
          isPublished={event.isPublished}
        />

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-slate-700/50 animate-scale-in">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Edit Event Info</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
                className="space-y-4"
              >
                {displayFields
                  .filter((field) => field !== "pin")
                  .map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold capitalize mb-2 text-slate-300">
                        {field}
                      </label>
                      {field === "eventDate" ? (
                        <input
                          type="date"
                          className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          value={
                            editForm?.eventDate
                              ? (editForm.eventDate as DateWrapper).getDisplayFormat(
                                  "YYYY-MM-DD"
                                )
                              : ""
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm!,
                              eventDate: new DateWrapper(e.target.value),
                            })
                          }
                        />
                      ) : field === "description" ? (
                        <textarea
                          value={editForm?.[field] || ""}
                          className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm!,
                              [field]: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          value={editForm?.[field] || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm!,
                              [field]: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Publish Modal */}
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-slate-700/50 animate-scale-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                {/* <Sparkles className="w-5 h-5 text-purple-400" /> */}
                Publish Event
              </h2>
              <p className="text-slate-400 mb-6">
                Choose how you want to share this event:
              </p>
              
              <div className="space-y-4 mb-6">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    publishAccessType === AccessType.Public 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-slate-600 hover:border-purple-400 bg-slate-700/30'
                  }`}
                  onClick={() => setPublishAccessType(AccessType.Public)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      publishAccessType === AccessType.Public 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-slate-400'
                    }`}>
                      {publishAccessType === AccessType.Public && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Public Event</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Anyone with the link can view your event
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    publishAccessType === AccessType.Private 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-slate-600 hover:border-purple-400 bg-slate-700/30'
                  }`}
                  onClick={() => setPublishAccessType(AccessType.Private)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      publishAccessType === AccessType.Private 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-slate-400'
                    }`}>
                      {publishAccessType === AccessType.Private && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Private Event</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Only people with the PIN can view your event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  onClick={() => handlePublish(publishAccessType)}
                >
                  {/* <Sparkles className="w-4 h-4 mr-2" /> */}
                  Publish as {publishAccessType === AccessType.Public ? 'Public' : 'Private'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEventPage;