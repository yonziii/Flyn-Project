import SheetSidebar from "@/components/sheet-layout/SheetSidebar";
import SheetHeader from "@/components/sheet-layout/SheetHeader";

export default function SheetLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar ini akan spesifik untuk halaman Sheet */}
      <SheetSidebar /> 
      
      <div className="flex-1 flex flex-col">
        {/* Header ini juga spesifik untuk halaman Sheet */}
        <SheetHeader />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Konten dari halaman Sheet Anda akan muncul di sini */}
          {children}
        </main>
      </div>
    </div>
  );
}