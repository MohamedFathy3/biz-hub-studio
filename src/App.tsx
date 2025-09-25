import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Groups from "./pages/Groups";
import Badges from "./pages/Badges";
import Profile from "./pages/profile";
import Stories from "./pages/videos";
import NotFound from "./pages/NotFound";
import Event from "./pages/event";
import Messages from "./pages/messages";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProDetail from "./pages/ProDetail";
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import UsersList from './pages/UsersList';
import Rent from './pages/rent';
import RentDetail from './pages/rentDetail';

import { AuthProvider } from "@/Context/AuthContext";
import PrivateRoute from "@/components/layout/PrivateRoute"; // تأكد من المسار الصحيح

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/store" element={<PrivateRoute element={<Store />} />} />
            <Route path="/profile/edit/:id?" element={<EditProfile />} />

            <Route path="/ProDetail/:id" element={<PrivateRoute element={<ProDetail />} />} />
            <Route path="/Rent" element={<PrivateRoute element={<Rent />} />} />
           
            <Route path="/RentDetail/:id" element={<PrivateRoute element={<RentDetail />} />} />
            <Route path="/jobs" element={<PrivateRoute element={<Jobs />} />} />
            <Route path="/User" element={<PrivateRoute element={<UsersList />} />} />
            <Route path="/jobs/:id" element={<PrivateRoute element={<JobDetail />} />} />
            <Route path="/groups" element={<PrivateRoute element={<Groups />} />} />
            <Route path="/badges" element={<PrivateRoute element={<Badges />} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/stories" element={<PrivateRoute element={<Stories />} />} />
            <Route path="/event" element={<PrivateRoute element={<Event />} />} />
            <Route path="/messages" element={<PrivateRoute element={<Messages />} />} />
            <Route path="/profile/:id" element={<UserProfile />} />

            <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
            {/* المسارات المفتوحة */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* المسار الافتراضي لصفحة غير موجودة */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
