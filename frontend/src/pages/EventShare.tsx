import { useEffect, useState } from "react";
import { DownloadableImageCard } from "../components/DownloadableImageCard";
import { EventFooter } from "../components/event/EventFooter";
import { EventHeader } from "../components/event/EventHeader";
import { Event, EventMedia } from "../models/Event";
import { PortfolioInfoModel } from "../models/Portfolio";
import { Navigate } from "react-router-dom";
import { NOT_FOUND_ROUTE } from "../constants/RouteContant";

const sampleOrgInfo: PortfolioInfoModel = {
  generalInfo: {
    name: "Jems Photography",
    description:
      "Join us for an incredible gathering of tech minds, featuring cutting-edge presentations and networking opportunities.",
    contact: "+1 (555) 123-4567",
    email: "contact@techconf2025.com",
  },
  socialLinks: {
    websiteLink: "https://example.com",
    facebookLink: "https://facebook.com",
    twitterLink: "https://twitter.com",
    instagramLink: "https://instagram.com",
  },
  logo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
  coverImage: "",
};

const sampleEventInfo: Event = {
  id: "1",
  title: "Annual Developer Summit",
  description:
    "A beautiful web application showcasing modern design principles",
  eventDate: "Wednesday, March 5, 2025",
  location: "Online",
  coverImageUrl:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
  isPublished: true,
  accessType: "public",
  pin: 1234,
  publishedDateTime: "2025-03-01T12:00:00Z",
};

const eventMediaItems : EventMedia[] = [
  {
    id: "1",
    fileName: "image1.jpg",
    url: "https://picsum.photos/400/300",
    type: "image",
  },
  {
    id: "2",
    fileName: "image2.jpg",
    url: "https://picsum.photos/400/300",
    type: "image",
  },
  {
    id: "3",
    fileName: "image3.jpg",
    url: "https://picsum.photos/400/300",
    type: "image",
  },
  {
    id: "4",
    fileName: "image4.jpg",
    url: "https://picsum.photos/400/300",
    type: "image",
  }
]

const EventShare = () => {
  const [eventInfo, setEventInfo] = useState<Event | null>(null);
  const [orgInfo, setOrgInfo] = useState<PortfolioInfoModel | null>(null);
  const [mediaItems, setMediaItems] = useState<EventMedia[]>([]);

  useEffect(() => {
    //TODO : fetch data from backend
    setEventInfo(sampleEventInfo);
    setOrgInfo(sampleOrgInfo);
    setMediaItems(eventMediaItems);
  }, []);

  if (!eventInfo || !orgInfo) {
    return <Navigate to={NOT_FOUND_ROUTE} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <EventHeader eventInfo={sampleEventInfo} orgInfo={orgInfo} />

      <main className="pt-20 pb-16">
        <section className="relative h-[60vh] bg-gradient-to-br from-indigo-600 via-purple-700 to-black overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-3xl bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {sampleEventInfo.title}
              </h1>
              <p className="text-xl text-gray-200 mb-6">
                {sampleEventInfo.description}
              </p>
              <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-white border border-white/20">
                {sampleEventInfo.eventDate}
              </div>
            </div>
          </div>
        </section>

        <section
          id="photos"
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Event Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediaItems.map((media, index) => (
              <DownloadableImageCard
                key={index}
                imageUrl={media.url}
                className="transform hover:scale-[1.02] transition-transform duration-300"
              />
            ))}
          </div>
        </section>
      </main>

      <EventFooter orgInfo={orgInfo} />
    </div>
  );
};

export default EventShare;
