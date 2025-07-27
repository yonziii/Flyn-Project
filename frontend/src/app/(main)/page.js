"use client"; 
import React, { useEffect, useState, useRef, useCallback  } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getCanvases, registerSpreadsheet, refreshSchema } from '@/lib/api'; // Import API functions

import { FileSpreadsheet, LayoutTemplate, Paperclip, Star, MoreHorizontal, X, PiggyBank, Briefcase, Store, Wand2, UploadCloud, Camera, FolderUp, File as FileIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// 2. Modify the card to accept an onClick handler
const CanvasCreationCard = ({ icon, title, description, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-400 hover:shadow-md transition-all duration-200"
    >
      <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="ml-3 sm:ml-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
};

const RecentCanvasCard = ({ canvas, onClick }) => {
    const lastUpdated = new Date(canvas.updated_at).toLocaleString();

    // NEW: Handler for the "more options" button
    const handleMoreOptionsClick = (e) => {
        e.stopPropagation(); // Prevents the main onClick (navigation) from firing
        console.log("More options clicked for canvas:", canvas.name);
        // TODO: Implement a dropdown menu or other action here
    };

    return (
        // MODIFIED: Changed from <button> to <div> and added cursor-pointer
        <div 
            onClick={onClick}
            className="flex flex-col bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-lg transition-all duration-200 p-4 cursor-pointer"
        >
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-2">{canvas.name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* MODIFIED: Added the new onClick handler */}
                    <button onClick={handleMoreOptionsClick} className="p-1 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal size={16} className="text-gray-500 sm:scale-110" />
                    </button>
                </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 mb-4 flex-1 line-clamp-3">
                {canvas.schema_summary || "No summary available. Click to analyze."}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
            </div>
        </div>
    );
};



// --- Modal and Template Components ---

const templates = [
    { id: 'personal', title: 'Personal Monthly Budget', description: 'Track income, expenses, and savings goals. Perfect for managing day-to-day finances.', icon: <PiggyBank size={24} /> },
    { id: 'freelance', title: 'Freelance Project Tracker', description: 'Track income, billable expenses, and profitability for each project.', icon: <Briefcase size={24} /> },
    { id: 'business', title: 'Small Business Cash Flow', description: 'A simple ledger to monitor daily sales, costs, and cash on hand.', icon: <Store size={24} /> },
    { id: 'custom', title: 'Simple Tracker', description: 'A clean, blank canvas. Add your own columns and build a custom system.', icon: <Wand2 size={24} /> },
];

const TemplateCard = ({ template, isSelected, onSelect }) => (
    <button onClick={() => onSelect(template.id)} className={`flex items-start w-full p-4 text-left border rounded-lg transition-all duration-200 ${isSelected ? 'border-[#50D9C2] ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-400'}`}>
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">{template.icon}</div>
        <div className="ml-4">
            <h4 className="font-semibold text-gray-800">{template.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
        </div>
    </button>
);

const TemplateModal = ({ isOpen, onClose, onCreate }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    if (!isOpen) return null;

    const handleCreate = () => {
        if (selectedTemplate) {
            onCreate(selectedTemplate);
            onClose(); // Close modal after creation
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Choose a Template</h2>
                        <p className="text-gray-500 mt-1">Select a starting point for your new Canvas. We'll set it up in your Google Drive instantly.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>

                {/* Modal Body */}
                <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                        <TemplateCard key={template.id} template={template} isSelected={selectedTemplate === template.id} onSelect={setSelectedTemplate} />
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={handleCreate} disabled={!selectedTemplate} className="px-6 py-2.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] disabled:bg-gray-300 disabled:cursor-not-allowed">
                        Create Canvas
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileUploadModal = ({ isOpen, onClose, onCreate }) => {
    const [file, setFile] = useState(null);
    const [canvasName, setCanvasName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            setFile(selectedFile);
            // Smartly suggest a name based on the filename
            const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
            setCanvasName(nameWithoutExtension.replace(/_/g, ' ').replace(/-/g, ' '));
        }
    };

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragIn = (e) => { handleDrag(e); setIsDragging(true); };
    const handleDragOut = (e) => { handleDrag(e); setIsDragging(false); };
    const handleDrop = (e) => {
        handleDrag(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleCreate = () => {
        if (file && canvasName) {
            onCreate(file, canvasName);
            onClose();
        }
    };
    
    const resetState = () => {
        setFile(null);
        setCanvasName('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Create a New Canvas from a File</h2>
                        <p className="text-gray-500 mt-1">Upload a receipt image or a transaction statement (CSV, PDF).</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>

                <div className="my-6">
                    {!file ? (
                        <div onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                            <UploadCloud size={48} className="mx-auto text-gray-400" />
                            <p className="mt-4 font-semibold text-gray-700">Drag & drop your file here</p>
                            <p className="text-gray-500 my-2">or</p>
                            <button onClick={() => fileInputRef.current.click()} className="px-6 py-2 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5]">Browse Files</button>
                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx" />
                            <p className="text-xs text-gray-400 mt-6">Supported formats: JPG, PNG, PDF, CSV, XLSX</p>
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
                                <button onClick={resetState} className="p-2 rounded-full hover:bg-gray-200"><Trash2 size={20} className="text-gray-600" /></button>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="canvasName" className="block text-sm font-medium text-gray-700 mb-1">Name your Canvas</label>
                                <input type="text" id="canvasName" value={canvasName} onChange={(e) => setCanvasName(e.target.value)} placeholder="e.g., July 2025 Statement" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={handleCreate} disabled={!file || !canvasName.trim()} className="px-6 py-2.5 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] disabled:bg-gray-300">Create & Analyze Canvas</button>
                </div>
            </div>
        </div>
    );
};

const useGooglePicker = ({ onPicked }) => {
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
    
    const onPickedRef = useRef(onPicked);
    useEffect(() => {
        onPickedRef.current = onPicked;
    }, [onPicked]);

    useEffect(() => {
        const loadGisScript = () => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('picker', () => setPickerApiLoaded(true));
            };
            document.body.appendChild(script);
        };
        loadGisScript();
    }, []);

    const handleAuthClick = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("You must be logged in.");
            return;
        }
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
            },
        });
    };

    const pickerCallback = useCallback((data) => {
        if (data.action === 'picked') { // Simplified condition check
            const doc = data.docs[0];
            onPickedRef.current?.({ id: doc.id, name: doc.name });
        }
    }, []);

    const createPicker = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.provider_token;

        if (!token) {
            toast.error('Google authentication is required.');
            handleAuthClick();
            return;
        }
        if (!pickerApiLoaded) {
            toast.error('Picker API is not loaded yet.');
            return;
        }
    
        const view = new window.google.picker.View(window.google.picker.ViewId.SPREADSHEETS);
        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token)
            .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }, [pickerApiLoaded, pickerCallback]);
    
    return { openPicker: createPicker };
};

