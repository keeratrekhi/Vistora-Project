
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";
import { Event, EventMedia } from "../../models/Event";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_EVENTS_ROUTE } from "../../constants/RouteContant";
import { getEvent, updateEvent } from "@/services/EventsService";
import { IMAGE_NOT_FOUND_PATH } from "@/constants/ImagePathConstant";
import DateWrapper from "@/utils/DateUtil";
import FileUploader from "@/components/FileUploader";
import MediaGallery from "@/components/MediaGallery";
import Button from "@/components/Button";
import QRCode from "react-qr-code";
import EventCoverImage from "@/components/EventImageCover";

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

    // Convert DateWrapper → "YYYY-MM-DD"
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

      // Preserve other required fields (e.g. eventDate) so updateEvent doesn't drop them
      const eventDateString =
        typeof event.eventDate === "string"
          ? event.eventDate
          : (event.eventDate as DateWrapper).getDisplayFormat("YYYY-MM-DD");

      const payload: UpdateEventPayload = {
        id: eventId,
        coverImageUrl: newCoverUrl || "", // if null, send empty string
        eventDate: eventDateString,
      };

      try {
        await updateEvent(payload);
        // Re‐fetch so that event.coverImageUrl is up to date
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <button
            onClick={() => navigate(ADMIN_EVENTS_ROUTE)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Cover Image Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold">Cover Image</label>
            <EventCoverImage
              eventId={eventId}
              currentCoverUrl={event.coverImageUrl || null}
              onCoverImageChanged={updateEventCoverImage}
            />
          </div>

          {/* Event Details */}
          {displayFields.map((field) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-black capitalize font-bold">
                  {field}
                </label>
              </div>
              <p className="text-gray-900">
                {field === "eventDate"
                  ? (event[field] as DateWrapper).getDisplayFormat("DD-MM-YYYY")
                  : event[field]}
              </p>
            </div>
          ))}

          {/* Edit Info Button */}
          <button
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleOpenEditModal}
          >
            Edit Info
          </button>

          {/* QR Code */}
          {event.publishedUrl ? (
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
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Publish the event to see a QR code.
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Media Management */}
      <div className="flex-1 overflow-auto flex flex-col p-6 bg-white">
        <div className="flex justify-between">
          <h1 className="text-xl font-semibold text-slate-800 mb-4">
            Media Management
          </h1>

          {event.isPublished ? (
            <div className="flex gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(event.publishedUrl, "_blank")}
              >
                View Published Site
              </Button>
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => {
                  navigator.clipboard.writeText(event.publishedUrl || "");
                  alert("Link copied to clipboard!");
                }}
              >
                Copy Link
              </Button>
            </div>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handlePublish}
            >
              Publish Event
            </Button>
          )}
        </div>

        {/* Centered FileUploader */}
        {eventId && (
          <div className="flex justify-center mb-6">
            <FileUploader
              eventId={eventId}
              onUploadSuccess={() => setRefreshKey((prev) => prev + 1)}
              refreshKey={refreshKey}
            />
          </div>
        )}

        {/* Media Gallery */}
        <div className="flex-1 overflow-auto">
          {eventId ? (
            <MediaGallery
              eventId={eventId}
              key={refreshKey}
              onDeleteSuccess={() => setRefreshKey((prev) => prev + 1)}
            />
          ) : (
            <div className="text-center text-gray-500">
              No event selected for media management
            </div>
          )}
        </div>
      </div>

      {/* Edit Info Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Event Info</h2>
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
                    <label className="block text-sm font-bold capitalize mb-1">
                      {field}
                    </label>
                    {field === "eventDate" ? (
                      <input
                        type="date"
                        className="w-full p-2 rounded-md border-2 border-black shadow-sm"
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
                        className="w-full p-2 rounded-md border-2 border-black text-gray-900 shadow-sm"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            [field]: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full rounded-md border-2 border-black p-2 shadow-sm"
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
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventPage;
