import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat, GenerateContentResponse, Part } from "@google/genai";

interface ChatbotSectionProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const ChatbotSection: React.FC<ChatbotSectionProps> = ({ isModalOpen, setIsModalOpen }) => {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'Hello! I am ClaimAdvocate AI. I can analyze your policy documents or rejection letters to help you with your claim. Please upload a document or ask me a question to get started.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  // File Upload State
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Gemini Chat session only when modal opens to save resources
    if (isModalOpen && !chatSession) {
      const session = createChatSession();
      setChatSession(session);
    }
  }, [isModalOpen, chatSession]);

  useEffect(() => {
    if (isModalOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isModalOpen]);

  // Helper to convert file to base64
  const fileToGenerativePart = async (file: File): Promise<Part> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachments.length === 0) || !chatSession || isLoading) return;

    const attachmentNames = attachments.map(f => f.name);
    
    // Optimistic UI update
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      attachmentNames: attachmentNames.length > 0 ? attachmentNames : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    const currentAttachments = [...attachments];
    setAttachments([]); // Clear attachments immediately after sending
    setIsLoading(true);

    try {
      // Prepare parts for multimodal request
      const parts: Part[] = [];
      
      // Add text part if exists
      if (userMsg.text) {
        parts.push({ text: userMsg.text });
      }

      // Add attachment parts
      for (const file of currentAttachments) {
        const part = await fileToGenerativePart(file);
        parts.push(part);
      }

      // Send message to Gemini
      // Note: The SDK allows passing Part[] directly to message
      const resultStream = await chatSession.sendMessageStream({ message: parts });
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of resultStream) {
         const chunkText = (chunk as GenerateContentResponse).text;
         if (chunkText) {
             fullText += chunkText;
             setMessages(prev => 
               prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg)
             );
         }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'I apologize, but I encountered an error processing your request. Please ensure your files are valid images or PDFs and try again.' 
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
                    <ul className="mt-8 space-y-4">
                        {[
                          "Upload PDFs or Images of your policy & claims.",
                          "Get instant explanations for rejections.",
                          "Auto-draft appeal letters based on your specific case."
                        ].map((item, i) => (
                          <li key={i} className="flex items-start">
                              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                    </ul>
                    
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-8 flex items-center gap-3 bg-indigo-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                    >
                        <span>Launch Advocate AI</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </button>
                </div>

                {/* Static Preview / Illustration */}
                <div className="hidden lg:flex justify-center relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full transform rotate-3 hover:rotate-0 transition-transform duration-500">
                         {/* Mock Chat Header */}
                        <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">AI</div>
                            <div>
                                <div className="font-bold text-gray-900">ClaimAdvocate AI</div>
                                <div className="text-xs text-green-500">Online</div>
                            </div>
                        </div>
                        {/* Mock Messages */}
                        <div className="space-y-4 opacity-50 pointer-events-none">
                             <div className="flex justify-start">
                                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none text-sm">
                                    Upload your rejection letter. I can help.
                                </div>
                             </div>
                             <div className="flex justify-end">
                                <div className="bg-white border border-gray-200 text-gray-600 p-3 rounded-2xl rounded-bl-none text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                                    Rejection_Letter.pdf
                                </div>
                             </div>
                             <div className="flex justify-end">
                                <div className="bg-white border border-gray-200 text-gray-600 p-3 rounded-2xl rounded-bl-none text-sm">
                                    Why was this rejected?
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
                                <p className="text-xs md:text-sm text-gray-500">Upload policies, bills, or rejection letters</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => setIsModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
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
                                    {/* Attachment Indicators */}
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

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                        {/* Selected Attachments Preview */}
                        {attachments.length > 0 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm text-indigo-700 whitespace-nowrap">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button onClick={() => removeAttachment(idx)} className="text-indigo-400 hover:text-indigo-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex items-end gap-3">
                            {/* File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden" 
                                accept="image/*,application/pdf"
                                multiple
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors mb-1"
                                title="Attach Image or PDF"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            </button>

                            {/* Text Input */}
                            <div className="flex-grow relative">
                                <textarea 
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Type your message here..." 
                                  className="w-full py-3 px-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-[50px] bg-gray-50"
                                  rows={1}
                                  disabled={isLoading}
                                />
                            </div>

                            {/* Send Button */}
                            <button 
                                onClick={handleSendMessage}
                                disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-md transition-all mb-1"
                            >
                                <svg className="w-6 h-6 transform rotate-90 translate-x-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            AI can make mistakes. Please verify important information with a professional.
                        </p>
                    </div>
                </div>
            </div>
        )}
    </section>
  );
};

export default ChatbotSection;