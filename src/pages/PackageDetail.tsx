@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;

    /* Custom travel colors */
    --travel-primary: 185 98% 25%;
    --travel-secondary: 49 100% 80%;
    --travel-accent: 278 100% 65%;
    --travel-light: 185 100% 95%;
    --travel-dark: 185 100% 15%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom travel theme */
.travel-primary {
  color: hsl(var(--travel-primary));
}

.bg-travel-primary {
  background-color: hsl(var(--travel-primary));
}

.travel-secondary {
  color: hsl(var(--travel-secondary));
}

.bg-travel-secondary {
  background-color: hsl(var(--travel-secondary));
}

.travel-accent {
  color: hsl(var(--travel-accent));
}

.bg-travel-accent {
  background-color: hsl(var(--travel-accent));
}

.travel-light {
  color: hsl(var(--travel-light));
}

.bg-travel-light {
  background-color: hsl(var(--travel-light));
}

.travel-dark {
  color: hsl(var(--travel-dark));
}

.bg-travel-dark {
  background-color: hsl(var(--travel-dark));
}

/* Mobile-specific utilities */
@media (max-width: 768px) {
  .mobile-padding {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .mobile-text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .mobile-spacing {
    margin-bottom: 1rem;
  }
}

/* Responsive text utilities */
.responsive-text-xs {
  font-size: 0.75rem;
}

@media (min-width: 768px) {
  .responsive-text-xs {
    font-size: 0.875rem;
  }
}

.responsive-text-sm {
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .responsive-text-sm {
    font-size: 1rem;
  }
}

/* Line clamp utilities for mobile */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

/* Custom gradients */
.bg-gradient-hero {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3));
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Travel button styles */
.travel-btn {
  @apply bg-travel-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-travel-primary/90 transition-colors shadow-lg;
}

/* Mobile travel button */
@media (max-width: 768px) {
  .travel-btn {
    @apply px-4 py-2.5 text-sm;
  }
}

/* Search container */
.search-container {
  backdrop-filter: blur(10px);
}

/* Pill button styles */
.pill-button {
  @apply bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors text-sm font-medium;
}

/* Mobile pill button */
@media (max-width: 768px) {
  .pill-button {
    @apply px-3 py-1.5 text-xs;
  }
}

/* Navigation link styles */
.nav-link {
  @apply text-gray-700 hover:text-travel-primary font-medium transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent;
}

/* Destination card styles */
.destination-card {
  @apply bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden;
}

.destination-card:hover {
  transform: translateY(-5px);
}

/* Mobile destination card */
@media (max-width: 768px) {
  .destination-card:hover {
    transform: translateY(-2px);
  }
}

/* Mobile-specific grid adjustments */
@media (max-width: 640px) {
  .mobile-grid-adjust {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .mobile-grid-adjust {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

/* Ensure proper touch targets on mobile */
@media (max-width: 768px) {
  button, .cursor-pointer {
    min-height: 44px;
    min-width: 44px;
  }
  
  input, select, textarea {
    min-height: 44px;
  }
}

/* Safe area utilities for mobile devices */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Mobile responsive height utilities */
.mobile-hero-height {
  height: 14rem; /* 56 = h-56 */
}

@media (min-width: 640px) {
  .mobile-hero-height {
    height: 16rem; /* 64 = h-64 */
  }
}

@media (min-width: 768px) {
  .mobile-hero-height {
    height: 20rem; /* 80 = h-80 */
  }
}

@media (min-width: 1024px) {
  .mobile-hero-height {
    height: 24rem; /* 96 = h-96 */
  }
}

/* Enhanced mobile touch interactions */
@media (max-width: 768px) {
  .touch-friendly {
    padding: 0.75rem;
    min-height: 44px;
    min-width: 44px;
  }
  
  .touch-friendly-sm {
    padding: 0.5rem;
    min-height: 40px;
    min-width: 40px;
  }
}

/* Mobile gallery improvements */
.mobile-gallery-nav {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  padding: 0.75rem;
}

@media (min-width: 768px) {
  .mobile-gallery-nav {
    padding: 1rem;
  }
}

/* Mobile sticky bottom improvements */
.mobile-sticky-bottom {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Mobile text scaling improvements */
@media (max-width: 640px) {
  .mobile-text-scale h1 {
    font-size: 1.125rem; /* text-lg */
    line-height: 1.4;
  }
  
  .mobile-text-scale h2 {
    font-size: 1rem; /* text-base */
    line-height: 1.4;
  }
  
  .mobile-text-scale h3 {
    font-size: 0.875rem; /* text-sm */
    line-height: 1.4;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .mobile-text-scale h1 {
    font-size: 1.25rem; /* text-xl */
    line-height: 1.4;
  }
  
  .mobile-text-scale h2 {
    font-size: 1.125rem; /* text-lg */
    line-height: 1.4;
  }
  
  .mobile-text-scale h3 {
    font-size: 1rem; /* text-base */
    line-height: 1.4;
  }
}