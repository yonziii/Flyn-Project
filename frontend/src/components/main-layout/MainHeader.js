import React from 'react';
import { Search, Bell, Plus, Menu } from 'lucide-react';

export default function MainHeader() {
    return (
        <header className="bg-white border-b border-gray-200 h-[61px] flex items-center">
        <div className="flex items-center justify-between w-full px-4">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search or type a command" 
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] transition-colors text-sm">
                <Plus size={18} />
                <span>New Canvas</span>
            </button>
            </div>
        </div>
        </header>
    );
}