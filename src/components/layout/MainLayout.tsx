// layouts/MainLayout.tsx
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

// 🔥 أضف function cn هنا
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const LayoutContent = ({ children }: MainLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* 🔥 السايدبار يظهر في الديسكتوب فقط */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <Header />
      
      <main className={cn(
        "pt-16 transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-64" // 🔥 margin فقط في الديسكتوب
      )}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <LayoutContent children={children} />
    </SidebarProvider>
  );
};