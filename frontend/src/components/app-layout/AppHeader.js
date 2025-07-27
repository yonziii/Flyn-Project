"use client";
import React from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import { Plus, FileSpreadsheet, Trash2, Share, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function AppHeader() {
    const router = useRouter();

    const { canvasName, spreadsheetId, isRefreshing, refreshSchema } = useCanvas();

    const handleOpenSheet = () => {
        if (spreadsheetId) {
            window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
        }
    };
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
                        {canvasName}
                    </h2>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        Gemini 2.5
                    </span>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                    <Tippy content="Refresh Schema" delay={0} placement="bottom">
                        {/* MODIFIED: Wire up refresh functionality */}
                        <button 
                            onClick={() => refreshSchema(spreadsheetId)} 
                            // MODIFIED: Also disable the button if the ID isn't ready yet
                            disabled={isRefreshing || !spreadsheetId}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={20} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </Tippy>
                    <Tippy content="Open Sheet" delay={0} placement="bottom">
                        <button onClick={handleOpenSheet} className="p-2 rounded-lg hover:bg-gray-100">
                            <FileSpreadsheet size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Share" delay={0} placement="bottom">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <Share size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Delete" delay={0} placement="bottom">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <Trash2 size={20} className="text-gray-600" />
                        </button>
                    </Tippy>
                </div>
            </div>
        </header>
    );
}