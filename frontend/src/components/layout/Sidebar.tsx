import React, { useEffect, useState } from "react";
import {
  CREATE_EVENT_ROUTE,
  DASHBOARD_ROUTE,
  ADMIN_EVENTS_ROUTE,
  PORTFOLIO_INFO_ROUTE,
} from "../../constants/RouteContant";
import { Briefcase, Calendar, Home, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  linkTo: string;
}

interface SidebarProps {
  isOpen: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    linkTo: DASHBOARD_ROUTE,
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    linkTo: ADMIN_EVENTS_ROUTE,
  },
  {
    id: "create-event",
    label: "Create Event",
    icon: Plus,
    linkTo: CREATE_EVENT_ROUTE,
  },
  {
    id: "portfolio",
    label: "Portfolio Information",
    icon: Briefcase,
    linkTo: PORTFOLIO_INFO_ROUTE,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const section = sidebarItems.find(r =>
      window.location.pathname === r.linkTo
    );

    if(section){
      setActiveSection(section.id);
    }else{
      setActiveSection("home");
    }
  }, [window.location.pathname]);

  const handleSidebarItemClick = (itemId: string, routeTo: string) => {
    setActiveSection(itemId);
    navigate(routeTo);
  };

  return (
    <aside className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out z-40 ${
      isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'
    }`}>
      <nav className="p-4">
        <ul className="space-y-3">
          {sidebarItems.map((item, index) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
                <button
                  onClick={() => handleSidebarItemClick(item.id, item.linkTo)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-105 group ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                      : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-all duration-300 ${
                      isActive 
                        ? "text-white drop-shadow-sm" 
                        : "text-cyan-400 group-hover:text-cyan-300"
                    }`}
                  />
                  <span className={`text-sm transition-all duration-300 ${
                    isActive 
                      ? "text-white font-semibold drop-shadow-sm" 
                      : "group-hover:text-cyan-100"
                  }`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;