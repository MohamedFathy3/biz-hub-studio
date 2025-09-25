// layouts/MainLayout.tsx
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const LayoutContent = ({ children }: MainLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className={cn(
        "pt-16 transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6">
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

// Utility function for class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}