// --- Main Page Component ---

export default function HomePage() {
  const router = useRouter();

  // --- RESTORED & MAINTAINED: Original State Management ---
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Using your original name
  const [isFileModalOpen, setIsFileModalOpen] = useState(false); // Using your original name

  // --- NEW: State for Dynamic Canvases ---
  const [canvases, setCanvases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // RESTORED: Your original effect to fetch the user object
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // NEW: Effect to fetch canvases dynamically
  useEffect(() => {
    const fetchCanvases = async () => {
      try {
        setIsLoading(true);
        const userCanvases = await getCanvases();
        setCanvases(userCanvases);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch your canvases.');
        console.error(error);
      } finally {
        setIsLoading(false);
        
      }
    };
    fetchCanvases();
  }, []);

  // NEW: Logic for handling Google Sheet connection
const handleConnectSheet = async ({ id, name }) => {
    // NEW: Log the start of the connection process
    console.log(`Connecting sheet with ID: ${id} and Name: ${name}`); 
    const toastId = toast.loading('Connecting and analyzing your sheet...');
    try {
        await registerSpreadsheet(id, name);
        console.log("Spreadsheet registered successfully."); // NEW LOG
        
        await refreshSchema(id);
        console.log("Schema refresh triggered."); // NEW LOG
        
        toast.success(`'${name}' connected successfully!`, { id: toastId });
        
        router.push(`/document/${id}`);
    } catch (error) {
        // NEW: Log any errors that occur during the process
        console.error("Error in handleConnectSheet:", error); 
        toast.error(error.message || 'Failed to connect sheet.', { id: toastId });
    }
};
  
  const { openPicker } = useGooglePicker({ onPicked: handleConnectSheet });
  
  // MAINTAINED: Your original handlers for template/file creation
  const handleCreateFromTemplate = (templateId) => {
    console.log("Creating canvas from template:", templateId);
    // Future logic will go here
    const newDocumentId = crypto.randomUUID();
    router.push(`/document/${newDocumentId}`);
  };

  const handleCreateFromFile = (file, canvasName) => {
    console.log("Creating canvas from file:", file.name, "with name:", canvasName);
    // Future logic will go here
    const newDocumentId = crypto.randomUUID();
    router.push(`/document/${newDocumentId}`);
  };
  
  // Dynamic welcome message using the fetched user state
  const welcomeMessage = user ? `Welcome Back, ${user.user_metadata?.full_name || user.email}` : "Welcome Back!";

  return (
    <div className="overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* MODIFIED: Using your original state variable name */}
        <TemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateFromTemplate} />
        <FileUploadModal isOpen={isFileModalOpen} onClose={() => setIsFileModalOpen(false)} onCreate={handleCreateFromFile} />

        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4 sm:mt-0">
          {welcomeMessage}
        </h1>
        
        {/* --- Create New Canvas section --- */}
        <div className="mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Create New Canvas
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <CanvasCreationCard 
              onClick={openPicker}
              icon={<FileSpreadsheet size={24} className="text-gray-600 sm:scale-110" />} 
              title="Connect an Existing Sheet" 
              description="Link and let our AI analyze your current financial spreadsheet." 
            />
            {/* MODIFIED: Using your original state variable names */}
            <CanvasCreationCard 
              onClick={() => setIsModalOpen(true)}
              icon={<LayoutTemplate size={24} className="text-gray-600 sm:scale-110" />} 
              title="Start with a Flyn Template" 
              description="We'll create a new, optimized spreadsheet for you." 
            />
            <CanvasCreationCard 
              onClick={() => setIsFileModalOpen(true)}
              icon={<Paperclip size={24} className="text-gray-600 sm:scale-110" />} 
              title="Create from a File" 
              description="Instantly build a new Canvas by uploading a file." 
            />
          </div>
        </div>

        {/* --- Recent Canvas section (Now Dynamic) --- */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Recent Canvases
          </h2>
          {isLoading ? (
            <p className="mt-4 text-gray-500">Loading your canvases...</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {canvases.length > 0 ? (
                    canvases.map((canvas) => (
                        <RecentCanvasCard 
                            key={canvas.id} 
                            canvas={canvas}
                            onClick={() => router.push(`/document/${canvas.google_spreadsheet_id}`)}
                        />
                    ))
                ) : (
                    <p className="mt-4 text-gray-500 col-span-full">You don't have any canvases yet. Create one above to get started!</p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}