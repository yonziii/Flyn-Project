"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // 1. Import Link for navigation
import { useParams, usePathname } from 'next/navigation'; // 2. Import hooks
import { 
    MessageSquare,
    Sheet,
    ChevronDown, 
    PanelRight,
    Plus,
    Settings, 
    HelpCircle, 
    LogOut
} from 'lucide-react';
import { getSession, signOut } from '@/lib/auth';

// Komponen NavItem (tidak berubah)
const NavItem = ({ href, icon, text, active, sidebarOpen }) => (
    <Link
        href={href}
        className={`flex items-center py-2.5 px-4 my-1 rounded-lg transition-colors duration-200 ${
        active ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-100'
        }`}
    >
        {icon}
        {sidebarOpen && <span className="ml-3">{text}</span>}
    </Link>
);

// Data contoh untuk riwayat chat yang lebih panjang
const recentChats = [
    "My budget is tight this month, what are my top 3 spending categories?", "How much have I spent so far this month?", "What was my last transaction at Starbucks?", "Show me all my transportation expenses from last week.", "How much did I spend on groceries in May?", "Add a cash expense: bought lunch for $15.", "Change the 'Kopi Kita' expense category to 'Food'.", "Delete the duplicate transaction from yesterday.", "How does my spending on entertainment compare to last month?", "Compare food expenses between last month and this month", "What's my biggest single purchase this week?", "Generate a spending report for Q2.", "Did I spend more on coffee or on snacks?", "List all transactions above $50.", "What's the total amount I've spent at Amazon?", "Show my spending trend for the last 6 months."
];

export default function AppSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null); // Add state for user
    const router = useRouter();
    const { documentId } = useParams();
    const pathname = usePathname();

    // Fetch user session on component load
    useEffect(() => {
        const fetchUser = async () => {
            const session = await getSession();
            setUser(session?.user ?? null);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const chatPath = `/document/${documentId}`;
    const sheetPath = `/sheet/${documentId}`;

    return (
        <aside
            className={`h-screen ${
                sidebarOpen ? 'w-65' : 'w-20'
            } flex flex-col bg-white border-r border-gray-200 transition-all duration-300`}
        >
            {/* Bagian Atas: Logo & Profil (Sama seperti MainSidebar) */}
            <div className={`p-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {sidebarOpen && (
                    <button
                        className="flex items-center gap-3 focus:outline-none"
                        onClick={() => router.push('/')}
                        tabIndex={0}
                        aria-label="Go to homepage"
                    >
                        <Image src="/flyn.png" alt="Flyn Logo" width={32} height={32} />
                        <span className="text-xl font-bold text-gray-800">Flyn</span>
                    </button>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                    <PanelRight size={20} className="text-gray-800" />
                </button>
            </div>
            <div className="w-full border-b border-gray-200" />
            <div className={`p-4 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                <img 
                    src={user?.user_metadata?.avatar_url || "/rys.jpg"} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full" 
                />
                {sidebarOpen && (
                    <div className="flex-1 leading-4 ml-3">
                        {/* Use full_name from metadata, with a fallback to 'User' */}
                        <h4 className="font-semibold">{user?.user_metadata?.full_name || 'User'}</h4>
                        <span className="text-xs text-gray-500 truncate">{user ? user.email : '...'}</span>
                    </div>
                )}
            </div>
            <div className="w-full border-b border-gray-200" />

            {/* Menu Utama (Tidak bisa di-scroll) */}
            <div className="px-4 py-2">
                {sidebarOpen && (
                    <p className="text-sm font-semibold text-gray-400 px-4 mt-2 mb-1">
                        Main Menu
                    </p>
                )}
                <nav className="flex flex-col">
                    <NavItem 
                        href={chatPath} 
                        icon={<MessageSquare size={20} />} 
                        text="Chat" 
                        active={pathname === chatPath} 
                        sidebarOpen={sidebarOpen} 
                    />
                    <NavItem 
                        href={sheetPath} 
                        icon={<Sheet size={20} />} 
                        text="Sheet" 
                        active={pathname === sheetPath} 
                        sidebarOpen={sidebarOpen} 
                    />
                </nav>
            </div>

            {/* Riwayat Chat Terbaru (Bisa di-scroll) */}
            <div className="flex-1 relative px-4 py-2 overflow-y-auto">
                {sidebarOpen && (
                    <p className="text-sm font-semibold text-gray-400 px-4 mt-2 mb-1">
                        Newest Chat
                    </p>
                )}
                <nav className="flex flex-col">
                    {recentChats.map((chat, index) => (
                        <a
                            key={index}
                            href="#"
                            className={`flex items-center py-2 px-4 my-0.5 rounded-lg text-sm transition-colors duration-200
                                ${index === 0 && sidebarOpen ? 'bg-gray-100 font-semibold text-gray-900' : 'hover:bg-gray-100 text-gray-600'}
                            `}
                        >
                            {sidebarOpen ? (
                                <span className="truncate">{chat}</span>
                            ) : (
                                <span className="text-xs">...</span>
                            )}
                        </a>
                    ))}
                </nav>
            </div>
            
            {/* Tombol Start New Chat & Menu Bawah (Tidak bisa di-scroll) */}
            <div className="px-4 py-2 border-t border-gray-200">
                <div className="pb-4">
                     {sidebarOpen && (
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] transition-colors shadow-lg">
                            <Plus size={20} />
                            Start new chat
                        </button>
                     )}
                </div>
                <nav className="flex flex-col">
                    {/* FIX: Menambahkan prop href dan active ke NavItem di bawah */}
                    <NavItem href="#" icon={<Settings size={20} />} text="System Settings" active={false} sidebarOpen={sidebarOpen} />
                    <NavItem href="#" icon={<HelpCircle size={20} />} text="Help Center" active={false} sidebarOpen={sidebarOpen} />
                </nav>
                {sidebarOpen && <hr className="my-2 border-gray-200" />}
                <div onClick={handleSignOut} className="cursor-pointer">
                    <NavItem href="#" icon={<LogOut size={20} />} text="Logout Account" active={false} sidebarOpen={sidebarOpen} />
                </div>
            </div>
        </aside>
    );
}
