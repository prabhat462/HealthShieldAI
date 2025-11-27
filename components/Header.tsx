import React, { useState } from 'react';

interface HeaderProps {
  onOpenChat: () => void;
  onOpenPolicy: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenChat, onOpenPolicy }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChat();
    setIsMenuOpen(false);
  };

  const handlePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenPolicy();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm fixed w-full z-50 top-0">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                <span>🩺</span> HealthShield AI
            </a>
            <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={handlePolicyClick} 
                  className="text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none flex items-center gap-1"
                >
                  Policy AI
                </button>
                <button 
                  onClick={handleChatClick} 
                  className="text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  Advocate AI
                </button>
                <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#roadmap" className="text-gray-600 hover:text-indigo-600 transition-colors">Roadmap</a>
                <a href="#compare" className="text-gray-600 hover:text-indigo-600 transition-colors">Compare</a>
            </div>
            <div className="flex items-center space-x-4">
                 <a href="#contact" className="hidden md:inline-block bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300">
                    Join Waitlist
                </a>
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        ) : (
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        )}
                    </svg>
                </button>
            </div>
        </nav>
        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
                <button 
                  onClick={handlePolicyClick} 
                  className="block w-full text-left text-gray-700 py-3 px-6 hover:bg-indigo-50"
                >
                  Policy AI
                </button>
                <button 
                  onClick={handleChatClick} 
                  className="block w-full text-left text-gray-700 py-3 px-6 hover:bg-indigo-50"
                >
                  Advocate AI
                </button>
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 py-3 px-6 hover:bg-indigo-50">Features</a>
                <a href="#roadmap" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 py-3 px-6 hover:bg-indigo-50">Roadmap</a>
                <a href="#compare" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 py-3 px-6 hover:bg-indigo-50">Compare</a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-indigo-600 font-semibold py-3 px-6 hover:bg-indigo-50">Join Waitlist</a>
            </div>
        )}
    </header>
  );
};

export default Header;
