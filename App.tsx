import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import FeaturesSection from './components/FeaturesSection';
import ChatbotSection from './components/ChatbotSection';
import RoadmapSection from './components/RoadmapSection';
import ComparisonSection from './components/ComparisonSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import PolicyAssistantModal from './components/PolicyAssistantModal';

function App() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onOpenChat={() => setIsChatModalOpen(true)} 
        onOpenPolicy={() => setIsPolicyModalOpen(true)}
      />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <ChatbotSection isModalOpen={isChatModalOpen} setIsModalOpen={setIsChatModalOpen} />
        <RoadmapSection />
        <ComparisonSection />
        <ContactSection />
      </main>
      <Footer />
      
      {/* Zapier Policy AI Modal */}
      <PolicyAssistantModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
      />
    </div>
  );
}

export default App;
