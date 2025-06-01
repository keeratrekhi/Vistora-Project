import { useEffect, useState } from "react";
import { PortfolioEventProps } from "../../models/Portfolio";
import ImageCard from "../ImageCard";
import { Link } from "react-router-dom";

const dummyEvents: PortfolioEventProps[] = [
  {
    id: 1,
    title: "Event 1",
    description:
      "A beautiful web application showcasing modern design principles",
    image:
      "https://th.bing.com/th?id=OIP.6Axh0-PYY8UQVpfS08w3gwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    date: "Wednesday, March 5, 2025",
    link: "https://example.com/project1",
  },
  {
    id: 2,
    title: "Event 2",
    description: "Mobile-first responsive design with cutting-edge features",
    image:
      "https://th.bing.com/th?id=OIP.Mvcr0QDsGXOx29cSBfXd6AHaE7&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    date: "Friday, March 7, 2025",
    link: "https://example.com/project1",
  },
  {
    id: 3,
    title: "Event 3",
    description: "An innovative solution for modern business needs",
    image:
      "https://th.bing.com/th?id=OIP.EfKuvd8N9o-aNDIH2JF7aAHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    date: "Friday, March 7, 2025",
    link: "https://example.com/project1",
  },
  {
    id: 4,
    title: "Event 4",
    description: "An innovative solution for modern business digitally",
    image:
      "https://th.bing.com/th?id=OIP.EfKuvd8N9o-aNDIH2JF7aAHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    date: "Friday, March 10, 2025",
    link: "https://example.com/project1",
  },
  {
    id: 5,
    title: "Event 5",
    description: "An innovative solution for modern business digitally",
    image:
      "https://th.bing.com/th?id=OIP.EfKuvd8N9o-aNDIH2JF7aAHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    date: "Friday, March 10, 2025",
    link: "https://example.com/project1",
  },
];

const PortfolioEvent = () => {
  const [events, setEvents] = useState<PortfolioEventProps[]>([]);

  useEffect(() => {
    //fetch events from backend
    setEvents(dummyEvents);
  }, []);

  if (events.length === 0) {
    return(
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Coming Soon</h2>
              <p className="text-lg text-gray-600">We're working on something amazing!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Our Work
          </h2>

          <div className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {events.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2"
                >
                  <Link to={item.link} className="flex-1 block h-full">
                    <div className="h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                      <div className="p-6">
                        <EventCard {...item} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EventCard: React.FC<PortfolioEventProps> = (
  props: PortfolioEventProps
) => {
  return (
    <ImageCard
      imageURL={props.image}
      title={props.title}
      description={props.description}
    />
  );
};

export default PortfolioEvent;
