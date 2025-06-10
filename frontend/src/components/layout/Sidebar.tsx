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
  linkTo: string; // Optional linkTo property for navigation
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

const Sidebar: React.FC = () => {
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
    <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-gray-50 border-r border-gray-200 shadow-sm">
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleSidebarItemClick(item.id, item.linkTo)}
                  className={`w-full flex items-center mt-3 gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                      : "text-neutral hover:bg-hover-gray"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-white" : "text-primary"}
                  />
                  <span className="text-md">{item.label}</span>
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
