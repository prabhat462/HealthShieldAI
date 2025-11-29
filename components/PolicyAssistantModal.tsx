import React, { useState, useRef } from 'react';

interface PolicyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PolicyAssistantModal: React.FC<PolicyAssistantModalProps> = ({ isOpen, onClose }) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleLaunchZapier = () => {
    // Open Zapier in a new tab since it blocks iframes
    window.open('https://new-interface-318c0f.zapier.app/page', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
        <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar / File Upload Context */}
            <div className="w-full md:w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col h-auto md:h-full shrink-0">
                <div className="mb-6">
                    <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                        <span>🤖</span> Policy Q&A Bot
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Self-service digital assistant for your insurance policies.
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Context Documents</h4>
                    <p className="text-xs text-gray-500 mb-4">
                        Upload your health insurance policy PDF here to prepare for the session.
                    </p>

                    {/* Attachment List */}
                    <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                        {attachments.length === 0 && (
                            <p className="text-xs text-gray-400 italic text-center py-2">No documents attached</p>
                        )}
                        {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-lg text-xs text-indigo-700">
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button onClick={() => removeAttachment(idx)} className="text-indigo-400 hover:text-red-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden" 
                        accept=".pdf"
                        multiple
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-4 bg-white border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Attach Policy PDF
                    </button>
                    {attachments.length > 0 && (
                        <div className="mt-2 text-[10px] text-green-600 flex items-center justify-center gap-1 bg-green-50 py-1 rounded text-center leading-tight">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <div>Files ready. Please upload to the bot interface.</div>
                        </div>
                    )}
                </div>

                <div className="hidden md:block mt-auto">
                   <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-800 leading-relaxed">
                            <strong>Note:</strong> This tool uses Zapier AI. You will be redirected to a secure interface to upload your PDF and ask questions.
                        </p>
                   </div>
                </div>
            </div>

            {/* Main Area: Launch Screen */}
            <div className="flex-grow flex flex-col h-full bg-white relative">
                 <div className="md:hidden flex justify-end p-2 absolute top-0 right-0 z-10">
                    <button 
                        onClick={onClose}
                        className="bg-white/80 p-2 rounded-full shadow-sm text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                 </div>

                <div className="hidden md:block absolute top-4 right-6">
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                 
                {/* Launch Content */}
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                    <div className="bg-orange-100 p-6 rounded-full mb-6 animate-pulse">
                        <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Launch Policy Q&A Bot</h2>
                    <p className="text-gray-600 max-w-md mb-8">
                        Upload your policy PDF and ask natural-language questions about coverage, limits, and terms. Our AI extracts and summarizes key details instantly.
                    </p>

                    <button 
                        onClick={handleLaunchZapier}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        <span>Open Assistant</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </button>

                    <p className="mt-8 text-sm text-gray-400">
                        Powered by Zapier Interfaces & OpenAI
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PolicyAssistantModal;