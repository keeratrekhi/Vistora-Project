import { useEffect, useState, useCallback } from "react";
import { Event, EventMedia } from "../../models/Event";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_EVENTS_ROUTE } from "../../constants/RouteContant";
import { getEvent, updateEvent } from "@/services/EventsService";
import DateWrapper from "@/utils/DateUtil";
import FileUploader from "@/components/FileUploader";
import MediaGallery from "@/components/MediaGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import EventCoverImage from "@/components/EventImageCover";
import { Calendar, MapPin, Users, Edit3, Eye, Copy, Sparkles, QrCode, Upload, Image } from "lucide-react";

interface UpdateEventPayload {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  eventDate?: string;
  isPublished?: boolean;
  publishedUrl?: string;
  coverImageUrl?: string;
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

  const handlePublish = async () => {
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
      };

      await updateEvent(payloadToSend);
      await fetchEventData();
      alert(`Event published successfully! Share this link: ${shareLink}`);
    } catch (err) {
      alert("Failed to publish event");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading event...</p>
              <p className="text-sm text-gray-600">Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => navigate(ADMIN_EVENTS_ROUTE)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Return to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm shadow-xl border-r border-blue-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 text-blue-400 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Event Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage with love</p>
            </div>

            {/* Cover Image Section */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-600" />
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 group-hover:scale-[1.02] transition-transform duration-300">
                  <EventCoverImage
                    eventId={eventId}
                    currentCoverUrl={event.coverImageUrl || null}
                    onCoverImageChanged={updateEventCoverImage}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayFields.map((field, index) => (
                  <div key={field} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center gap-2 mb-1">
                      {field === 'location' && <MapPin className="w-3 h-3 text-blue-500" />}
                      {field === 'eventDate' && <Calendar className="w-3 h-3 text-blue-500" />}
                      {field === 'pin' && <QrCode className="w-3 h-3 text-blue-500" />}
                      <label className="text-xs font-medium text-gray-700 capitalize">
                        {field === 'eventDate' ? 'Date' : field}
                      </label>
                    </div>
                    <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 hover:bg-blue-100/70 transition-colors duration-200">
                      <p className="text-sm text-gray-900 font-medium">
                        {field === "eventDate"
                          ? (event[field] as DateWrapper).getDisplayFormat("DD-MM-YYYY")
                          : event[field]}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Edit Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={handleOpenEditModal}
            >
              <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Edit Event Info
            </Button>

            {/* QR Code Section */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.publishedUrl ? (
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-200 text-center hover:border-blue-300 transition-colors duration-200">
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
                    <p className="text-xs text-gray-600 mt-2">Scan to view event</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Publish to generate QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm border-b border-blue-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  Media Management
                </h1>
                <p className="text-gray-600 mt-1">Upload and organize your event media</p>
              </div>

              <div className="flex gap-3">
                {event.isPublished ? (
                  <>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                      onClick={() => window.open(event.publishedUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      View Live Site
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300 group"
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
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    onClick={handlePublish}
                  >
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Publish Event
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Upload Section */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4">
                  {eventId && (
                    <FileUploader
                      eventId={eventId}
                      onUploadSuccess={() => setRefreshKey((prev) => prev + 1)}
                      refreshKey={refreshKey}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Media Gallery
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-auto">
                    {mediaItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-4 h-full">
                  {eventId ? (
                    <MediaGallery
                      eventId={eventId}
                      key={refreshKey}
                      onDeleteSuccess={() => setRefreshKey((prev) => prev + 1)}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No event selected for media management</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit Event Info
            </h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize flex items-center gap-2">
                      {field === 'location' && <MapPin className="w-3 h-3 text-blue-500" />}
                      {field === 'eventDate' && <Calendar className="w-3 h-3 text-blue-500" />}
                      {field === 'eventDate' ? 'Date' : field}
                    </label>
                    {field === "eventDate" ? (
                      <input
                        type="date"
                        className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        value={
                          editForm?.eventDate
                            ? (editForm.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD")
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
                        className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
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
                        className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditModal}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventPage;