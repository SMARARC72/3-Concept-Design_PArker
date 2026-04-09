import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import CategoryNavigator from './sections/CategoryNavigator';
import NewArrivals from './sections/NewArrivals';
import SeasonalCampaign from './sections/SeasonalCampaign';
import BestSellers from './sections/BestSellers';
import FeaturedBrands from './sections/FeaturedBrands';
import GiftGuide from './sections/GiftGuide';
import FounderStory from './sections/FounderStory';
import StoreLocations from './sections/StoreLocations';
import EmailCapture from './sections/EmailCapture';
import Footer from './sections/Footer';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/chat/ChatWidget';
import ChatWindow from './components/chat/ChatWindow';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize ScrollTrigger
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
    });

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <div ref={mainRef} className="min-h-screen bg-pj-cream">
            <Navigation onCartClick={() => setIsCartOpen(true)} />
            <main>
              <Hero />
              <CategoryNavigator />
              <NewArrivals />
              <SeasonalCampaign />
              <BestSellers />
              <FeaturedBrands />
              <GiftGuide />
              <FounderStory />
              <StoreLocations />
              <EmailCapture />
            </main>
            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <ChatWidget />
            <ChatWindow />
          </div>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
