import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/chat/ChatWidget';
import ChatWindow from './components/chat/ChatWindow';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import NotFoundPage from './pages/NotFoundPage';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const { isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh();
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-pj-cream">
      <Navigation onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collections/:handle" element={<CollectionPage />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ChatWidget />
      <ChatWindow />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
