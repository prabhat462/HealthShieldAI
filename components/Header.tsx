import React, { useState, useEffect } from 'react';
import { User } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface HeaderProps {
  onOpenChat: () => void;
  onOpenPolicy: () => void;
  onOpenLocker: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenChat, onOpenPolicy, onOpenLocker, user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCredentialResponse = async (response: any) => {
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        const newUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        // Sync user to Backend (D1 Database)
        await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        setUser(newUser);
    } catch (e) {
        console.error("Login failed", e);
    }
  };

  // Initialize Google Login
  useEffect(() => {
    // Check for existing session in localStorage handled by parent, 
    // but here we ensure the button renders if not logged in.
    if (window.google && !user) {
      window.google.accounts.id.initialize({
        client_id: "487635557174-5thopn5skq9jlhb6hb7i5e5psqcgdd9m.apps.googleusercontent.com",
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", type: "standard", shape: "pill" }
      );
    }
  }, [user]);

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

  const handleLockerClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onOpenLocker();
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
                {user && (
                    <button 
                        onClick={handleLockerClick} 
                        className="text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none flex items-center gap-1 font-medium"
                    >
                        Health Locker
                    </button>
                )}
                <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#roadmap" className="text-gray-600 hover:text-indigo-600 transition-colors">Roadmap</a>
            </div>
            <div className="flex items-center space-x-4">
                 {user ? (
                     <div className="flex items-center gap-3">
                         <div className="hidden md:block text-right">
                             <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                             <p className="text-xs text-gray-500">Premium Member</p>
                         </div>
                         <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                     </div>
                 ) : (
                     <div id="googleBtn"></div>
                 )}

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
                {user && (
                    <button 
                        onClick={handleLockerClick} 
                        className="block w-full text-left text-gray-700 py-3 px-6 hover:bg-indigo-50 font-medium"
                    >
                        Health Locker
                    </button>
                )}
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 py-3 px-6 hover:bg-indigo-50">Features</a>
                <a href="#roadmap" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 py-3 px-6 hover:bg-indigo-50">Roadmap</a>
            </div>
        )}
    </header>
  );
};

export default Header;