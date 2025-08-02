import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TrendingDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  price: number;
  old_price: number;
  rating: number;
  discount: string;
  status: string;
  duration: string | null;
}

const TrendingDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 2 : 3;

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('trending_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading trending destinations:', error);
      }
    };

    loadDestinations();
  }, []);

  const handleViewPackages = (destination: string) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Add this line
  };

  const handleExploreDestinations = () => {
    navigate('/packages');
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, destinations.length - itemsPerPage);
      return prev >= maxIndex ? 0 : prev + itemsPerPage;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, destinations.length - itemsPerPage);
      return prev <= 0 ? maxIndex : prev - itemsPerPage;
    });
  };

  const getVisibleDestinations = () => {
    return destinations.slice(currentIndex, currentIndex + itemsPerPage);
  };

  if (destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:pt-8 md:pb-8 bg-white-50">


      <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8 md:mb-8">

          {/* <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4"> Destinations</h2> */}
          <h2 className="text-3xl font-bold mb-6">
          ✈️ Trending{" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
            Destinations
          </span>
        </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the hottest travel spots that everyone's talking about right now
          </p>

          

        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {destinations.length > itemsPerPage && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-travel-primary" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-travel-primary" />
              </button>
            </>
          )}

          {/* Destinations Grid */}
          <div className="overflow-hidden mx-4 md:mx-0">
            <div 
              className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-4 md:gap-8 transition-transform duration-500 ease-in-out`}
              style={{ transform: `translateX(0)` }}
            >
              {getVisibleDestinations().map((destination) => (
                <div 
                  key={destination.id} 
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-auto md:h-auto"
                  onClick={() => handleViewPackages(destination.name)}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-3 md:top-6 right-3 md:right-6 bg-red-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-full font-bold text-xs md:text-sm shadow-lg">
                    {destination.discount} OFF
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-4 md:p-8 text-white min-h-[420px]">
                    <div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="text-sm md:text-lg font-medium">{destination.country}</span>
                      </div>
                      <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 leading-tight">{destination.name}</h3>
                      {destination.duration && (
                        <div className="mb-2 md:mb-4 text-sm md:text-base bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block">
                          <span>{destination.duration}</span>
                        </div>
                      )}
                      <p className="text-sm md:text-lg opacity-90 line-clamp-2 mb-3 md:mb-6">{destination.description}</p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
                          <span className="font-semibold text-sm md:text-lg">{destination.rating}</span>
                        </div>
                        <span className="opacity-75 text-sm md:text-base">• Excellent rating</span>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 md:gap-3 mb-1">
                            <span className="text-base md:text-xl line-through opacity-60">₹{destination.old_price.toLocaleString()}</span>
                            <span className="text-xl md:text-3xl font-bold">₹{destination.price.toLocaleString()}</span>
                          </div>
                          <span className="opacity-75 text-xs md:text-sm">per person</span>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPackages(destination.name);
                          }}
                          className="bg-white text-travel-primary px-4 md:px-3 py-2 md:py-2 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg text-xs md:text-sm w-full sm:w-auto justify-center"
                        >
                          Explore Now
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore Destinations Button */}
        <div className="text-center mt-8 md:mt-12">
          <button 
            onClick={handleExploreDestinations}
            className="bg-travel-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-travel-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations;
