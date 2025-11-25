// components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Users, 
  UserPlus, 
  MessageCircle,
  Store,
  Briefcase,
  Calendar, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/Context/SidebarContext";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { id: "newfeeds", label: "Newsfeed", icon: Home, href: "/" },
  { id: "Frindes", label: "Friends", icon: UserPlus, href: "/User" },
  { id: "stories", label: "Explore Stories", icon: BookOpen, href: "/stories" },
  { id: "store", label: "Store", icon: Store, href: "/store" },
  { id: "Alljobs", label: "My Jobs", icon: Briefcase, href: "/Alljobs" },
  { id: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
  { id: "Rent", label: "Rent Clinic", icon: Store, href: "/Rent" },
];

const morePages = [
  { id: "event", label: "Latest Event", icon: Calendar, href: "/event" },
];

const accountItems = [
  // { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  // { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* اللوجو */}
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "w-full"
          )}>
            <img
              src="/website_blue.png"
              alt="Dent Studio Logo"
              className={cn(
                "object-contain transition-all duration-300",
                isCollapsed ? "w-20 h-10" : "w-40 h-8" // حجم أصغر للوجو
              )}
            />
          
          </div>
          
          {/* زر التكبير/التصغير */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1 h-8 w-8 hover:bg-gray-100 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      {/* المحتوى */}
      <div className="h-[calc(100vh-80px)] flex flex-col justify-between py-4">
        {/* الأقسام الرئيسية */}
        <div className="flex-1 px-3">
          {/* Navigation Sections */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#039fb3] text-white shadow-lg shadow-blue-100"
                      : "text-gray-600 hover:text-[#039fb3] hover:bg-gray-50",
                    isCollapsed ? "justify-center" : "gap-3"
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <IconComponent className={cn(
                    "transition-colors flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-[#039fb3]",
                    "w-5 h-5"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="transition-colors whitespace-nowrap font-medium">
                      {item.label}
                    </span>
                  )}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* More Pages Section */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <nav className="space-y-1">
              {morePages.map((item) => {
                const isActive = location.pathname === item.href;
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-[#039fb3] text-white shadow-lg shadow-blue-100"
                        : "text-gray-600 hover:text-[#039fb3] hover:bg-gray-50",
                      isCollapsed ? "justify-center" : "gap-3"
                    )}
                    title={isCollapsed ? item.label : ""}
                  >
                    <IconComponent className={cn(
                      "transition-colors flex-shrink-0",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-[#039fb3]",
                      "w-5 h-5"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="transition-colors whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Account Section */}
        <div className="px-3">
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#039fb3] text-white shadow-lg shadow-blue-100"
                      : "text-gray-600 hover:text-[#039fb3] hover:bg-gray-50",
                    isCollapsed ? "justify-center" : "gap-3"
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <IconComponent className={cn(
                    "transition-colors flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-[#039fb3]",
                    "w-5 h-5"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="transition-colors whitespace-nowrap font-medium">
                      {item.label}
                    </span>
                  )}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* زر التكبير/التصغير للحالة المطوية */}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-center p-2 hover:bg-gray-100 mt-3"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};