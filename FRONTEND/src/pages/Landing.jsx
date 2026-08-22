import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { LandingPage as StudioLandingPage } from '../studio_components/LandingPage';

export default function Landing() {
  const navigate = useNavigate();

  const handleStartQuery = (presetText) => {
    // Navigate to Civic Navigator with the preset query in state
    navigate('/civic', { state: { presetQuery: presetText } });
  };

  const handleExploreActs = () => {
    // For now, navigate to civic navigator
    navigate('/civic');
  };

  const handleNavigateToTab = (tab) => {
    if (tab === 'navigator') navigate('/civic');
    else if (tab === 'landing') navigate('/');
    else navigate('/dashboard'); // fallback
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />
      {/* 
        The StudioLandingPage handles its own hero layout.
        We'll wrap it in a flex-grow container.
      */}
      <main className="flex-grow pt-[80px]">
        <StudioLandingPage 
          onStartQuery={handleStartQuery}
          onExploreActs={handleExploreActs}
          onNavigateToTab={handleNavigateToTab}
        />
      </main>
      <Footer />
    </div>
  );
}