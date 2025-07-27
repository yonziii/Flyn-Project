"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { processReceipt } from '@/lib/api';
import { useCanvas } from '@/contexts/CanvasContext';

import { Cloud, Copy, File as FileIcon, FileSpreadsheet, ImageIcon, Mic, MoreVertical, PencilLine, Plus, RefreshCw, SendHorizontal, Share2, ThumbsDown, ThumbsUp, X, UploadCloud, Trash2 } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import toast from 'react-hot-toast';

// --- Modal Component for New Entry ---
const NewEntryModal = ({ isOpen, onClose, canvasName, spreadsheetId }) => {
    const [file, setFile] = useState(null);
    const [note, setNote] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const modalFileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setNote('');
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) setFile(selectedFile);
    };
    
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragIn = (e) => { handleDrag(e); setIsDragging(true); };
    const handleDragOut = (e) => { handleDrag(e); setIsDragging(false); };
    const handleDrop = (e) => {
        handleDrag(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file || !spreadsheetId) return;
        setIsProcessing(true);
        const toastId = toast.loading('Analyzing your document...');
        const formData = new FormData();
        formData.append('image', file);
        formData.append('spreadsheet_id', spreadsheetId);
        formData.append('worksheet_name', 'Transactions');
        if (note) formData.append('note', note);

        try {
            const result = await processReceipt(formData);
            toast.success(result.message || 'Successfully added entry!', { id: toastId });
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to process document.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const resetFile = () => setFile(null);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add New Entry</h2>
                        <p className="text-gray-500 mt-1">Upload a receipt or statement to add to "{canvasName}".</p>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>
                
                                <div className="my-6">
                    {!file ? (
                        <div 
                            onDragEnter={handleDragIn} 
                            onDragLeave={handleDragOut} 
                            onDragOver={handleDrag} 
                            onDrop={handleDrop} 
                            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        >
                            <UploadCloud size={48} className="mx-auto text-gray-400" />
                            <p className="mt-4 font-semibold text-gray-700">Drag & drop your file here</p>
                            <p className="text-gray-500 my-2">or</p>
                            <button onClick={() => modalFileInputRef.current.click()} className="px-6 py-2 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5]">
                                Browse Files
                            </button>
                            <input type="file" ref={modalFileInputRef} onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                            <p className="text-xs text-gray-400 mt-6">Supported formats: JPG, PNG, PDF</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md"><FileIcon size={32} className="text-gray-500" /></div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 truncate">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button onClick={resetFile} className="p-2 rounded-full hover:bg-gray-200"><Trash2 size={20} className="text-gray-600" /></button>
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <label htmlFor="canvasName" className="block text-sm font-medium text-gray-700 mb-1">Add a Note or Instruction (Optional)</label>
                        <input type="text" id="canvasName" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., This was a business lunch" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <button onClick={onClose} disabled={isProcessing} className="px-6 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={handleAnalyze} disabled={!file || isProcessing} className="px-6 py-2.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] disabled:bg-gray-300 disabled:cursor-wait">
                        {isProcessing ? 'Analyzing...' : 'Add & Analyze Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Chat Page Components ---
const UserMessage = ({ name, time, message }) => (
    <div className="flex items-start gap-4 group relative">
        <img src="/rys.jpg" alt={name} className="w-8 h-8 rounded-full" />
        <div className="flex-1"><div className="flex items-baseline gap-2"><p className="font-semibold text-gray-800">{name}</p><p className="text-xs text-gray-400">{time}</p></div><p className="mt-1 text-gray-700">{message}</p><div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tippy content="Copy" delay={0} placement="bottom"><button className="p-1 rounded hover:bg-gray-100"><Copy size={18} className="text-gray-500" /></button></Tippy><Tippy content="Rewrite" delay={0} placement="bottom"><button className="p-1 rounded hover:bg-gray-100"><PencilLine size={18} className="text-gray-500" /></button></Tippy></div></div>
    </div>
);
const BotMessage = ({ name, time, message }) => (
    <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ddfff9]"><img src="/flyn.png" alt={name} width={20} height={20} /></div>
        <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><div className="flex items-baseline gap-2"><p className="font-semibold text-gray-800">{name}</p><p className="text-xs text-gray-400">{time}</p></div><div className="flex items-center gap-4 mt-2 mb-3"><button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"><FileSpreadsheet size={16} /> Open Sheet</button><button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"><Share2 size={16} /> Share</button></div><p className="text-gray-700 leading-relaxed">{message}</p><div className="flex items-center justify-between mt-4"><div className="flex items-center gap-2 text-gray-500"><Tippy content="Regenerate" delay={0} placement="bottom"><button className="p-1 hover:bg-gray-100 rounded-md"><RefreshCw size={16} /></button></Tippy><Tippy content="Copy" delay={0} placement="bottom"><button className="p-1 hover:bg-gray-100 rounded-md"><Copy size={16} /></button></Tippy><Tippy content="Thumbs Up" delay={0} placement="bottom"><button className="p-1 hover:bg-gray-100 rounded-md"><ThumbsUp size={16} /></button></Tippy><Tippy content="Thumbs Down" delay={0} placement="bottom"><button className="p-1 hover:bg-gray-100 rounded-md"><ThumbsDown size={16} /></button></Tippy><Tippy content="More Options" delay={0} placement="bottom"><button className="p-1 hover:bg-gray-100 rounded-md"><MoreVertical size={16} /></button></Tippy></div></div></div>
    </div>
);
const FileUploadPreview = ({ file, onRemove }) => (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center gap-3 mb-3 animate-in fade-in-50">
        {file.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-10 h-10 object-cover rounded-md" />
        ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md"><FileIcon size={24} className="text-gray-500" /></div>
        )}
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-gray-200">
            <X size={18} className="text-gray-600" />
        </button>
    </div>
);

// --- Main Chat Page ---
export default function ChatPage() {
    const params = useParams();
    const spreadsheetId = params.documentId;
    const { setCanvasName, setSpreadsheetId } = useCanvas();
    
    const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
    const [input, setInput] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const chatFileInputRef = useRef(null);

    useEffect(() => {
        if (spreadsheetId) {
            // Tell the context what the current canvas is
            setCanvasName("Personal Finance 2025"); // This could be fetched later
            setSpreadsheetId(spreadsheetId);
        }
    }, [spreadsheetId, setCanvasName, setSpreadsheetId]);
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() && !attachedFile) return;
        console.log("Sending message:", { text: input, file: attachedFile });
        setInput('');
        setAttachedFile(null);
    };

    const handleFileAttach = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
        }
    };
    
    const showSendButton = input.trim() || attachedFile;

    return (
        <>
            <NewEntryModal 
                isOpen={isNewEntryModalOpen} 
                onClose={() => setIsNewEntryModalOpen(false)} 
                canvasName="Personal Finance 2025"
                spreadsheetId={spreadsheetId}
            />
            <div className="flex flex-col h-full">
                <button 
                    onClick={() => setIsNewEntryModalOpen(true)} 
                    className="absolute top-20 right-8 z-10 flex items-center gap-2 px-4 py-2 bg-[#50D9C2] text-white font-semibold rounded-lg shadow-lg hover:bg-[#45B8A5] transition-colors"
                >
                    <Plus size={20} /> New Entry
                </button>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-8 max-w-4xl mx-auto w-full relative">
                    <div className="text-center my-6"><span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Today 2:45 PM</span></div>
                    <UserMessage name="Rohyoonseo" time="2:45 PM" message="My budget is tight this month. Where's my biggest opportunity to save?" />
                    <BotMessage name="Flyn" time="2:46 PM" message="Your top three spending categories are 'Dining Out' ($115), 'Transportation' ($95), and 'Subscriptions' ($40). The biggest opportunity seems to be in 'Dining Out'. Reducing it by 2-3 times a week could save you a significant amount." />
                </div>
                
                <div className="p-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto w-full">
                        {attachedFile && <FileUploadPreview file={attachedFile} onRemove={() => setAttachedFile(null)} />}
                        
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <form onSubmit={handleSendMessage} className="flex items-start gap-4">
                                <textarea rows="1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Flyn anything, or attach a file..." className="flex-1 bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-400" />
                                <div className="flex items-center gap-2">
                                    <Tippy content="Mic" delay={0} placement="bottom"><button type="button" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><Mic size={20} className="text-gray-600" /></button></Tippy>
                                    {showSendButton && (
                                        <Tippy content="Send" delay={0} placement="bottom">
                                            <button type="submit" className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 animate-in fade-in-50">
                                                <SendHorizontal size={20} />
                                            </button>
                                        </Tippy>
                                    )}
                                </div>
                            </form>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                                <input type="file" ref={chatFileInputRef} onChange={handleFileAttach} className="hidden" />
                                <button onClick={() => chatFileInputRef.current.click()} className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 p-2 rounded-lg"><FileIcon size={18} /> Upload File</button>
                                <button onClick={() => chatFileInputRef.current.click()} className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 p-2 rounded-lg"><ImageIcon size={18} /> Upload Image</button>
                                <button className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 p-2 rounded-lg"><Cloud size={18} /> From Drive</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}