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
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const sidebarItems = [
  { id: "newfeeds", label: "Newsfeed", icon: Home, href: "/" },
  { id: "badges", label: "Badges", icon: Award, href: "/badges" },
  { id: "stories", label: "Explore Stories", icon: BookOpen, href: "/stories" },
  { id: "groups", label: "Popular Groups", icon: Users, href: "/groups" },
  { id: "profile", label: "Author Profile", icon: UserPlus, href: "/profile" },
  { id: "store", label: "Store", icon: Store, href: "/store" },
  { id: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs" },
   { title: "Messages", label: "messages", icon: MessageCircle,href: "/messages" },
];

const morePages = [
  { id: "email", label: "Email Box", icon: Mail, href: "/email", badge: "584" },
  { id: "hotel", label: "Near Hotel", icon: MapPin, href: "/hotel" },
  { id: "event", label: "Latest Event", icon: Calendar, href: "/event" },
  { id: "live", label: "Live Stream", icon: Video, href: "/live" },
];

const accountItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-card border-r border-border fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-primary">Sociala.</span>
        </div>
      </div>

      <div className="p-4">
        {/* New Feeds Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            New Feeds
          </h3>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* More Pages Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            More Pages
          </h3>
          <nav className="space-y-1">
            {morePages.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Account
          </h3>
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};