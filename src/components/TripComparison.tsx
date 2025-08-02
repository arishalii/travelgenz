
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface ComparisonResult {
  ourPrice: number;
  theirPrice: number;
  savings: number;
  savingsPercent: number;
}

const TripComparison: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('3');
  const [hotel, setHotel] = useState('');
  const [hotelAmount, setHotelAmount] = useState('');
  const [flight, setFlight] = useState('Economy');
  const [flightAmount, setFlightAmount] = useState('');
  const [activities, setActivities] = useState('1-2');
  const [activitiesAmount, setActivitiesAmount] = useState('');
  const [travellers, setTravellers] = useState('1');
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();

    const totalPerTraveller =
      Number(hotelAmount) + Number(flightAmount) + Number(activitiesAmount);
    const totalAllTravellers = totalPerTraveller * Number(travellers);

    const discountPercent = Math.floor(Math.random() * 6) + 10; // 10–15%
    const ourPrice = Math.floor(totalAllTravellers * (1 - discountPercent / 100));
    const savings = totalAllTravellers - ourPrice;

    setResult({
      ourPrice,
      theirPrice: totalAllTravellers,
      savings,
      savingsPercent: discountPercent
    });

    setShowResults(true);
  };

  return (
    <section className="pt-8 pb-12 bg-gradient-to-br from-primary-50 to-accent-50">

      <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:text-3xl md:leading-10">


          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
           Compare{" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
          & Save 💰
          </span>  

           


          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-[62rem] mx-auto"
          >
            Found a trip on another site? Enter the details below and see how much you'll save booking with TravelGenZ!
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side */}
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6">Your Trip Details</h3>
                <form onSubmit={handleCompare}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Bali, Tokyo"
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                    </div>

                    {/* Duration and Travellers in one row */}
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (days)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          required
                        >
                          <option value="3">3 Days</option>
                          <option value="5">5 Days</option>
                          <option value="7">7 Days</option>
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Travellers
                        </label>
                        <input
                          type="number"
                          value={travellers}
                          onChange={(e) => setTravellers(e.target.value)}
                          min="1"
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Hotel Name
                        </label>
                        <input
                          type="text"
                          value={hotel}
                          onChange={(e) => setHotel(e.target.value)}
                          placeholder="e.g., Hilton"
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Hotel Amount (INR)
                        </label>
                        <input
                          type="number"
                          value={hotelAmount}
                          onChange={(e) => setHotelAmount(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Flight Type
                        </label>
                        <select
                          value={flight}
                          onChange={(e) => setFlight(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Flight Amount (INR)
                        </label>
                        <input
                          type="number"
                          value={flightAmount}
                          onChange={(e) => setFlightAmount(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Activities
                        </label>
                        <select
                          value={activities}
                          onChange={(e) => setActivities(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="1-2">1-2</option>
                          <option value="3-4">3-4</option>
                          <option value="5+">More than 4</option>
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1">
                          Activities Amount (INR)
                        </label>
                        <input
                          type="number"
                          value={activitiesAmount}
                          onChange={(e) => setActivitiesAmount(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Compare Prices
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Side */}
              <div
                className={`p-6 md:p-8 bg-gradient-to-br from-pink-500 to-purple-600 text-white ${
                  !showResults ? 'flex items-center justify-center' : ''
                }`}
              >
                {!showResults ? (
                  <div className="text-center">
                    <ArrowRight className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Enter your trip details</h3>
                    <p className="opacity-80">
                      We'll show you how much you can save by booking with us!
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <h3 className="text-xl font-bold mb-6">Price Comparison</h3>
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Other Booking Sites</span>
                        <span className="text-xl font-bold line-through">₹{result?.theirPrice}</span>
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="flex items-center font-medium">
                          <span className="w-5 h-5 bg-white text-pink-600 rounded-full flex items-center justify-center mr-2">
                            <Check className="h-3 w-3" />
                          </span>
                          TravelGenZ Price
                        </span>
                        <span className="text-2xl font-bold">₹{result?.ourPrice}</span>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl">
                        <p className="text-lg font-semibold">
                          You Save ₹{result?.savings} (
                          {result?.savingsPercent}%)
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="block w-full py-3 text-center rounded-full bg-white text-pink-700 font-semibold hover:bg-gray-100 transition"
                    >
                      Book Now & Save
                    </Link>
                    <p className="mt-4 text-sm opacity-80">
                      All bookings are handcrafted by our travel experts. No hidden costs. No bots, just genuine human expertise!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TripComparison;
