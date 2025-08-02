import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, MapPin, Calendar, Users, Plus, Minus, ShoppingCart, Plane, Trophy, Clock, Download, Coffee, Camera, Utensils, Mountain, ClipboardCheck } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import BookingPopup from '@/components/BookingPopup';
import { Train, Bus, Ship } from 'lucide-react';



interface Package {
  id: string;
  title: string;
  duration: string;
  destinations: string[];
  price: string;
  original_price: string;
  rating: number;
  includes: string[];
  image: string;
  country: string;
  mood: string;
  trip_type: string;
  gallery_images?: string[];
}

interface PackageDetail {
  id: string;
  package_id: string;
  hero_image: string;
  attractions: string[];
  hotels: string[];
  itinerary: any;
  pricing: {
    with_flights: { [key: string]: number };
    without_flights: { [key: string]: number };
  };
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  author_image?: string;
  created_at: string;
  date_written?: string;
  categories?: string[];
  category?: string;
}

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const visaDurations = ["15 Days", "30 Days"];

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [package_, setPackage] = useState<Package | null>(null);
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
const [selectedDays, setSelectedDays] = useState(3); // Default to 3 initially

// Add this state to track if user has manually changed the days
const [hasUserChangedDays, setHasUserChangedDays] = useState(false);

const persistSelectedDays = (days: number) => {
  setSelectedDays(days);
  setHasUserChangedDays(true);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`package-${id}-selectedDays`, days.toString());
  }
};
  const [withFlights, setWithFlights] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [members, setMembers] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
  const [visaRates, setVisaRates] = useState<Record<string, Record<string, number>>>({});
  const [visaOrigin, setVisaOrigin] = useState('');
  const [visaDestination, setVisaDestination] = useState('');
  const [visaDuration, setVisaDuration] = useState('15 Days');
  const [visaMembers, setVisaMembers] = useState(1);
  const [addedVisaCost, setAddedVisaCost] = useState(0);

  const logUserActivity = async (actionType: string, itemType: string, itemId: string, itemName: string) => {
    if (!user) return;
    try {
      await supabase
        .from('user_activities')
        .insert([{
          user_id: user.id,
          action_type: actionType,
          item_type: itemType,
          item_id: itemId,
          item_name: itemName,
          user_email: user.email
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

const generatePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Add header with logo and branding
  doc.setFillColor(23, 37, 84); // Navy blue
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add TravelGenz logo (as text for now - replace with actual logo if available)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TravelGenz', margin, 40);
  
  // Add tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Crafting Unforgettable Journeys', margin, 47);
  
  // Add user info section
  yPosition = 70;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${user?.email?.split('@')[0] || 'Guest'}'s Personalized Itinerary`, margin, yPosition);
  
  // Add destination title
  yPosition += 15;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84); // Navy blue
  doc.text(package_?.title || 'Trip Itinerary', margin, yPosition);
  
  // Add trip details
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${selectedDays} Days • ${package_?.trip_type || 'Package'} • ${package_?.destinations.join(' → ')}`, margin, yPosition);
  
  // Add creation date
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Created on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPosition);
  
  yPosition += 20;
  
  // Add inspirational quote section
  doc.setFillColor(240, 249, 255); // Light blue background
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'D');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(50, 50, 50);
  const quote = `"${package_?.destinations[0]} awaits with unforgettable experiences. This itinerary has been carefully crafted to ensure you make the most of every moment."`;
  const splitQuote = doc.splitTextToSize(quote, pageWidth - 2 * margin - 10);
  doc.text(splitQuote, margin, yPosition + 8);
  
  yPosition += 35;
  
  // Add quick facts section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84);
  doc.text('Trip At A Glance', margin, yPosition);
  yPosition += 10;
  
  // Add divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Quick facts boxes
  const quickFacts = [
    { icon: '🗓️', title: 'Duration', value: `${selectedDays} Days ${selectedDays > 1 ? selectedDays-1 + ' Nights' : ''}` },
    { icon: '📍', title: 'Destinations', value: package_?.destinations.join(', ') },
    { icon: '✈️', title: 'Flight Option', value: withFlights ? 'Included' : 'Not Included' },
    { icon: '👥', title: 'Travelers', value: `${members} ${members > 1 ? 'Persons' : 'Person'}` },
    { icon: '🏨', title: 'Accommodation', value: `${packageDetail?.hotels?.length || 'Premium'} Hotels` },
    { icon: '📅', title: 'Travel Date', value: selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Flexible' }
  ];
  
  let factX = margin;
  let factY = yPosition;
  quickFacts.forEach((fact, index) => {
    if (index % 3 === 0 && index !== 0) {
      factX = margin;
      factY += 30;
    }
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(factX, factY, 55, 25, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(factX, factY, 55, 25, 3, 3, 'D');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(`${fact.icon} ${fact.title}`, factX + 5, factY + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const splitValue = doc.splitTextToSize(fact.value, 45);
    doc.text(splitValue, factX + 5, factY + 16);
    
    factX += 60;
  });
  
  yPosition = factY + 35;
  
  // Add pricing section
  doc.setFillColor(23, 37, 84); // Navy blue
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Pricing Summary', margin + 10, yPosition + 20);
  
  yPosition += 40;
  
  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * members;
  const originalPrice = parseInt(package_?.original_price.replace(/[₹,]/g, '') || '0');
  const totalOriginalPrice = originalPrice * members;
  const grandTotalPrice = totalPrice + addedVisaCost;
  
  // Price details table
  const priceDetails = [
    { item: 'Base Price', value: `₹${currentPrice.toLocaleString()} x ${members}` },
    { item: 'Subtotal', value: `₹${totalPrice.toLocaleString()}` },
  ];
  
  if (addedVisaCost > 0) {
    priceDetails.push({ item: 'Visa Fees', value: `₹${addedVisaCost.toLocaleString()}` });
  }
  
  priceDetails.push({ item: 'Grand Total', value: `₹${grandTotalPrice.toLocaleString()}` });
  
  priceDetails.forEach((detail, index) => {
    doc.setFontSize(index === priceDetails.length - 1 ? 12 : 10);
    doc.setFont('helvetica', index === priceDetails.length - 1 ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Item name
    doc.text(detail.item, margin + 5, yPosition + 8);
    
    // Price value
    const textWidth = doc.getStringUnitWidth(detail.value) * doc.getFontSize() / doc.internal.scaleFactor;
    doc.text(detail.value, pageWidth - margin - 5 - textWidth, yPosition + 8);
    
    if (index === priceDetails.length - 2) {
      // Add divider before grand total
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition + 12, pageWidth - margin, yPosition + 12);
      yPosition += 5;
    }
    
    yPosition += 10;
  });
  
  if (originalPrice > 0 && totalOriginalPrice > totalPrice) {
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`You save ₹${(totalOriginalPrice - totalPrice).toLocaleString()} (${Math.round(((totalOriginalPrice - totalPrice)/totalOriginalPrice)*100)}% off)`, margin + 5, yPosition);
    yPosition += 10;
  }
  
  yPosition += 15;
  
  // Add disclaimer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const disclaimer = '* Prices are subject to availability and may change. Final pricing will be confirmed at the time of booking. Taxes and fees included.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
  doc.text(splitDisclaimer, margin, yPosition);
  
  yPosition += 20;
  
  // Add detailed itinerary section
  doc.addPage();
  yPosition = margin;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84);
  doc.text('Detailed Itinerary', margin, yPosition);
  yPosition += 10;
  
  // Add divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  const itinerary = getItineraryForDays();
  itinerary.forEach((day: any, index: number) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Calculate the date for each day based on selectedDate
    const dayDate = selectedDate ? 
      new Date(selectedDate.getTime() + ((day.day - 1) * 24 * 60 * 60 * 1000)) : 
      null;
    
    // Day header
    doc.setFillColor(23, 37, 84); // Navy blue
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Day ${day.day}: ${day.title || `Exploring ${package_?.destinations[0]}`}${dayDate ? ` • ${format(dayDate, 'EEE, MMM dd')}` : ''}`, margin, yPosition + 5);
    yPosition += 20;
    
    // Activities
    if (day.activities && day.activities.length > 0) {
      day.activities.forEach((activity: string, i: number) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Activity container
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'D');
        
        // Time slot indicator
        doc.setFillColor(23, 37, 84);
        doc.rect(margin, yPosition, 25, 20, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(getTimeSlot(i), margin + 5, yPosition + 12);
        
        // Activity text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(activity, margin + 30, yPosition + 12);
        
        yPosition += 25;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Activities to be customized based on your preferences', margin, yPosition + 5);
      yPosition += 15;
    }
    
    yPosition += 10;
  });
  
  // Add attractions page if available
  if (packageDetail?.attractions && packageDetail.attractions.length > 0) {
    doc.addPage();
    yPosition = margin;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Top Attractions', margin, yPosition);
    yPosition += 10;
    
    // Add divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    packageDetail.attractions.forEach((attraction, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      
      const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      
      doc.text(`✓ ${attraction}`, margin + 5, yPosition + 7);
      yPosition += 10;
    });
    
    yPosition += 15;
  }
  
  // Add hotels page if available
  if (packageDetail?.hotels && packageDetail.hotels.length > 0) {
    doc.addPage();
    yPosition = margin;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Accommodations', margin, yPosition);
    yPosition += 10;
    
    // Add divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    packageDetail.hotels.forEach((hotel, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 37, 84);
      doc.text(`🏨 ${hotel}`, margin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('4-star property with premium amenities and excellent location', margin + 10, yPosition);
      yPosition += 15;
    });
    
    yPosition += 10;
  }
  
  // Add inclusions page
  doc.addPage();
  yPosition = margin;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84);
  doc.text('Package Inclusions', margin, yPosition);
  yPosition += 10;
  
  // Add divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  package_?.includes.forEach((inclusion, index) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
    }
    
    const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    
    doc.text(`✓ ${inclusion}`, margin + 5, yPosition + 7);
    yPosition += 10;
  });
  
  yPosition += 20;
  
  // Add booking information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84);
  doc.text('How To Book', margin, yPosition);
  yPosition += 10;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  const bookingSteps = [
    "1. Review this itinerary and make any desired changes",
    "2. Contact our travel experts to confirm availability",
    "3. Make a 20% deposit to secure your booking",
    "4. Receive your booking confirmation and travel documents",
    "5. Pay the remaining balance 30 days before departure"
  ];
  
  doc.setFontSize(10);
  bookingSteps.forEach((step, index) => {
    doc.text(step, margin + 5, yPosition + 5);
    yPosition += 10;
  });
  
  yPosition += 20;
  
  // Add contact information
  doc.setFillColor(240, 249, 255); // Light blue background
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 'D');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 37, 84);
  doc.text('Need Assistance?', margin, yPosition + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Email: info@travelgenz.com', margin, yPosition + 20);
  doc.text('Phone: +1 (555) 123-4567', margin, yPosition + 30);
  
  // Save the PDF
  doc.save(`${package_?.title.replace(/\s+/g, '_') || 'TravelGenz_Itinerary'}.pdf`);
  
  toast({
    title: "PDF Downloaded",
    description: "Your complete itinerary has been downloaded",
  });

  if (user && package_) {
    logUserActivity('download_itinerary', 'package', package_.id, package_.title);
  }
};

  const getCurrentPrice = () => {
    if (!packageDetail?.pricing) {
      const basePrice = parseInt(package_?.price.replace(/[₹,]/g, '') || '0');
      return basePrice;
    }

    const pricing = withFlights ? packageDetail.pricing.with_flights : packageDetail.pricing.without_flights;
    return pricing[selectedDays.toString()] || pricing['3'] || 0;
  };

  const calculateTotalPrice = () => {
    if (!packageDetail?.pricing) {
      const basePrice = parseInt(package_?.price.replace(/[₹,]/g, '') || '0');
      return basePrice * members;
    }

    if (withFlights) {
      const flightPrice = packageDetail.pricing.with_flights[selectedDays.toString()] || 
                        packageDetail.pricing.with_flights['3'] || 0;
      const withoutFlightPrice = packageDetail.pricing.without_flights[selectedDays.toString()] || 
                               packageDetail.pricing.without_flights['3'] || 0;
      const flightComponent = flightPrice - withoutFlightPrice;
      return (flightComponent * members) + (withoutFlightPrice * members);
    } else {
      const withoutFlightPrice = packageDetail.pricing.without_flights[selectedDays.toString()] || 
                               packageDetail.pricing.without_flights['3'] || 0;
      return withoutFlightPrice * members;
    }
  };

  const getItineraryForDays = () => {
    if (!packageDetail?.itinerary) return [];
    const itinerary = packageDetail.itinerary;
    const dayKey = selectedDays.toString();
    return itinerary[dayKey] || itinerary['3'] || [];
  };

  const adjustMembers = (operation: 'increment' | 'decrement') => {
    if (operation === 'increment') {
      setMembers(prev => Math.min(prev + 1, 20));
    } else {
      setMembers(prev => Math.max(prev - 1, 1));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

const getActivityIcon = (activity: string) => {
  const activityLower = activity.toLowerCase();
  
  // Check for transportation activities first
  if (activityLower.includes('train to')) {
    return <Train className="h-5 w-5 text-blue-600" />;
  }
  if (activityLower.includes('flight to') || activityLower.includes('fly to')) {
    return <Plane className="h-5 w-5 text-indigo-600" />;
  }
  if (activityLower.includes('bus to')) {
    return <Bus className="h-5 w-5 text-green-600" />;
  }
  
  // Then check for other activity types
  if (activityLower.includes('food') || activityLower.includes('meal') || activityLower.includes('lunch') || activityLower.includes('dinner')) {
    return <Utensils className="h-5 w-5 text-orange-500" />;
  }
  if (activityLower.includes('photo') || activityLower.includes('view') || activityLower.includes('sight')) {
    return <Camera className="h-5 w-5 text-blue-500" />;
  }
  if (activityLower.includes('coffee') || activityLower.includes('tea') || activityLower.includes('break')) {
    return <Coffee className="h-5 w-5 text-amber-600" />;
  }
  if (activityLower.includes('mountain') || activityLower.includes('trek') || activityLower.includes('hike')) {
    return <Mountain className="h-5 w-5 text-green-600" />;
  }
  return <Clock className="h-5 w-5 text-gray-500" />;
};


const [processedItinerary, setProcessedItinerary] = useState<{
  filteredItinerary: any[];
  transportationActivities: {day: number, activity: string}[];
}>({ filteredItinerary: [], transportationActivities: [] });

// Update this useEffect to properly handle itinerary changes
useEffect(() => {
  if (packageDetail?.itinerary) {
    const itinerary = getItineraryForDays();
    const processed = extractTransportationActivities(itinerary);
    setProcessedItinerary(processed);
  }
}, [packageDetail?.itinerary, selectedDays, withFlights]); // Add withFlights to dependencies

const extractDurationFromActivity = (activity: string) => {
  const durationMatch = activity.match(/\((\d+(?:\s*-\s*\d+)?\s*(?:hours|hrs|hour|h|days|d))\)/i);
  if (durationMatch && durationMatch[1]) {
    // Clean up any extra spaces around hyphens
    return durationMatch[1].replace(/\s*-\s*/g, '-') + 
           (durationMatch[1].match(/(hours|hrs|hour|h|days|d)/i) ? '' : ' hours');
  }
  return '2-3 hours'; // Default if no duration specified
};

const extractTransportationActivities = (itinerary: any[]) => {
  const transportationActivities: {day: number, activity: string}[] = [];
  
  // Create a deep copy of the itinerary to avoid mutating the original
  const filteredItinerary = JSON.parse(JSON.stringify(itinerary)).map((day: any) => {
    // Find all transportation activities in this day
    const transportIndices = day.activities
      .map((act: string, index: number) => 
        act.toLowerCase().includes('train to') || 
        act.toLowerCase().includes('flight to') ||
        act.toLowerCase().includes('bus to') ||
        act.toLowerCase().includes('fly to') ? index : -1
      )
      .filter((i: number) => i !== -1)
      .reverse(); // Process in reverse order to maintain correct indices when removing
    
    // Remove transportation activities and add to separate array
    transportIndices.forEach((index: number) => {
      const [transportActivity] = day.activities.splice(index, 1);
      transportationActivities.push({
        day: day.day,
        activity: transportActivity
      });
    });
    
    return day;
  });
  
  return { filteredItinerary, transportationActivities };
};


  const getTimeSlot = (index: number) => {
    const timeSlots = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
    return timeSlots[index] || 'ACTIVITY';
  };

  useEffect(() => {
const loadPackageData = async () => {
  if (!id) return;

  try {
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (packageError || !packageData) {
      navigate('/packages');
      return;
    }

    setPackage(packageData);
    setVisaDestination(packageData.country);

    // Check sessionStorage first (persists only for session)
    let daysToSet = 3;
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`package-${id}-selectedDays`);
      if (saved) {
        daysToSet = parseInt(saved);
      } else if (packageData.duration) {
        // Only use package duration if no manual selection exists
        const daysMatch = packageData.duration.match(/\d+/);
        if (daysMatch) {
          daysToSet = parseInt(daysMatch[0]);
        }
      }
    }

    setSelectedDays(daysToSet);
    setHasUserChangedDays(false); // Reset on new package load

    const { data: detailData, error: detailError } = await supabase
      .from('package_details')
      .select('*')
      .eq('package_id', id)
      .single();

    if (!detailError && detailData) {
      let pricing = detailData.pricing;
      if (typeof pricing === 'string') {
        try {
          pricing = JSON.parse(pricing);
        } catch {
          pricing = { with_flights: {}, without_flights: {} };
        }
      }
      setPackageDetail({
        id: detailData.id,
        package_id: detailData.package_id,
        hero_image: detailData.hero_image,
        attractions: detailData.attractions,
        hotels: detailData.hotels,
        itinerary: detailData.itinerary,
        pricing: pricing as { with_flights: { [key: string]: number }; without_flights: { [key: string]: number } }
      });
    }

    if (user) {
      logUserActivity('view', 'package', id, packageData.title);
    }

  } catch (error) {
    navigate('/packages');
  } finally {
    setLoading(false);
  }
};

    const loadVisaRates = async () => {
      const { data, error } = await supabase
        .from('visa_rates')
        .select('*');
      
      if (data && !error) {
        const ratesMap: Record<string, Record<string, number>> = {};
        data.forEach((rate) => {
          if (!ratesMap[rate.destination_country]) {
            ratesMap[rate.destination_country] = {};
          }
          ratesMap[rate.destination_country]["15 Days"] = rate.price_15_days;
          ratesMap[rate.destination_country]["30 Days"] = rate.price_30_days;
        });
        setVisaRates(ratesMap);
      }
    };

    loadPackageData();
    loadVisaRates();
  }, [id, navigate, user]);

  const loadRelatedBlogs = async () => {
    if (!package_) return;
    
    setBlogsLoading(true);
    try {
      const searchQueries = package_.destinations.map(dest => 
        `title.ilike.%${dest}%,content.ilike.%${dest}%`
      );
      
      const { data: blogData, error } = await supabase
        .from('blog')
        .select('id, title, excerpt, image, author, author_image, created_at, date_written, categories, category')
        .eq('published', true)
        .or(searchQueries.join(','))
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && blogData) {
        setRelatedBlogs(blogData);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!package_ || !user) return;

    const totalPrice = calculateTotalPrice();
    
    try {
      const { data: existingItems, error: checkError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .eq('package_id', package_.id);

      if (checkError) throw checkError;

      const cartItemData = {
        days: selectedDays,
        total_price: totalPrice + addedVisaCost,
        members: members,
        with_flights: withFlights,
        selected_date: selectedDate ? selectedDate.toISOString() : null,
        with_visa: addedVisaCost > 0,
        visa_cost: addedVisaCost,
        updated_at: new Date().toISOString(),
      };

      if (existingItems && existingItems.length > 0) {
        await supabase
          .from('cart')
          .update(cartItemData)
          .eq('id', existingItems[0].id);
      } else {
        await supabase
          .from('cart')
          .insert([{ ...cartItemData, user_id: user.id, package_id: package_.id }]);
      }

      toast({
        title: existingItems?.length ? "Cart Updated" : "Added to Cart",
        description: `${package_.title} configuration updated in your cart`,
      });

      logUserActivity('add_to_cart', 'package', package_.id, package_.title);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to manage cart",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!package_) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-600">Package not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const totalPrice = calculateTotalPrice();
  const originalPrice = parseInt(package_?.original_price.replace(/[₹,]/g, '') || '0');
  const totalOriginalPrice = originalPrice * members;
  const availableDays = Object.keys(packageDetail?.pricing?.with_flights || {})
    .concat(Object.keys(packageDetail?.pricing?.without_flights || {}))
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(Number)
    .sort((a, b) => a - b);

  const calculatedVisaCost = visaDestination && visaRates[visaDestination] && visaRates[visaDestination][visaDuration]
    ? visaRates[visaDestination][visaDuration]
    : 0;
  const totalVisaCost = calculatedVisaCost * visaMembers;
  const grandTotalPrice = totalPrice + addedVisaCost;

  const displayImages = package_.gallery_images && package_.gallery_images.length > 0 
    ? package_.gallery_images 
    : [
        packageDetail?.hero_image || package_.image,
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400",
        "https://images.unsplash.com/photo-1512453979-3c830dcef090?w=400",
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={package_.image} 
              alt={package_.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-48">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-white">
                <h1 className="text-5xl font-bold mb-4">
                  {package_.title}
                </h1>
                <div className="flex items-center gap-6 text-xl mb-4">
                  <span className="flex items-center gap-2">
                    <Clock className="h-6 w-6" />
                    {package_.duration}
                  </span>
                  <span>•</span>
                  <span>{package_.destinations.join(' → ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(package_.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg">({package_.rating})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 bg-opacity-90 px-6 py-3 rounded-lg flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-purple-600" />
                  <span className="text-purple-800 font-medium">Awarded The Best Holiday Brand in India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-4 gap-3 aspect-[5/2]">
  <div className="col-span-2 row-span-2">
    <img 
      src={displayImages[0]} 
      alt="Main destination" 
      className="w-full h-full object-cover rounded-lg"
    />
  </div>
  <div className="col-span-2 grid grid-cols-2 gap-3">
    {displayImages.slice(1, 5).map((image, index) => (
      <img 
        key={index}
        src={image} 
        alt={`Destination view ${index + 1}`} 
        className="w-full h-full object-cover rounded-lg"
      />
    ))}
  </div>
</div>

              <Tabs defaultValue="trip" className="w-full">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger 
                    value="trip" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none px-4 py-3"
                  >
                    🧳 Your Trip
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inclusions" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none px-4 py-3"
                  >
                    📋 Inclusions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="blogs" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none px-4 py-3"
                    onClick={loadRelatedBlogs}
                  >
                    📝 Blog/Useful Tips
                  </TabsTrigger>
                  <TabsTrigger
                    value="visa"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none px-4 py-3"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Visa Assistance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="download" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none px-4 py-3"
                  >
                    📄 Download Itinerary
                  </TabsTrigger>
                </TabsList>

<TabsContent value="trip" className="mt-6">
  <Card>
    <CardContent className="p-6">
      <h3 className="text-xl font-bold mb-6">Detailed Itinerary</h3>
      <div className="space-y-8">
        {(() => {
          let currentLocation = package_.destinations[0];
          
          return processedItinerary.filteredItinerary.map((day: any, index: number) => {
            const dayDate = selectedDate ? 
              new Date(selectedDate.getTime() + (index * 24 * 60 * 60 * 1000)) : 
              new Date();
            
            // Find any transportation activities for this day (to be shown BEFORE the day)
            const transportBefore = processedItinerary.transportationActivities.filter(t => t.day === day.day);
            
            // Update location if there are transportation activities before this day
            transportBefore.forEach(transport => {
              if (transport.activity.toLowerCase().includes('to')) {
                const parts = transport.activity.split('to');
                if (parts.length > 1) {
                  currentLocation = parts[1].trim();
                }
              }
            });

            return (
              <React.Fragment key={`day-container-${day.day}`}>
                {/* Transportation Card if exists before this day */}
                {transportBefore.map((transport, transportIndex) => (
                  <div key={`transport-${day.day}-${transportIndex}`} className="flex flex-col items-center justify-center my-4">
                    <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-200 flex flex-col items-center justify-center shadow-sm">
                      <p className="text-xs text-center text-gray-600 mb-1 px-2">Travelling </p>
                      <div className="text-blue-600">
                        {transport.activity.toLowerCase().includes('flight') ? (
                          <Plane className="h-6 w-6 mx-auto" />
                        ) : transport.activity.toLowerCase().includes('train') ? (
                          <Train className="h-6 w-6 mx-auto" />
                        ) : transport.activity.toLowerCase().includes('bus') ? (
                          <Bus className="h-6 w-6 mx-auto" />
                        ) : (
                          <Ship className="h-6 w-6 mx-auto" />
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1 px-2">
                        {transport.activity.split('to')[1]?.trim() || ''}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Regular Day Card */}
                <div key={`day-${day.day}`} className="relative">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-t-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xl text-gray-900 mb-1">
                          Day {day.day}
                        </h4>
                        <h5 className="font-semibold text-lg text-green-700 mb-2">
                          {day.title || `Explore ${currentLocation}`}
                        </h5>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(dayDate, 'EEE, dd MMM')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{currentLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-t-0 rounded-b-lg p-6 shadow-sm">
                    <div className="space-y-6">
                      {day.activities?.map((activity: string, i: number) => {
                        // Split activity into main part and description (after colon)
                        const [mainPart, description] = activity.split(':').map(part => part.trim());
                        
                        // Extract clean activity name (without duration in parentheses)
                        const cleanActivity = mainPart.replace(/\(\d+(?:\s*-\s*\d+)?\s*(?:hours|hrs|hour|h|days|d)\)/i, '').trim();
                        
                        // Extract duration if specified in parentheses
                        const durationMatch = mainPart.match(/\((\d+(?:\s*-\s*\d+)?\s*(?:hours|hrs|hour|h|days|d))\)/i);
                        const duration = durationMatch ? 
                          durationMatch[1].replace(/\s*-\s*/g, '-') : 
                          '2-3 hours';

                        return (
                          <div key={i} className="relative">
                            <div className="flex items-start gap-6 group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                              <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                  {getActivityIcon(activity)}
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-500 text-center">
                                  {getTimeSlot(i)}
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-base font-semibold text-gray-900 mb-1">
                                      {cleanActivity}
                                    </p>
                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {duration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {currentLocation}
                                        </span>
                                      </div>
                                      {description && (
                                        <p className="text-gray-700 mt-1 italic">
                                          {description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>
    </CardContent>
  </Card>
</TabsContent>



                <TabsContent value="inclusions" className="mt-6">
                  {packageDetail?.attractions && packageDetail.attractions.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4">Top Attractions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {packageDetail.attractions.map((attraction, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <MapPin className="h-5 w-5 text-travel-primary" />
                              <span>{attraction}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Package Inclusions</h3>
                      <div className="space-y-3">
                        {package_.includes.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="blogs" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-6">Blog & Useful Tips</h3>
                      
                      {blogsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-primary"></div>
                        </div>
                      ) : relatedBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {relatedBlogs.map((blog) => (
                            <div
                              key={blog.id}
                              onClick={() => navigate(`/blog/${blog.id}`)}
                              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                            >
                              {blog.image && (
                                <img 
                                  src={blog.image}
                                  alt={blog.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <div className="p-4">
                                <h4 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-travel-primary transition-colors">
                                  {blog.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                  {blog.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>{blog.author}</span>
                                  <span>{formatDate(blog.date_written || blog.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No related articles found for this destination.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="visa" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-6">Visa Assistance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Departure Country</label>
                            <select
                                value={visaOrigin}
                                onChange={(e) => setVisaOrigin(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Destination Country</label>
                              <select
                                  value={visaDestination}
                                  onChange={(e) => setVisaDestination(e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                  <option value="">Select Country</option>
                                  {countries.map((country) => (
                                      <option key={country} value={country}>{country}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Visa Duration</label>
                              <select
                                  value={visaDuration}
                                  onChange={(e) => setVisaDuration(e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  disabled={!visaDestination}
                              >
                                  {visaDurations.map((d) => (
                                      <option key={d} value={d}>{d}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Number of Members</label>
                              <div className="flex items-center gap-4 mt-1">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setVisaMembers(Math.max(1, visaMembers - 1))}
                                      disabled={visaMembers <= 1}
                                  >
                                      <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-semibold">{visaMembers}</span>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setVisaMembers(visaMembers + 1)}
                                  >
                                      <Plus className="h-4 w-4" />
                                  </Button>
                              </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4 flex flex-col justify-center">
                          <h4 className="text-lg font-bold">Visa Cost Summary</h4>
                          <div className="flex justify-between">
                              <span>Visa Cost per Member:</span>
                              <span className="font-semibold">₹{calculatedVisaCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Members:</span>
                              <span className="font-semibold">{visaMembers}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between text-xl font-bold">
                              <span>Total Visa Cost:</span>
                              <span className="text-green-600">₹{totalVisaCost.toLocaleString()}</span>
                          </div>
                          
                          <Button
                              className={`w-full ${addedVisaCost > 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
                              onClick={() => {
                                  if (addedVisaCost > 0) {
                                      setAddedVisaCost(0);
                                  } else {
                                      setAddedVisaCost(totalVisaCost);
                                  }
                              }}
                              disabled={totalVisaCost === 0 && addedVisaCost === 0}
                              variant={addedVisaCost > 0 ? "destructive" : "default"}
                          >
                              {addedVisaCost > 0 ? `Remove Visa Cost (₹${addedVisaCost.toLocaleString()})` : "Add Visa Cost to Package"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="download" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-6">
                        <div className="max-w-md mx-auto">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Download Your Itinerary</h3>
                          <p className="text-gray-600 mb-6">
                            Get a comprehensive PDF document with your complete travel itinerary, 
                            including day-by-day activities, pricing details, and package inclusions.
                          </p>
                          
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Your PDF will include:</h4>
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Complete {selectedDays}-day itinerary</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Pricing breakdown for {members} member(s)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Package inclusions & attractions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Day-wise activity schedule</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            onClick={generatePDF}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg"
                            size="lg"
                          >
                            <Download className="mr-2 h-5 w-5" />
                            Download PDF Itinerary
                          </Button>
                          
                          <p className="text-xs text-gray-500 mt-3">
                            PDF will be downloaded to your device immediately
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center pb-4 border-b">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{grandTotalPrice.toLocaleString()}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">All Inclusive</p>
                    {originalPrice > 0 && totalOriginalPrice > totalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{totalOriginalPrice.toLocaleString()}
                      </p>
                    )}
                    {addedVisaCost > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        + ₹{addedVisaCost.toLocaleString()} (Visa)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Select Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Flight Options</label>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        <span className="text-sm font-medium">{withFlights ? 'With Flights' : 'Without Flights'}</span>
                      </div>
                      <Switch
                        checked={withFlights}
                        onCheckedChange={setWithFlights}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableDays.map((day) => (
                        <Button
                          key={day}
                          variant={selectedDays === day ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDays(day)}
                          className="h-10"
                        >
                          {day}D
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Number of Members</label>
                    <div className="flex items-center justify-center gap-4 p-4 border rounded-lg">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMembers(Math.max(1, members - 1))}
                        disabled={members === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-semibold w-12 text-center">{members}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMembers(members + 1)}
                        disabled={members === 20}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {members > 1 && (
                      <div className="text-xs text-gray-500 text-left">
                        <p>Price breakdown for {members} members:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {withFlights && (
                            <>
                              <li>Flights: ₹{(getCurrentPrice() - (packageDetail?.pricing?.without_flights[selectedDays.toString()] || packageDetail?.pricing?.without_flights['3'] || 0)) * members}</li>
                              <li>Base: ₹{(packageDetail?.pricing?.without_flights[selectedDays.toString()] || packageDetail?.pricing?.without_flights['3'] || 0) * members}</li>
                            </>
                          )}
                          {!withFlights && (
                            <li>Base Price: ₹{getCurrentPrice() * members}</li>
                          )}
                          {addedVisaCost > 0 && (
                            <li>Visa: ₹{addedVisaCost.toLocaleString()}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Price per person: ₹{Math.round(grandTotalPrice / members).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 h-12" 
                      size="lg"
                      onClick={() => setIsBookingPopupOpen(true)}
                    >
                      Book this trip
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12" 
                      size="lg"
                      onClick={addToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BookingPopup
        open={isBookingPopupOpen}
        onOpenChange={setIsBookingPopupOpen}
        packageData={package_ ? { 
          id: package_.id, 
          nights: selectedDays 
        } : null}
        members={members}
        totalPrice={grandTotalPrice}
        withFlights={withFlights}
        selectedDate={selectedDate}
        visaCost={addedVisaCost}
      />
    </div>
  );
};

export default PackageDetail;