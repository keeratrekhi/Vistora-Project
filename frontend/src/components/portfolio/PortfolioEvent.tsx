import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageCard from "../ImageCard";
import {
  getPortfolioevents,
  EventDto,
  getPorteventCover,
  CoverDto,
  CoverFile,
} from "@/services/DashboardService";

interface Props {
  id: string | null;      // this is the userId
}

type EnrichedEvent = EventDto & { coverUrl: string };

const PortfolioEvent: React.FC<Props> = ({ id }) => {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        // 1) fetch all events for this user
        const evts = await getPortfolioevents(id);

        // 2) for each event, fetch its cover array
        const enriched: EnrichedEvent[] = await Promise.all(
          evts.map(async (evt) => {
            const { covers } = await getPorteventCover(evt.id);
            // take the first cover if it exists, else fall back to evt.image
            const coverUrl =
              covers.length > 0 ? covers[0].url : evt.image;
            return { ...evt, coverUrl };
          })
        );

        setEvents(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id || loading) {
    return <p className="text-center py-12">Loading…</p>;
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent ">
            Coming Soon
          </h2>
          <p className="text-lg bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            We’re working on something amazing!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-scree py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Our Work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2"
            >
              <a href={evt.publishedUrl}  target="_blank"  rel="noopener noreferrer" className="flex-1 block h-full">
                <div className="h-full backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    <ImageCard
                      imageURL={evt.coverUrl}
                      title={evt.title}
                      description={evt.description}
                    />
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioEvent;
