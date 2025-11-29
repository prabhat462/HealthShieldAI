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
  onOpenCompare: () => void;
  onOpenAssess: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onOpenChat, 
    onOpenPolicy, 
    onOpenLocker, 
    onOpenCompare, 
    onOpenAssess, 
    user, 
    setUser 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

        // Sync user to Backend
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

  const handleLogout = () => {
      setUser(null);
      setIsProfileMenuOpen(false);
      // Optional: Clear any local storage/cookies if needed
  };

  useEffect(() => {
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

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 top-0 transition-all">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                <span className="text-2xl">🩺</span> 
                <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
                    HealthShield AI
                </span>
            </div>

            {/* Desktop Navigation (Authenticated Only) */}
            {user && (
                <div className="hidden lg:flex items-center space-x-8">
                    <button onClick={onOpenLocker} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Health Locker</button>
                    <button onClick={onOpenCompare} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Compare</button>
                    <button onClick={onOpenAssess} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Assessor</button>
                    <button onClick={onOpenChat} className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                        Advocate AI
                    </button>
                </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
                 {user ? (
                     <div className="relative">
                         <button 
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 p-1 pr-3 rounded-full border border-transparent hover:border-gray-100 transition-all"
                         >
                             <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border border-gray-200" />
                             <span className="hidden md:block text-sm font-semibold text-gray-700">{user.name.split(' ')[0]}</span>
                             <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </button>

                         {/* Dropdown Menu */}
                         {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-fade-in z-50">
                                <div className="px-4 py-3 border-b border-gray-50">
                                    <p className="text-xs text-gray-500">Signed in as</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                </div>
                                <button onClick={() => { onOpenLocker(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">My Locker</button>
                                <button onClick={() => { onOpenPolicy(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Policy Q&A Bot</button>
                                <div className="border-t border-gray-50 my-1"></div>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                            </div>
                         )}
                     </div>
                 ) : (
                     <div className="flex items-center gap-4">
                        <span className="hidden md:block text-sm text-gray-500 font-medium">Already have an account?</span>
                        <div id="googleBtn"></div>
                     </div>
                 )}

                {/* Mobile Menu Button (Only if logged in, otherwise just Login button is enough) */}
                {user && (
                    <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            )}
                        </svg>
                    </button>
                )}
            </div>
        </nav>

        {/* Mobile Menu */}
        {user && isMenuOpen && (
            <div className="lg:hidden bg-white shadow-lg border-t border-gray-100 absolute w-full left-0 z-40">
                <button 
                  onClick={() => { onOpenLocker(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-700 py-4 px-6 hover:bg-indigo-50 border-b border-gray-50"
                >
                  Health Locker
                </button>
                <button 
                  onClick={() => { onOpenChat(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-700 py-4 px-6 hover:bg-indigo-50 border-b border-gray-50"
                >
                  Advocate AI
                </button>
                 <button 
                  onClick={() => { onOpenPolicy(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-700 py-4 px-6 hover:bg-indigo-50 border-b border-gray-50"
                >
                  Policy Q&A
                </button>
                <button 
                  onClick={() => { onOpenCompare(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-700 py-4 px-6 hover:bg-indigo-50 border-b border-gray-50"
                >
                  Compare Plans
                </button>
                 <button 
                  onClick={() => { onOpenAssess(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-700 py-4 px-6 hover:bg-indigo-50 border-b border-gray-50"
                >
                  Claim Assessor
                </button>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left text-red-600 py-4 px-6 hover:bg-red-50 font-medium"
                >
                    Sign Out
                </button>
            </div>
        )}
    </header>
  );
};

export default Header;