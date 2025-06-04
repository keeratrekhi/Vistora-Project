import { Camera, Facebook, Globe, Instagram, Mail, Phone, Twitter } from "lucide-react";
import { PortfolioInfoModel } from "../../models/Portfolio";

interface EventFooterProps {
  orgInfo : PortfolioInfoModel
}

export const EventFooter: React.FC<EventFooterProps> = ({ orgInfo }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <a
                  href={`tel:${orgInfo.generalInfo.contact}`}
                  className="hover:text-gray-300"
                >
                  {orgInfo.generalInfo.contact}
                </a>
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <a
                  href={`mailto:${orgInfo.generalInfo.email}`}
                  className="hover:text-gray-300"
                >
                  {orgInfo.generalInfo.email}
                </a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {orgInfo.socialLinks?.websiteLink && (
                <a
                  href={orgInfo.socialLinks?.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  <Globe className="h-6 w-6" />
                </a>
              )}
              {orgInfo.socialLinks?.facebookLink && (
                <a
                  href={orgInfo.socialLinks?.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {orgInfo.socialLinks?.twitterLink && (
                <a
                  href={orgInfo.socialLinks?.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {orgInfo.socialLinks?.instagramLink && (
                <a
                  href={orgInfo.socialLinks?.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex items-center justify-center space-x-2">
          <span>Powered by</span>
          <span className="font-bold">Vistora</span>
          <Camera className="h-5 w-5" />
        </div>
      </div>
    </footer>
  );
};
