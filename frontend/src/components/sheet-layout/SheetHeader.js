"use client";
import React from 'react';
import { Download, FileSpreadsheet, Trash2, Share, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function AppHeader() {
    const router = useRouter();

    return (
        <header className="bg-white p-4 border-b border-gray-200 h-[65px]">
            <div className="flex items-center justify-between">
                {/* Judul Dokumen */}
                <div className="flex items-center gap-3">
                    <Tippy content="Back to Home" delay={0} placement="bottom">
                        <button
                            className="p-2 rounded-lg hover:bg-gray-100"
                            onClick={() => router.push('/')}
                            aria-label="Back to homepage"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <h2 className="font-semibold text-gray-800">
                        Personal Finance 2025
                    </h2>
                    <span className="text-xs font-medium bg-green-600 text-white px-2 py-1 rounded-md">
                        Google Sheet
                    </span>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                    <Tippy content="Refresh" delay={0} placement="bottom">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <RefreshCcw size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Open Sheet" delay={0} placement="bottom">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <FileSpreadsheet size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Share" delay={0} placement="bottom">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <Share size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Export Sheet" delay={0} placement="bottom">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] transition-colors text-sm">
                            {/* You can use any icon you like, here using FileSpreadsheet */}
                            <Download size={18} />
                            <span>Export Sheet</span>
                        </button>
                    </Tippy>
                </div>
            </div>
        </header>
    );
}