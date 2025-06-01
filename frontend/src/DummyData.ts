import { Event, EventMedia } from "./models/Event";

export const sampleEvents: Event[] = [
  {
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
  },
  {
    id: "2",
    title: "Tech Innovators Conference",
    description:
      "An event to explore the latest innovations in technology and software development.",
    eventDate: "Friday, April 10, 2025",
    location: "San Francisco, CA",
    coverImageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070",
    isPublished: true,
    accessType: "private",
    pin: 5678,
    publishedDateTime: "2025-03-15T10:00:00Z",
  },
  {
    id: "3",
    title: "Design Thinking Workshop",
    description:
      "A hands-on workshop to learn and apply design thinking principles.",
    eventDate: "Monday, May 20, 2025",
    location: "New York, NY",
    coverImageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2070",
    isPublished: false,
    accessType: "public",
    pin: 9101,
    publishedDateTime: "2025-04-01T09:00:00Z",
  },
  {
    id: "4",
    title: "AI & Machine Learning Summit",
    description:
      "Dive into the world of AI and machine learning with industry experts.",
    eventDate: "Thursday, June 15, 2025",
    location: "Online",
    coverImageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2070",
    isPublished: true,
    accessType: "public",
    pin: 1122,
    publishedDateTime: "2025-05-01T14:00:00Z",
  },
];

export const sampleEventMedias : EventMedia[] = [
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
  },
];
