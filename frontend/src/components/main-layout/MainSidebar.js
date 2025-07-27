"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, LayoutTemplate, Settings, HelpCircle, LogOut, ChevronDown, PanelRight } from 'lucide-react';
import { getSession, signOut } from '@/lib/auth';

// Update NavItem to use Link and accept an href prop
const NavItem = ({ icon, text, active, sidebarOpen, href = "#" }) => (
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

export default function MainSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

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

    return (
        <aside
            className={`h-screen ${
                sidebarOpen ? 'w-65' : 'w-20'
            } flex flex-col bg-white border-r border-gray-200 transition-all duration-200 ${
                !sidebarOpen ? 'justify-center items-center' : ''
            }`}
        >
        {/* Logo & Toggle */}
        <div className="group w-full">
            <div
                className={`relative flex h-15 w-full ${
                sidebarOpen
                    ? 'flex-row items-center justify-between px-6'
                    : 'flex-col justify-center items-center'
                }`}
                style={{ cursor: !sidebarOpen ? 'pointer' : 'default' }}
                onClick={
                !sidebarOpen
                    ? () => setSidebarOpen(true)
                    : undefined
                }
            >
                {sidebarOpen ? (
                <>
                    <div className="flex items-center">
                    <Image src="/flyn.png" alt="Flyn Logo" width={32} height={32} />
                    <span className="text-xl font-bold text-gray-800 ml-3">Flyn</span>
                    </div>
                    <button
                    className="p-1.5 rounded-lg hover:bg-gray-100 ml-3"
                    onClick={() => setSidebarOpen(false)}
                    >
                    <PanelRight
                        size={20}
                        className="text-gray-800 transition-transform duration-200"
                    />
                    </button>
                </>
                ) : (
                <PanelRight size={28} className="text-gray-800" />
                )}
            </div>
            <div className="w-full border-b border-gray-200" />
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center w-full">
                <div className={`w-full ${sidebarOpen ? 'flex flex-row items-center justify-between p-4 gap-3' : 'flex items-center justify-center py-6'}`}>
                    <div className="flex items-center">
                        <img src="/rys.jpg" alt="User Avatar" className="w-10 h-10 rounded-full" />
                        {sidebarOpen && (
                            <div className="flex-1 leading-4 ml-3">
                                <h4 className="font-semibold">Rohyoonseo</h4>
                                <span className="text-xs text-gray-500 truncate">{user ? user.email : '...'}</span>
                            </div>
                        )}
                    </div>
                {sidebarOpen && (
                <button className="p-1.5 rounded-lg hover:bg-gray-100 ml-3">
                    <ChevronDown size={20} />
                </button>
                )}
            </div>
            {/* Always show border under profile */}
            <div className="w-full border-b border-gray-200" />
        </div>

        <div className="flex-1 px-4 py-2">
            {sidebarOpen && (
            <p className="text-sm font-semibold text-gray-400 px-4 mt-2 mb-1">
                Main Menu
            </p>
            )}
            <nav className="flex flex-col">
            <NavItem icon={<Home size={20} />} text="Home" active sidebarOpen={sidebarOpen} />
            <NavItem icon={<LayoutTemplate size={20} />} text="Canvas" sidebarOpen={sidebarOpen} />
            </nav>
        </div>

        {/* Footer Menu */}
            <div className="px-4 py-2 border-t border-gray-200">
                <nav className="flex flex-col">
                    {/* FIX: Added href and active props to all NavItems */}
                    <NavItem href="#" icon={<Settings size={20} />} text="System Settings" active={false} sidebarOpen={sidebarOpen} />
                    <NavItem href="#" icon={<HelpCircle size={20} />} text="Help Center" active={false} sidebarOpen={sidebarOpen} />
                </nav>
                {sidebarOpen && <hr className="my-2 border-gray-200" />}
                <div onClick={handleSignOut} className="cursor-pointer">
                    <NavItem icon={<LogOut size={20} />} text="Logout Account" active={false} sidebarOpen={sidebarOpen} />
                </div>
            </div>
        </aside>
    );
}