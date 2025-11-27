import React, { useState, useRef } from 'react';
import { DriveFile, User } from '../types';

interface HealthLockerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  files: DriveFile[];
  onUpload: (file: File, folder: 'insurance' | 'reports') => Promise<void>;
}

const HealthLocker: React.FC<HealthLockerProps> = ({ isOpen, onClose, user, files, onUpload }) => {
  const [activeTab, setActiveTab] = useState<'insurance' | 'reports'>('insurance');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  if (!user) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
                <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Login Required</h3>
                <p className="text-gray-600 mt-2 mb-6">You must be logged in with Google to access your Secure Health Locker.</p>
                <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300">Close</button>
            </div>
        </div>
      );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await onUpload(e.target.files[0], activeTab);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload document");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const currentFiles = files.filter(f => f.folder === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-indigo-400" />
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}'s Health Locker</h2>
                        <p className="text-indigo-200 text-sm">Secure Google Drive Storage</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-indigo-200 hover:text-white bg-indigo-700/50 p-2 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Navigation & Controls */}
            <div className="flex flex-col md:flex-row border-b border-gray-200">
                <div className="flex">
                    <button 
                        onClick={() => setActiveTab('insurance')}
                        className={`px-8 py-4 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'insurance' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Health Insurance
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`px-8 py-4 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Medical Reports
                    </button>
                </div>
                <div className="p-2 ml-auto flex items-center">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-all flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {isUploading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        )}
                        Upload {activeTab === 'insurance' ? 'Policy' : 'Report'}
                    </button>
                </div>
            </div>

            {/* File Grid */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                {currentFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg className="w-20 h-20 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
                        <p className="text-lg">This folder is empty.</p>
                        <p className="text-sm">Upload documents to safeguard them in your Google Drive.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {currentFiles.map((file) => (
                            <div key={file.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                    {file.type.includes('pdf') ? (
                                        <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                                    ) : (
                                        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-800 text-sm truncate" title={file.name}>{file.name}</h4>
                                <div className="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>{file.size}</span>
                                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Synced
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="bg-gray-100 p-3 text-center text-xs text-gray-500">
                Docs stored in: Google Drive / HealthShield AI / {user.email} / {activeTab}
            </div>
        </div>
    </div>
  );
};

export default HealthLocker;