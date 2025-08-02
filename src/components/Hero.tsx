import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ExploreDestination {
  id: string;
  name: string;
  emoji: string;
  position: number;
  status: string;
}

const Hero = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState<Date>();
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [withFlights, setWithFlights] = useState(true);
  const [showGuestPopover, setShowGuestPopover] = useState(false);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('explore_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true })
        .limit(5);
      
      if (data) setDestinations(data);
      if (error) console.error('Error loading explore destinations:', error);
    };
    loadDestinations();
  }, []);

  const handleDestinationClick = (destinationName: string) => {
    const params = new URLSearchParams({
      destination: destinationName,
      flights: withFlights.toString(),
      rooms: rooms.toString(),
      guests: guests.toString()
    });
    if (searchDate) params.append('date', format(searchDate, 'yyyy-MM-dd'));
    navigate(`/packages?${params.toString()}`);
  };

  const handleExplore = () => {
    const params = new URLSearchParams({
      flights: withFlights.toString(),
      rooms: rooms.toString(),
      guests: guests.toString()
    });
    if (searchLocation) params.append('destination', searchLocation);
    if (searchDate) params.append('date', format(searchDate, 'yyyy-MM-dd'));
    navigate(`/packages?${params.toString()}`);
  };

  const adjustGuests = (type: 'rooms' | 'guests', operation: 'increment' | 'decrement') => {
    if (type === 'rooms') {
      setRooms(prev => operation === 'increment' ? Math.min(prev + 1, 10) : Math.max(prev - 1, 1));
    } else {
      setGuests(prev => operation === 'increment' ? Math.min(prev + 1, 20) : Math.max(prev - 1, 1));
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{
      backgroundImage: `url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white flex-grow flex flex-col justify-center">
        <div className="mb-16 px-[10px] pt-[126px] pb-0">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Travel <span className="text-purple-400">Luxuriously</span>,
            <br />
            Pay <span className="text-pink-400">Less</span> ✈️
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white max-w-4xl mx-auto leading-relaxed">
            Handcrafted trips that cost 10-20% less than major booking sites.
            <br />
            No bots, just genuine human travel expertise.
          </p>

          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 flex flex-col lg:flex-row gap-3 shadow-2xl">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Where to? (e.g., Bali, Tokyo)" 
                  value={searchLocation} 
                  onChange={e => setSearchLocation(e.target.value)} 
                  className="w-full px-6 py-4 rounded-xl border-0 outline-none text-gray-800 placeholder-gray-500 text-lg" 
                />
              </div>
              
              <div className="relative" style={{ marginTop: '11px' }}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full lg:w-56 px-6 py-4 rounded-xl border-0 bg-transparent text-gray-800 placeholder-gray-500 text-lg justify-start text-left font-normal",
                        !searchDate && "text-gray-500"
                      )}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {searchDate ? format(searchDate, "dd MMM yyyy") : "Departure Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={searchDate}
                      onSelect={setSearchDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="relative mt-[11px]">
                <Popover open={showGuestPopover} onOpenChange={setShowGuestPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full lg:w-48 px-6 py-4 rounded-xl border-0 bg-transparent text-gray-800 text-lg justify-start text-left font-normal">
                      <Users className="mr-2 h-5 w-5" />
                      {rooms} Room{rooms > 1 ? 's' : ''}, {guests} Guest{guests > 1 ? 's' : ''}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 z-50" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Rooms</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => adjustGuests('rooms', 'decrement')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                            -
                          </button>
                          <span className="w-8 text-center">{rooms}</span>
                          <button onClick={() => adjustGuests('rooms', 'increment')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Guests</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => adjustGuests('guests', 'decrement')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                            -
                          </button>
                          <span className="w-8 text-center">{guests}</span>
                          <button onClick={() => adjustGuests('guests', 'increment')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2 px-4">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={withFlights} onChange={e => setWithFlights(e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-sm">With Flights</span>
                </label>
              </div>

              <button onClick={handleExplore} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                🔍 Explore
              </button>
            </div>
          </div>

          {destinations.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {destinations.map(destination => (
                <button 
                  key={destination.id} 
                  onClick={() => handleDestinationClick(destination.name)} 
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300 font-medium flex items-center gap-2 border border-white/30"
                >
                  <span>{destination.emoji}</span>
                  <span>{destination.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animated Mouse Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          className="flex flex-col items-center"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative w-8 h-12 rounded-2xl border-2 border-white flex justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-white rounded-full"
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <motion.span 
            className="text-white text-xs mt-2"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Scroll down
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;