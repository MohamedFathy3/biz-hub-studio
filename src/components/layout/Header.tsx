import {
  Search,
  Home,
  Zap,
  Video,
  User,
  MessageCircle,
  Bell,
  Moon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <header className="h-16 bg-card border-b border-border fixed top-0 left-64 right-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Start typing to search..."
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground"}>
            {({ isActive }) => (
              <Button variant="ghost" size="sm" className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Home className="w-5 h-5" />
              </Button>
            )}
          </NavLink>

          {/* Store */}
          <NavLink to="/store" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground"}>
            {({ isActive }) => (
              <Button variant="ghost" size="sm" className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Zap className="w-5 h-5" />
              </Button>
            )}
          </NavLink>

          {/* Stories */}
          <NavLink to="/stories" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground"}>
            {({ isActive }) => (
              <Button variant="ghost" size="sm" className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Video className="w-5 h-5" />
              </Button>
            )}
          </NavLink>

          {/* Profile */}
          <NavLink to="/profile" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground"}>
            {({ isActive }) => (
              <Button variant="ghost" size="sm" className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <User className="w-5 h-5" />
              </Button>
            )}
          </NavLink>

          {/* Messages */}
          <NavLink to="/messages" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground"}>
            {({ isActive }) => (
              <Button variant="ghost" size="sm" className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <MessageCircle className="w-5 h-5" />
              </Button>
            )}
          </NavLink>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-primary">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <MessageCircle className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="sm">
            <Moon className="w-5 h-5" />
          </Button>

          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
            <AvatarFallback>SZ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
