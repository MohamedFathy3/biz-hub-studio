// components/Header.tsx
import {
  Search,
  Home,
  Zap,
  Video,
  Users,
  MessageCircle,
  Bell,
  Moon,
  Menu,
  GamepadIcon,
  ChevronDown,
Plus,
} from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { useContext } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";
import { useSidebar } from "@/Context/SidebarContext";

export const Header = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
    const { user, loading } = useContext(AuthContext);

  return (
<header className={cn(
  "h-16 bg-white border-b border-gray-200 fixed top-0 z-40 transition-all duration-300 shadow-sm",
  isCollapsed ? "left-16 right-0" : "left-64 right-0"
)}>
  <div className="flex items-center justify-between h-full px-4 w-full">

    {/* Left Section - Logo and Search */}
    <div className="flex items-center gap-4 flex-1 max-w-3xl">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-full md:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
     
        <span className="text-xl font-bold text-gray-900 hidden md:block">socile</span>
      </div>

 
    </div>

    {/* Center Section - Navigation Icons */}
    <div className="flex items-center gap-0 absolute left-1/2 transform -translate-x-1/2">
      <NavLink 
        to="/" 
        className={({ isActive }) => cn(
          "flex items-center justify-center w-28 h-full border-b-2 transition-all",
          isActive 
            ? "border-blue-600 text-blue-600" 
            : "border-transparent text-gray-500 hover:bg-gray-100"
        )}
      >
        <Button variant="ghost" className="h-12 w-full rounded-none px-0">
          <Home className="w-6 h-6" />
        </Button>
      </NavLink>

      <NavLink 
        to="/videos" 
        className={({ isActive }) => cn(
          "flex items-center justify-center w-28 h-full border-b-2 transition-all",
          isActive 
            ? "border-blue-600 text-blue-600" 
            : "border-transparent text-gray-500 hover:bg-gray-100"
        )}
      >
        <Button variant="ghost" className="h-12 w-full rounded-none px-0">
          <Video className="w-6 h-6" />
        </Button>
      </NavLink>

      <NavLink 
        to="/store" 
        className={({ isActive }) => cn(
          "flex items-center justify-center w-28 h-full border-b-2 transition-all",
          isActive 
            ? "border-blue-600 text-blue-600" 
            : "border-transparent text-gray-500 hover:bg-gray-100"
        )}
      >
        <Button variant="ghost" className="h-12 w-full rounded-none px-0">
          <Zap className="w-6 h-6" />
        </Button>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => cn(
          "flex items-center justify-center w-28 h-full border-b-2 transition-all",
          isActive 
            ? "border-blue-600 text-blue-600" 
            : "border-transparent text-gray-500 hover:bg-gray-100"
        )}
      >
        <Button variant="ghost" className="h-12 w-full rounded-none px-0">
          <Users className="w-6 h-6" />
        </Button>
      </NavLink>

     
    </div>

    {/* Right Section - User Menu */}
    <div className="flex items-center gap-4 flex-1 justify-end">
      
      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full md:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="sm" className="p-2 hover:bg-blue-500 rounded-full relative">
          <MessageCircle className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="sm" className="p-6 hover:bg-blue-500 rounded-full relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute top-1 right-3 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
            5
          </Badge>
        </Button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-2 ml-2 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
        <Avatar className="w-8 h-8">
        <AvatarImage src={user.profile_image || 'https://via.placeholder.com/150'} />
          <AvatarFallback className="bg-gray-300">U</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.first_name}</span>
      </div>

     
    </div>
  </div>
</header>

  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}