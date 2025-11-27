import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

// Modals
import ChatbotSection from './components/ChatbotSection';
import PolicyAssistantModal from './components/PolicyAssistantModal';
import HealthLocker from './components/HealthLocker';
import PolicyComparisonModal from './components/PolicyComparisonModal';
import ClaimAssessmentModal from './components/ClaimAssessmentModal';

import { User, DriveFile } from './types';

function App() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAssessOpen, setIsAssessOpen] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [lockerFiles, setLockerFiles] = useState<DriveFile[]>([]);

  // Initial load of files if user is present
  useEffect(() => {
    if (user) {
        fetch('/api/documents?email=' + user.email)
            .then(res => res.json())
            .then(data => {
                if(data.files) setLockerFiles(data.files);
            })
            .catch(err => console.log("Failed to load docs", err));
    } else {
        setLockerFiles([]);
    }
  }, [user]);

  const handleUpload = async (file: File, folder: 'insurance' | 'reports') => {
      // 1. Convert to Base64 for upload to worker
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          
          const res = await fetch('/api/upload', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  name: file.name,
                  type: file.type,
                  size: (file.size / 1024).toFixed(0) + ' KB',
                  folder: folder,
                  data: base64Data,
                  email: user?.email
              })
          });
          
          if(res.ok) {
              const newFile = await res.json();
              setLockerFiles(prev => [...prev, newFile]);
          }
      };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onOpenChat={() => setIsChatModalOpen(true)} 
        onOpenPolicy={() => setIsPolicyModalOpen(true)}
        onOpenLocker={() => setIsLockerOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAssess={() => setIsAssessOpen(true)}
        user={user}
        setUser={setUser}
      />
      
      <main>
          {user ? (
            <Dashboard 
                user={user}
                files={lockerFiles}
                onOpenChat={() => setIsChatModalOpen(true)}
                onOpenLocker={() => setIsLockerOpen(true)}
                onOpenCompare={() => setIsCompareOpen(true)}
                onOpenAssess={() => setIsAssessOpen(true)}
                onOpenPolicy={() => setIsPolicyModalOpen(true)}
            />
          ) : (
            <LandingPage />
          )}
      </main>

      {/* Only show Footer on Landing Page to maximize workspace on Dashboard */}
      {!user && <Footer />}
      
      {/* Modals - Only Rendered/Functional when User is logged in (conceptually), 
          but kept here for state management. The UI hides buttons to open them if !user anyway. */}
      
      <ChatbotSection 
          isModalOpen={isChatModalOpen} 
          setIsModalOpen={setIsChatModalOpen} 
          user={user}
          lockerFiles={lockerFiles}
      />
      
      <PolicyAssistantModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
      />
      
      <HealthLocker 
        isOpen={isLockerOpen}
        onClose={() => setIsLockerOpen(false)}
        user={user}
        files={lockerFiles}
        onUpload={handleUpload}
      />
      
      <PolicyComparisonModal 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        files={lockerFiles}
      />
      
      <ClaimAssessmentModal
        isOpen={isAssessOpen}
        onClose={() => setIsAssessOpen(false)}
        files={lockerFiles}
        user={user}
      />
    </div>
  );
}

export default App;