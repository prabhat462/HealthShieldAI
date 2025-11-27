import React, { useState, useEffect, useRef } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage, DriveFile, User } from '../types';

interface ChatbotSectionProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  user: User | null;
  lockerFiles: DriveFile[];
}

const ChatbotSection: React.FC<ChatbotSectionProps> = ({ isModalOpen, setIsModalOpen, user, lockerFiles }) => {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'I am your Senior Insurance Advocate. My job is to fight for your claim. Upload your rejection letter or policy document, and I will tell you exactly what legal or procedural remedy is available to you. Let\'s proceed.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // File Upload State (Local)
  const [localAttachments, setLocalAttachments] = useState<File[]>([]);
  // File Selection State (From Locker)
  const [selectedLockerFileIds, setSelectedLockerFileIds] = useState<string[]>([]);
  const [showLockerSelector, setShowLockerSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isModalOpen]);

  // Helper to convert file to base64
  const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setLocalAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeLocalAttachment = (index: number) => {
    setLocalAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleLockerFile = (fileId: string) => {
      if (selectedLockerFileIds.includes(fileId)) {
          setSelectedLockerFileIds(prev => prev.filter(id => id !== fileId));
      } else {
          setSelectedLockerFileIds(prev => [...prev, fileId]);
      }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && localAttachments.length === 0 && selectedLockerFileIds.length === 0) || isLoading) return;

    const attachmentNames = [
        ...localAttachments.map(f => f.name),
        ...lockerFiles.filter(f => selectedLockerFileIds.includes(f.id)).map(f => f.name + " (Cloud)")
    ];
    
    // Optimistic UI update
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      attachmentNames: attachmentNames.length > 0 ? attachmentNames : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setShowLockerSelector(false); // Close selector if open

    // Store refs to current selection to send
    const currentLocalFiles = [...localAttachments];
    const currentLockerIds = [...selectedLockerFileIds];

    // Clear selections
    setLocalAttachments([]);
    setSelectedLockerFileIds([]);

    try {
      // Process Local attachments
      const attachmentParts = [];
      for (const file of currentLocalFiles) {
        const part = await fileToGenerativePart(file);
        attachmentParts.push(part);
      }

      // Add placeholder for bot response
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      // Pass lockerFileIds AND user email to the service.
      const reader = await streamChatResponse(messages, userMsg.text, attachmentParts, currentLockerIds, user?.email);
      
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        
        setMessages(prev => 
            prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg)
        );
      }
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      let errMsg = "An error occurred.";
      if (error.message.includes("API_KEY")) errMsg = "System Error: Missing API Key Configuration.";
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: `Error: ${errMsg}. Please try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chatbot" className="py-16 md:py-24 bg-indigo-50 overflow-hidden relative">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div>
                    <span className="text-indigo-600 font-semibold uppercase tracking-wide">Your Personal Advocate</span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">Meet ClaimAdvocate AI™</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Never feel lost during a claim rejection again. Upload your rejection letters, policy documents, or hospital bills. Our specialist AI advocates for you, explaining rejections and drafting appeals.
                    </p>
                    
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-8 flex items-center gap-3 bg-indigo-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                    >
                        <span>Launch Advocate AI</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </button>
                </div>

                 {/* Static Preview */}
                 <div className="hidden lg:flex justify-center relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">AI</div>
                            <div>
                                <div className="font-bold text-gray-900">ClaimAdvocate AI</div>
                                <div className="text-xs text-green-500">Online</div>
                            </div>
                        </div>
                        <div className="space-y-4 opacity-50 pointer-events-none">
                             <div className="flex justify-start">
                                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none text-sm">
                                    Upload your rejection letter. I can help.
                                </div>
                             </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-3xl">
                            <button onClick={() => setIsModalOpen(true)} className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                Start Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Full Screen Chat Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold shadow-md text-lg">AI</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg md:text-xl">ClaimAdvocate AI</h3>
                                <p className="text-xs md:text-sm text-gray-500">
                                    {user ? `Helping ${user.name}` : 'Upload policies, bills, or rejection letters'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-gray-50/50 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] md:max-w-[70%] space-y-1`}>
                                    <div className={`
                                      p-4 text-sm md:text-base shadow-sm
                                      ${msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-none'}
                                    `}>
                                        {msg.text}
                                    </div>
                                    {msg.attachmentNames && msg.attachmentNames.length > 0 && (
                                        <div className={`flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.attachmentNames.map((name, idx) => (
                                                <span key={idx} className="text-xs flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"></path></svg>
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex space-x-1 items-center h-6">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Locker File Selector Overlay */}
                    {showLockerSelector && (
                        <div className="absolute bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-fade-in-up z-10 max-h-60 overflow-y-auto">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-700">Select Files from Locker</h4>
                                <button onClick={() => setShowLockerSelector(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            {lockerFiles.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No files in your locker. Upload them in the Health Locker dashboard.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {lockerFiles.map(file => (
                                        <div 
                                            key={file.id} 
                                            onClick={() => toggleLockerFile(file.id)}
                                            className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 text-sm ${selectedLockerFileIds.includes(file.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedLockerFileIds.includes(file.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                {selectedLockerFileIds.includes(file.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                        {/* Chips for selected files */}
                        {(localAttachments.length > 0 || selectedLockerFileIds.length > 0) && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {localAttachments.map((file, idx) => (
                                    <div key={`loc-${idx}`} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm text-indigo-700 whitespace-nowrap">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button onClick={() => removeLocalAttachment(idx)} className="text-indigo-400 hover:text-indigo-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                                {lockerFiles.filter(f => selectedLockerFileIds.includes(f.id)).map((file) => (
                                    <div key={`rem-${file.id}`} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-sm text-blue-700 whitespace-nowrap">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path></svg>
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button onClick={() => toggleLockerFile(file.id)} className="text-blue-400 hover:text-blue-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex items-end gap-3">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" multiple />
                            
                            <div className="flex flex-col gap-1">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Attach from Device">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                </button>
                                {user && (
                                    <button onClick={() => setShowLockerSelector(!showLockerSelector)} className={`p-2 rounded-lg transition-colors ${showLockerSelector ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Attach from Health Locker">
                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex-grow relative">
                                <textarea 
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Type your message..." 
                                  className="w-full py-3 px-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-[50px] bg-gray-50"
                                  rows={1}
                                  disabled={isLoading}
                                />
                            </div>

                            <button 
                                onClick={handleSendMessage}
                                disabled={isLoading || (!inputValue.trim() && localAttachments.length === 0 && selectedLockerFileIds.length === 0)}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-md transition-all mb-1"
                            >
                                <svg className="w-6 h-6 transform rotate-90 translate-x-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </section>
  );
};

export default ChatbotSection;