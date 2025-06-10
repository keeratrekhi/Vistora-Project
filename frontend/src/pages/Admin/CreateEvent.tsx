import { ADMIN_EVENTS_ROUTE } from "@/constants/RouteContant";
import { AccessType } from "@/enums/AccessType";
import { CreateEventModel } from "@/models/Event";
import { createEvent } from "@/services/EventsService";
import DateWrapper from "@/utils/DateUtil";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import FormInput from "@/components/ui/Form/FormInput";
import LoadingSpinner from "@/components/ui/loading-spinner";

const formSchema = z.object({
  title:      z.string().min(1, "Event title is required"),
  description:z.string().optional(),
  eventDate:  z.string().optional(),
  location:   z.string().optional(),
  requirePin: z.boolean().default(false),
  pin:        z.string()
                .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
                .optional(),
});
type FormData = z.infer<typeof formSchema>;

export const CreateEvent = () => {
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  // watch requirePin to toggle PIN input
  const requirePin = watch("requirePin");

  const navigate = useNavigate();
  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: { id: string; username: string };
      };
    }) => state.user
  );

  const handleFormSubmit = async (data: FormData) => {
    setIsCreatingEvent(true);
    try {
      await createEvent(
        {
          title:       data.title,
          description: data.description || "",
          eventDate:   new DateWrapper(data.eventDate || new Date()),
          location:    data.location || "",
          coverImage:  "",
          isPublished: false,
          accessType:  AccessType.Public,
          pin:         data.requirePin ? Number(data.pin) : null,
        } as CreateEventModel,
        currentUser.id
      );
      toast.success("Event created successfully!");
      navigate(ADMIN_EVENTS_ROUTE);
    } catch {
      toast.error("Error creating event. Please try again later.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  if (isCreatingEvent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <LoadingSpinner message="Creating event..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-5">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <FormInput
            label="Title"
            type="text"
            name="title"
            placeholder="Enter event title"
            register={register}
            error={errors.title}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? "border-red-300" : "border-gray-300"
            }`}
          />

          {/* Description */}
          <FormInput
            label="Description"
            type="textarea"
            name="description"
            placeholder="Enter event description"
            register={register}
            error={errors.description}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? "border-red-300" : "border-gray-300"
            }`}
          />

          {/* Event Date */}
          <FormInput
            label="Event Date"
            type="date"
            name="eventDate"
            placeholder="Select event date"
            register={register}
            error={errors.eventDate}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.eventDate ? "border-red-300" : "border-gray-300"
            }`}
          />

          {/* Location */}
          <FormInput
            label="Location"
            type="text"
            name="location"
            placeholder="Enter event location"
            register={register}
            error={errors.location}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.location ? "border-red-300" : "border-gray-300"
            }`}
          />

          {/* Require PIN */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("requirePin")}
              id="requirePin"
              className="mr-2"
            />
            <label htmlFor="requirePin">Require 4-digit PIN to view?</label>
          </div>

          {/* PIN input */}
          {requirePin && (
            <FormInput
              label="PIN"
              type="text"
              name="pin"
              placeholder="Enter 4-digit PIN"
              register={register}
              error={errors.pin}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.pin ? "border-red-300" : "border-gray-300"
              }`}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="px-6 py-2 text-slate-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
