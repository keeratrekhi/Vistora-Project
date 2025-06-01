import { PortfolioDto } from "@/models/Portfolio";
import { Facebook, Twitter, Instagram, Youtube, Globe } from "lucide-react";

interface FooterProps {
  info?: PortfolioDto;
}

const Footer: React.FC<FooterProps> = ({ info }: FooterProps) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {info?.email && info?.contact && (
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <p className="mb-2">{info?.email || "email@example.com"}</p>
              <p className="mb-2">{info?.contact || "+1 234 567 890"}</p>
              <p>
                {info?.city}, {info?.country}
              </p>
            </div>
          )}

          <div>
            {(info?.facebookLink ||
              info?.twitterLink ||
              info?.instagramLink ||
              info?.youtubeLink ||
              info?.websiteLink) && (
              <h3 className="text-xl font-bold mb-4">Social Media</h3>
            )}
            <div className="flex space-x-4">
              {info?.facebookLink && (
                <a
                  href={info.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-6 w-6 hover:text-gray-300" />
                </a>
              )}
              {info?.twitterLink && (
                <a
                  href={info.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-6 w-6 hover:text-gray-300" />
                </a>
              )}
              {info?.instagramLink && (
                <a
                  href={info.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-6 w-6 hover:text-gray-300" />
                </a>
              )}
              {info?.youtubeLink && (
                <a
                  href={info.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-6 w-6 hover:text-gray-300" />
                </a>
              )}
              {info?.websiteLink && (
                <a
                  href={info.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-6 w-6 hover:text-gray-300" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>
            &copy; {new Date().getFullYear()} {info?.name || "Your Name"}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
