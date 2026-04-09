import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/chat/ChatWidget';
import ChatWindow from './components/chat/ChatWindow';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Public Pages
import { 
  HomePage, 
  ShopPage, 
  CollectionPage, 
  ProductPage, 
  NotFoundPage,
  StyleLoungePage,
  EventsPage,
  OurStoryPage,
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AccountLayout,
  DashboardPage,
  OrdersPage,
  WishlistPage,
  AddressesPage,
  SettingsPage
} from './pages';

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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collections/:handle" element={<CollectionPage />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          
          {/* Content Pages */}
          <Route path="/style-lounge" element={<StyleLoungePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          
          {/* Collection Category Routes */}
          <Route path="/collections/brands" element={<CollectionPage />} />
          <Route path="/collections/occasions" element={<CollectionPage />} />
          <Route path="/collections/gifts" element={<CollectionPage />} />
          <Route path="/collections/sale" element={<CollectionPage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Account Routes */}
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* 404 - Catch All */}
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
