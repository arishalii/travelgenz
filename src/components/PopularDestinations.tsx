import React, { useState, useEffect } from 'react';
import { MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PopularDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  price: number;
  old_price?: number;
  rating: number;
  discount: string;
  status: string;
  duration: string | null;
}

const PopularDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<PopularDestination[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('popular_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading popular destinations:', error);
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
    <section className="py-8 md:py-12 lg:pt-4 lg:pb-4 bg-white">

      <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-6 md:mb-8"> 

          {/* <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4"> Destinations</h2>
           */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          🌟 Popular{" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
            Destinations
          </span>
        </h2>
          
          
          
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Explore the most loved destinations by travelers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {destinations.map((destination) => (
            <div 
              key={destination.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => handleViewPackages(destination.name)}
            >
              <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                  {destination.discount} OFF
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <div className="p-4 md:p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{destination.country}</span>
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-travel-primary transition-colors line-clamp-2">
                  {destination.name}
                </h3>

                {destination.duration && (
                  <div className="mb-2 text-xs md:text-sm text-gray-500">
                    <span>{destination.duration}</span>
                  </div>
                )}

                <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm md:text-base">{destination.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-sm">{destination.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">• Highly rated</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {destination.old_price && (
                        <span className="text-sm md:text-base lg:text-lg line-through text-gray-400">₹{destination.old_price.toLocaleString()}</span>
                      )}
                      <span className="text-lg md:text-xl lg:text-2xl font-bold text-travel-primary">₹{destination.price.toLocaleString()}</span>
                    </div>
                    <span className="text-gray-500 text-sm">per person</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPackages(destination.name);
                    }}
                    className="bg-travel-primary text-white px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-travel-primary/90 transition-colors flex items-center gap-1 md:gap-2 text-sm w-full sm:w-auto justify-center"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore Destinations Button */}
        <div className="text-center mt-8 md:mt-12">
          <button 
            onClick={handleExploreDestinations}
            className="bg-travel-primary text-white px-6 md:px-8 py-2.5 md:py-3 lg:py-4 rounded-full font-bold text-sm md:text-base lg:text-lg hover:bg-travel-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
