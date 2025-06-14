import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { LogOut, User } from "lucide-react";
import VistoraLogo from "@/assets/logos/captus-name-logo.jpg";
import HamburgerMenu from "./HamburgerMenu";

interface NavbarProps {
  onProfileClick: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onProfileClick, onLogout, onToggleSidebar, isSidebarOpen }) => {
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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 z-50 px-6 flex items-center justify-between shadow-2xl backdrop-blur-lg animate-fade-in">
      {/* Left Section - Hamburger Menu & Logo */}
      <div className="flex items-center gap-4">
        <HamburgerMenu isOpen={isSidebarOpen} onClick={onToggleSidebar} />
        <div className="inline-flex items-center justify-center w-24 h-12 rounded-xl hover:scale-105 transition-transform duration-300">
          <img 
            src={VistoraLogo} 
            alt="Vistora" 
            className="object-contain filter brightness-110 drop-shadow-lg" 
          />
        </div>
      </div>

      {/* Right Section - User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-110"
        >
          {currentUser?.username?.substring(0, 2).toUpperCase() || "U"}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-60 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-xl shadow-2xl border border-slate-700/50 py-2 z-50 animate-scale-in backdrop-blur-lg">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <p className="font-semibold text-white text-base drop-shadow-sm">Super User</p>
              <p className="text-sm text-slate-400">superuser@Vistora.com</p>
            </div>

            {/* Navigation Options */}
            <div className="py-1">
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-200 text-white group rounded-lg mx-2"
              >
                <User size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-sm font-medium group-hover:text-cyan-100 transition-colors">Profile</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200 text-white group rounded-lg mx-2"
              >
                <LogOut size={16} className="text-red-400 group-hover:text-red-300 transition-colors" />
                <span className="text-sm font-medium group-hover:text-red-100 transition-colors">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;