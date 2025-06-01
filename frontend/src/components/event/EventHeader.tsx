import { Event } from "../../models/Event";
import { PortfolioInfoModel } from "../../models/Portfolio";
import { Building2} from "lucide-react";

interface EventHeaderProps {
    eventInfo: Event;
    orgInfo : PortfolioInfoModel
  }
  
  export const EventHeader: React.FC<EventHeaderProps> = ({ orgInfo }) => {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {orgInfo.logo ? (
                <img 
                  src={orgInfo.logo} 
                  alt="Organization Logo" 
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-gray-700" />
              )}
              <h1 className="ml-3 text-xl font-bold text-gray-800">
                {orgInfo.generalInfo.name}
              </h1>
            </div>
          </div>
        </div>
      </header>
    );
  };