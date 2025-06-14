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
import { Calendar, MapPin, FileText, Sparkles, ArrowLeft, Plus } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50 shadow-2xl animate-scale-in">
          <LoadingSpinner message="Creating your amazing event..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-pink-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Create New Event
          </h1>
          <p className="text-slate-400 text-lg">Bring your vision to life with a stunning event</p>
        </div>

        {/* Form Container */}
        <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Title */}
            <div className="animate-slide-in-left" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <label className="text-lg font-semibold text-white">Event Title</label>
              </div>
              <input
                type="text"
                placeholder="Enter your amazing event title"
                {...register("title")}
                className={`w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70 ${
                  errors.title ? "border-red-500 focus:ring-red-500" : "border-slate-600"
                }`}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-2 animate-shake">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg flex items-center justify-center border border-pink-500/30">
                  <FileText className="w-4 h-4 text-pink-400" />
                </div>
                <label className="text-lg font-semibold text-white">Description</label>
              </div>
              <textarea
                placeholder="Describe what makes your event special..."
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70 resize-none ${
                  errors.description ? "border-red-500 focus:ring-red-500" : "border-slate-600"
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-2 animate-shake">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Event Date and Location Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Event Date */}
              <div className="animate-slide-in-left" style={{animationDelay: '0.5s'}}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                  </div>
                  <label className="text-lg font-semibold text-white">Event Date</label>
                </div>
                <input
                  type="date"
                  {...register("eventDate")}
                  className={`w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70 ${
                    errors.eventDate ? "border-red-500 focus:ring-red-500" : "border-slate-600"
                  }`}
                />
                {errors.eventDate && (
                  <p className="text-red-400 text-sm mt-2 animate-shake">
                    {errors.eventDate.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <label className="text-lg font-semibold text-white">Location</label>
                </div>
                <input
                  type="text"
                  placeholder="Where will the magic happen?"
                  {...register("location")}
                  className={`w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70 ${
                    errors.location ? "border-red-500 focus:ring-red-500" : "border-slate-600"
                  }`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-2 animate-shake">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 animate-fade-in" style={{animationDelay: '0.7s'}}>
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="px-8 py-4 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline group-hover:-translate-x-1 transition-transform duration-300" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl group font-semibold"
              >
                <Plus className="w-4 h-4 mr-2 inline group-hover:rotate-180 transition-transform duration-500" />
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};