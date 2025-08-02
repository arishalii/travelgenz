
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CounterStats {
  packages_booked: number;
  visa_booked: number;
  happy_customers: number;
}

interface BackgroundImage {
  id: string;
  image_url: string;
  alt_text: string | null;
}

const CounterSection = () => {
  const [stats, setStats] = useState<CounterStats>({
    packages_booked: 0,
    visa_booked: 0,
    happy_customers: 0
  });
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [animatedStats, setAnimatedStats] = useState<CounterStats>({
    packages_booked: 0,
    visa_booked: 0,
    happy_customers: 0
  });

  useEffect(() => {
    fetchStats();
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000); // Change background every 5 seconds

      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  useEffect(() => {
    // Animate counters when stats change
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = Object.keys(stats).map((key) => {
      const finalValue = stats[key as keyof CounterStats];
      const increment = finalValue / steps;
      let currentValue = 0;
      let step = 0;

      return setInterval(() => {
        step++;
        currentValue = Math.min(Math.round(increment * step), finalValue);
        setAnimatedStats(prev => ({
          ...prev,
          [key]: currentValue
        }));

        if (step >= steps) {
          clearInterval(intervals.find(interval => interval === this));
        }
      }, stepDuration);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [stats]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setStats({
          packages_booked: data[0].packages_booked,
          visa_booked: data[0].visa_booked,
          happy_customers: data[0].happy_customers
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_backgrounds')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setBackgrounds(data || []);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const currentBackground = backgrounds[currentBgIndex];

  return (
   <section style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }} className="relative overflow-hidden md:pt-8 md:pb-20">

      {/* Background Image */}
      {currentBackground && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${currentBackground.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Our Achievements</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-200">Trusted by thousands of travelers worldwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Packages Booked */}
          <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white border-opacity-20">
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 animate-pulse">
              {formatNumber(animatedStats.packages_booked)}+
            </div>
            <div className="text-lg md:text-xl text-gray-200 font-semibold">Packages Booked</div>
            <div className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">Happy travelers exploring the world</div>
          </div>
          
          {/* Visa Booked */}
          <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white border-opacity-20">
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 animate-pulse">
              {formatNumber(animatedStats.visa_booked)}+
            </div>
            <div className="text-lg md:text-xl text-gray-200 font-semibold">Visa Applications</div>
            <div className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">Successful visa processing</div>
          </div>
          
          {/* Happy Customers */}
          <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white border-opacity-20">
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 animate-pulse">
              {formatNumber(animatedStats.happy_customers)}+
            </div>
            <div className="text-lg md:text-xl text-gray-200 font-semibold">Happy Customers</div>
            <div className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">Satisfied with our services</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
