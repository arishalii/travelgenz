import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  Plane, 
  Hotel, 
  Camera, 
  ArrowLeft, 
  Share2, 
  Heart,
  Clock,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BookingPopup from '../components/BookingPopup';

interface Package {
  id: string;
  title: string;
  country: string;
  destinations: string[];
  duration: string;
  price: string;
  original_price: string;
  rating: number;
  image: string;
  includes: string[];
  mood: string;
  trip_type: string;
  gallery_images?: string[];
  nights?: number;
  activities_count?: number;
  hotel_category?: string;
  meals_included?: string;
  transfer_included?: boolean;
  deal_type?: string;
  special_features?: string[];
  featured_locations?: string[];
  advance_booking_discount?: number;
  price_increase_warning?: string;
  per_person_price?: number;
  total_original_price?: number;
}

interface PackageDetails {
  package_id: string;
  hero_image: string;
  pricing: {
    with_flights: { [key: string]: number };
    without_flights: { [key: string]: number };
  };
  attractions: string[];
  hotels: string[];
  itinerary: {
    [key: string]: Array<{
      day: number;
      title: string;
      activities: string[];
      accommodation: string;
      breakfast: string;
      lunch: string;
      dinner: string;
    }>;
  };
  flight_details: {
    roundTrip: boolean;
    airportTransfers: boolean;
  };
  hotel_details: {
    category: string;
    pickupDrop: boolean;
  };
  meal_details: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  activity_details: {
    list: string[];
    count: number;
  };
  combo_details: {
    isCombo: boolean;
    features: string[];
  };
}

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState('3');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [members, setMembers] = useState(1);
  const [withFlights, setWithFlights] = useState(true);
  const [withVisa, setWithVisa] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
  const [visaCost, setVisaCost] = useState(0);
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

  useEffect(() => {
    if (id) {
      fetchPackageData();
    }
  }, [id]);

  useEffect(() => {
    // Get cart item ID from URL params if present
    const urlParams = new URLSearchParams(location.search);
    const cartItemId = urlParams.get('cart_item_id');
    
    if (cartItemId && packageData) {
      // Load cart item details if coming from cart
      loadCartItemDetails(cartItemId);
    }
  }, [location.search, packageData]);

  const loadCartItemDetails = async (cartItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('id', cartItemId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedDuration(data.days.toString());
        setMembers(data.members || 1);
        setWithFlights(data.with_flights || false);
        setWithVisa(data.with_visa || false);
        setVisaCost(data.visa_cost || 0);
        if (data.selected_date) {
          setSelectedDate(new Date(data.selected_date));
        }
      }
    } catch (error) {
      console.error('Error loading cart item details:', error);
    }
  };

  const fetchPackageData = async () => {
    try {
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single();

      if (packageError) throw packageError;

      const { data: detailsData, error: detailsError } = await supabase
        .from('package_details')
        .select('*')
        .eq('package_id', id)
        .maybeSingle();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching package details:', detailsError);
      }

      setPackageData(packageData);
      setPackageDetails(detailsData);

      // Track package view
      if (user) {
        await supabase.from('user_activities').insert({
          user_id: user.id,
          action_type: 'view',
          item_type: 'package',
          item_id: id!,
          item_name: packageData.title,
          user_email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      toast({
        title: "Error",
        description: "Failed to load package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!packageDetails?.pricing) {
      const basePrice = parseInt(packageData?.price?.replace(/[^0-9]/g, '') || '0');
      return basePrice * parseInt(selectedDuration) * members;
    }

    const priceCategory = withFlights ? 'with_flights' : 'without_flights';
    const pricePerPerson = packageDetails.pricing[priceCategory]?.[selectedDuration] || 0;
    return pricePerPerson * members;
  };

  const getTotalPrice = () => {
    return getCurrentPrice() + (withVisa ? visaCost * members : 0);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!packageData) return;

    try {
      const { error } = await supabase.from('cart').insert({
        package_id: packageData.id,
        user_id: user.id,
        days: parseInt(selectedDuration),
        total_price: getCurrentPrice(),
        members: members,
        with_flights: withFlights,
        selected_date: selectedDate ? selectedDate.toISOString() : null,
        with_visa: withVisa,
        visa_cost: withVisa ? visaCost : 0,
        booking_type: 'cart'
      });

      if (error) throw error;

      toast({
        title: "Added to Cart!",
        description: "Package has been added to your cart",
      });

      // Track add to cart action
      await supabase.from('user_activities').insert({
        user_id: user.id,
        action_type: 'add_to_cart',
        item_type: 'package',
        item_id: packageData.id,
        item_name: packageData.title,
        user_email: user.email
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book this package",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setIsBookingPopupOpen(true);
  };

  const nextImage = () => {
    const images = packageData?.gallery_images || [packageData?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = packageData?.gallery_images || [packageData?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-travel-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Package not found</h1>
            <Button onClick={() => navigate('/packages')}>
              ← Back to Packages
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = packageData.gallery_images && packageData.gallery_images.length > 0 
    ? packageData.gallery_images 
    : [packageData.image].filter(Boolean);

  const currentItinerary = packageDetails?.itinerary?.[selectedDuration] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16 md:pt-20">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/packages')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative">
          <div className="h-48 md:h-64 lg:h-96 relative overflow-hidden">
            <img 
              src={packageDetails?.hero_image || packageData.image}
              alt={packageData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            
            {/* Desktop Back Button */}
            <div className="hidden lg:block absolute top-4 left-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/packages')}
                className="bg-white/90 hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Packages
              </Button>
            </div>

            {/* Desktop Share/Save Buttons */}
            <div className="hidden lg:block absolute top-4 right-4">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Gallery Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/60 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Gallery Button */}
            {images.length > 1 && (
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white/90 hover:bg-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2"
              >
                <Camera className="h-3 w-3 md:h-4 md:w-4" />
                View Gallery ({images.length})
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Package Header */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-4">
                    <div className="flex-1">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">{packageData.title}</h1>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{packageData.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{packageData.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                          <span>{packageData.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Display - Mobile */}
                    <div className="lg:hidden text-right">
                      {packageData.original_price && (
                        <span className="text-sm md:text-base text-red-500 line-through block">
                          ₹{parseInt(packageData.original_price.replace(/[^0-9]/g, '')).toLocaleString()}
                        </span>
                      )}
                      <div className="text-xl md:text-2xl font-bold text-green-600">
                        ₹{parseInt(packageData.price.replace(/[^0-9]/g, '')).toLocaleString()}
                        <span className="text-xs md:text-sm font-normal text-gray-500 block">per person</span>
                      </div>
                    </div>
                  </div>

                  {/* Destinations */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Destinations</h3>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {packageData.destinations.map((destination, index) => (
                        <Badge key={index} variant="secondary" className="text-xs md:text-sm">
                          {destination}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Package Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🏨</span>
                      <span>{packageData.hotel_category || '3-4 Star'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🍽️</span>
                      <span>{packageData.meals_included || 'Breakfast'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🚗</span>
                      <span>{packageData.transfer_included ? 'Transfers' : 'No Transfers'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🎯</span>
                      <span>{packageData.activities_count || 0} Activities</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Details Tabs */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 text-xs md:text-sm">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                      <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                      <TabsTrigger value="hotels" className="hidden md:block">Hotels</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 md:mt-6">
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">About This Trip</h3>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Experience the best of {packageData.destinations.join(', ')} with our carefully crafted {packageData.duration} package. 
                            Perfect for {packageData.trip_type.toLowerCase()} travelers seeking {packageData.mood.toLowerCase()} experiences.
                          </p>
                        </div>

                        {packageDetails?.attractions && packageDetails.attractions.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Top Attractions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {packageDetails.attractions.map((attraction, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                                  <span>{attraction}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {packageData.special_features && packageData.special_features.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Special Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {packageData.special_features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="itinerary" className="mt-4 md:mt-6">
                      <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {['3', '5', '7'].map((duration) => (
                            <Button
                              key={duration}
                              variant={selectedDuration === duration ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedDuration(duration)}
                              className="text-xs md:text-sm"
                            >
                              {duration} Days
                            </Button>
                          ))}
                        </div>

                        {currentItinerary.length > 0 ? (
                          <div className="space-y-3 md:space-y-4">
                            {currentItinerary.map((day, index) => (
                              <div key={index} className="border rounded-lg p-3 md:p-4 bg-white">
                                <h4 className="font-semibold mb-2 text-sm md:text-base text-blue-600">
                                  Day {day.day}: {day.title}
                                </h4>
                                
                                {day.activities && day.activities.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="font-medium mb-1 text-xs md:text-sm">Activities:</h5>
                                    <ul className="space-y-1">
                                      {day.activities.map((activity, actIndex) => (
                                        <li key={actIndex} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                                          <span className="text-blue-500 mt-1">•</span>
                                          <span>{activity}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                                  {day.accommodation && (
                                    <div>
                                      <span className="font-medium">🏨 Stay:</span>
                                      <span className="ml-1">{day.accommodation}</span>
                                    </div>
                                  )}
                                  {day.breakfast && (
                                    <div>
                                      <span className="font-medium">🍳 Breakfast:</span>
                                      <span className="ml-1">{day.breakfast}</span>
                                    </div>
                                  )}
                                  {day.dinner && (
                                    <div>
                                      <span className="font-medium">🍽️ Dinner:</span>
                                      <span className="ml-1">{day.dinner}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 md:py-8 text-gray-500">
                            <p className="text-sm md:text-base">Detailed itinerary will be provided upon booking.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="inclusions" className="mt-4 md:mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {packageData.includes.map((inclusion, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                            <span>{inclusion}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="hotels" className="mt-4 md:mt-6">
                      {packageDetails?.hotels && packageDetails.hotels.length > 0 ? (
                        <div className="space-y-3 md:space-y-4">
                          {packageDetails.hotels.map((hotel, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                              <Hotel className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                              <span>{hotel}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 md:py-8 text-gray-500">
                          <p className="text-sm md:text-base">Hotel details will be provided upon booking.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 md:top-24">
                <Card className="shadow-lg">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-lg md:text-xl">Book This Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    {/* Duration Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['3', '5', '7'].map((duration) => (
                          <Button
                            key={duration}
                            variant={selectedDuration === duration ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDuration(duration)}
                            className="text-xs md:text-sm"
                          >
                            {duration} Days
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Travel Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm md:text-base",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Members Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                      <div className="flex items-center justify-between border rounded-lg p-2 md:p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers(Math.max(1, members - 1))}
                          disabled={members <= 1}
                          className="h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <span className="font-medium text-sm md:text-base">{members} {members === 1 ? 'Person' : 'People'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers(members + 1)}
                          className="h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Flight Option */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="flights"
                        checked={withFlights}
                        onChange={(e) => setWithFlights(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="flights" className="text-sm md:text-base">Include Flights</label>
                    </div>

                    {/* Visa Option */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="visa"
                        checked={withVisa}
                        onChange={(e) => setWithVisa(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="visa" className="text-sm md:text-base">Visa Assistance (+₹{visaCost.toLocaleString()})</label>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Package ({selectedDuration} days × {members} {members === 1 ? 'person' : 'people'})</span>
                        <span>₹{getCurrentPrice().toLocaleString()}</span>
                      </div>
                      {withVisa && (
                        <div className="flex justify-between text-sm md:text-base">
                          <span>Visa Assistance</span>
                          <span>₹{(visaCost * members).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base md:text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-green-600">₹{getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 md:space-y-3">
                      <Button 
                        onClick={handleBookNow}
                        className="w-full bg-travel-primary hover:bg-travel-primary/90 text-sm md:text-base py-2 md:py-3"
                      >
                        Book Now
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleAddToCart}
                        className="w-full text-sm md:text-base py-2 md:py-3"
                      >
                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center text-xs md:text-sm text-gray-600 border-t pt-4">
                      <p>Need help? Call us at</p>
                      <p className="font-semibold text-travel-primary">+91 9910565588</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowGallery(false)}
                className="absolute top-2 md:top-4 right-2 md:right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              
              <div className="relative">
                <img 
                  src={images[currentImageIndex]}
                  alt={`Gallery ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[70vh] md:max-h-[80vh] object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3"
                    >
                      <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs md:text-sm">
                  {currentImageIndex + 1} of {images.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 md:p-4 z-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-600">Total Price</div>
              <div className="text-lg md:text-xl font-bold text-green-600">
                ₹{getTotalPrice().toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleAddToCart}
                className="flex-1 text-xs md:text-sm py-2 md:py-3"
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Cart
              </Button>
              <Button 
                onClick={handleBookNow}
                className="flex-1 bg-travel-primary hover:bg-travel-primary/90 text-xs md:text-sm py-2 md:py-3"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>

        {/* Add bottom padding for mobile sticky bar */}
        <div className="lg:hidden h-20"></div>
      </main>

      <Footer />

      {/* Booking Popup */}
      <BookingPopup
        open={isBookingPopupOpen}
        onOpenChange={setIsBookingPopupOpen}
        packageData={{
          id: packageData.id,
          nights: packageData.nights || parseInt(selectedDuration)
        }}
        members={members}
        totalPrice={getCurrentPrice()}
        withFlights={withFlights}
        selectedDate={selectedDate}
        visaCost={withVisa ? visaCost : 0}
      />
    </div>
  );
};

export default PackageDetail;
