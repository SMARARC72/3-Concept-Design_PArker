import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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
import { GamificationProvider } from './context/GamificationContext';
import {
  AccountLayout,
  AddressesPage,
  CollectionPage,
  DashboardPage,
  EventsPage,
  ForgotPasswordPage,
  GiftCardsPage,
  HomePage,
  InfoPage,
  LoginPage,
  MembersOnlyPage,
  NotFoundPage,
  OrdersPage,
  OurStoryPage,
  PaymentMethodsPage,
  PointsRewardsPage,
  ProductPage,
  ResetPasswordPage,
  SettingsPage,
  ShopPage,
  SignUpPage,
  StyleLoungePage,
  WishlistPage,
} from './pages';

gsap.registerPlugin(ScrollTrigger);

const informationalRoutes = [
  '/contact',
  '/faqs',
  '/shipping',
  '/returns',
  '/size-guide',
  '/gift-cards',
  '/stores',
  '/careers',
  '/press',
  '/wholesale',
  '/privacy',
  '/terms',
  '/accessibility',
];

function AppContent() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const { isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    ScrollTrigger.refresh();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/style-lounge" element={<StyleLoungePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />

          {informationalRoutes.map((path) => (
            <Route key={path} path={path} element={<InfoPage />} />
          ))}

          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MembersOnlyPage />
              </ProtectedRoute>
            }
          />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="payment-methods" element={<PaymentMethodsPage />} />
            <Route path="points-rewards" element={<PointsRewardsPage />} />
            <Route path="membership" element={<PointsRewardsPage />} />
            <Route path="gift-cards" element={<GiftCardsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

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
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <GamificationProvider>
              <AppContent />
            </GamificationProvider>
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
