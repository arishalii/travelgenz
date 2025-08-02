import React from 'react';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  const handlePlanTrip = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate('/packages');
    }, 100);
  };

  const handleBrowsePackages = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate('/packages');
    }, 100);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-travel-primary to-travel-accent text-white text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready for Your Next{" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
            Adventure?
          </span>{" "}
          ✈️
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of Gen Z travelers who've discovered luxury travel at unbeatable prices.
          Start planning your dream trip today!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handlePlanTrip}
            className="bg-white text-travel-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Plan Your Trip 🎯
          </button>
          <button 
            onClick={handleBrowsePackages}
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-travel-primary transition-colors"
          >
            Browse Packages 📦
          </button>
        </div>
        
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span>Save 10-20% vs other sites</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>AI + Human - powered trip planning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span>Handcrafted by experts</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
