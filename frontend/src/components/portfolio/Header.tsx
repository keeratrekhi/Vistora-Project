import React from "react";
import { User2 } from "lucide-react";
import { PortfolioInfoModel } from "../../models/Portfolio";

// interface HeaderProps {
//   info?: PortfolioInfoModel;
// }
interface HeaderProps{
  info?:{
    name: string;
    description: string;
    image: string;
    logo:string;
  };
}

const Header: React.FC<HeaderProps> = ({ info }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {info?.logo ? (
              <img
                src={info.logo}
                alt="Logo"
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <User2 className="h-10 w-10 text-gray-700" />
            )}
            <h1 className="ml-3 text-xl font-bold text-gray-800">
              {info?.name || "Your Name"}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
