import React, { useState, useEffect } from 'react';
import { MapPin, Star, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HotDestination {
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

const HotDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<HotDestination[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('hot_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading hot destinations:', error);
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

  if (destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-6 md:mb-8">

     

          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            <Flame className="h-8 w-8 text-red-500" />
            Hot Happening {" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
            Destinations
          </span>
          </h2>
          <p className="text-base md:text-lg lg:text-[1.3rem] leading-6 md:leading-7 text-gray-600 max-w-3xl mx-auto px-4">

            The hottest destinations that are creating buzz in the travel world right now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {destinations.map((destination) => (
            <div 
              key={destination.id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-orange-100 hover:border-orange-300"
              onClick={() => handleViewPackages(destination.name)}
            >
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {destination.discount} OFF
                </div>
                <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  HOT
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{destination.country}</span>
                </div>

                <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                  {destination.name}
                </h3>

                {destination.duration && (
                  <div className="mb-2 text-sm text-gray-500">
                    <span>{destination.duration}</span>
                  </div>
                )}

                <p className="text-gray-600 mb-3 line-clamp-2 text-xs md:text-sm">{destination.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-xs md:text-sm">{destination.rating}</span>
                  </div>
                  <span className="text-gray-500 text-xs md:text-sm">• Trending now</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm line-through text-gray-400">₹{destination.old_price.toLocaleString()}</span>
                      <span className="text-base md:text-lg font-bold text-red-500">₹{destination.price.toLocaleString()}</span>
                    </div>
                    <span className="text-gray-500 text-xs">per person</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPackages(destination.name);
                    }}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all flex items-center gap-1 text-xs md:text-sm"
                  >
                    Book Now
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore Destinations Button */}
        <div className="text-center mt-8">
          <button 
            onClick={handleExploreDestinations}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-base md:text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotDestinations;
