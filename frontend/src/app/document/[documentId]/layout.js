import AppHeader from "@/components/app-layout/AppHeader";
import AppSidebar from "@/components/app-layout/AppSidebar";
import { CanvasProvider } from "@/contexts/CanvasContext";

export default function AppLayout({ children }) {
  return (
    <CanvasProvider>
      <div className="flex h-screen bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
              <AppHeader />
              <main className="flex-1 p-8 overflow-y-auto">
                  {children}
              </main>
          </div>
      </div>
    </CanvasProvider>
  );
}