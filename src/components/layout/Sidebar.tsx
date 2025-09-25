// components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Award, 
  BookOpen, 
  Users, 
  UserPlus, 
  Mail, 
  MapPin, 
  Calendar, 
  Video, 
  Settings, 
  BarChart3,
  Briefcase,
  MessageCircle,
  Store,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/Context/SidebarContext";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { id: "newfeeds", label: "Newsfeed", icon: Home, href: "/" },
  { id: "Frindes", label: "Frindes ", icon: UserPlus, href: "/User" },
  { id: "stories", label: "Explore Stories", icon: BookOpen, href: "/stories" },
  { id: "store", label: "Store", icon: Store, href: "/store" },
  { id: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
  { id: "Rent", label: "Rent", icon: Store, href: "/Rent" },

];

const morePages = [
  { id: "event", label: "Latest Event", icon: Calendar, href: "/event" },
];

const accountItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-primary">Sociala.</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {/* New Feeds Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              New Feeds
            </h3>
          )}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* More Pages Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              More Pages
            </h3>
          )}
          <nav className="space-y-1">
            {morePages.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                    </>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Account
            </h3>
          )}
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};