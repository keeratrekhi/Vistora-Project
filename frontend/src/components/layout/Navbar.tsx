import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { LogOut, User } from "lucide-react";
import VistoraLogo from "@/assets/logos/captus-name-logo.jpg";

interface NavbarProps {
  onProfileClick: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onProfileClick, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    onProfileClick();
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: {
          id: string;
          username: string;
        };
      };
    }) => state.user
  );

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-50 border-b border-gray-200 z-50 px-6 flex items-center justify-between shadow-sm">
      {/* Left Section - Logo */}
      <div className="flex items-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl">
          <img src={VistoraLogo} alt="Vistora" className="object-contain" />
        </div>
      </div>

      {/* Right Section - User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center font-medium text-sm hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {currentUser?.username?.substring(0, 2).toUpperCase() || "U"}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-neutral text-base">Super User</p>
              <p className="text-sm text-gray-500">superuser@Vistora.com</p>
            </div>

            {/* Navigation Options */}
            <div className="py-1">
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-neutral"
              >
                <User size={16} />
                <span className="text-sm font-medium">Profile</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-logout-red"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
