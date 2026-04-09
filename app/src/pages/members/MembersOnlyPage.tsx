import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Lock,
  Crown,
  Sparkles,
  Clock,
  ChevronRight,
  Gem,
  Star,
  Timer,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { AccessGate } from '@/components/members/AccessGate';
import { TierBenefits, type MemberTier } from '@/components/members/TierBenefits';
import { ExclusiveProductCard, type ExclusiveProduct } from '@/components/members/ExclusiveProductCard';

// Mock member data - would come from backend
const MOCK_MEMBER_DATA = {
  tier: 'gold' as MemberTier,
  points: 2340,
  nextTierPoints: 5000,
};

// Mock exclusive products data
const EXCLUSIVE_PRODUCTS: ExclusiveProduct[] = [
  {
    id: 'exclusive-1',
    name: 'Limited Edition Holiday Blazer',
    description: 'Handcrafted wool blend blazer with gold embroidery',
    image: '/product-1.jpg',
    regularPrice: 189,
    memberPrice: 149,
    category: 'Limited Edition',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 12,
  },
  {
    id: 'exclusive-2',
    name: 'Heritage Collection Chinos',
    description: 'Premium selvedge cotton chinos in classic navy',
    image: '/product-2.jpg',
    regularPrice: 98,
    memberPrice: 78,
    category: 'Heritage',
    tierRequired: 'silver',
    pointsMultiplier: 2,
    stockRemaining: 45,
  },
  {
    id: 'exclusive-3',
    name: 'Designer Collaboration Polo',
    description: 'Exclusive capsule collection with renowned designer',
    image: '/product-3.jpg',
    regularPrice: 125,
    memberPrice: 95,
    category: 'Collaboration',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 8,
  },
  {
    id: 'exclusive-4',
    name: 'Vintage Western Shirt',
    description: 'Authentic reproduction of 1950s western wear',
    image: '/product-1.jpg',
    regularPrice: 145,
    memberPrice: 115,
    category: 'Vintage',
    tierRequired: 'silver',
    pointsMultiplier: 2,
    stockRemaining: 23,
  },
  {
    id: 'exclusive-5',
    name: 'Silk Pocket Square Set',
    description: 'Hand-rolled silk pocket squares in three patterns',
    image: '/product-2.jpg',
    regularPrice: 65,
    memberPrice: 49,
    category: 'Accessories',
    tierRequired: 'bronze',
    pointsMultiplier: 1.5,
    stockRemaining: 67,
  },
  {
    id: 'exclusive-6',
    name: 'Monogrammed Dress Shirt',
    description: 'Custom monogramming on premium Egyptian cotton',
    image: '/product-3.jpg',
    regularPrice: 165,
    memberPrice: 129,
    category: 'Limited Edition',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 15,
  },
  {
    id: 'exclusive-7',
    name: 'Cashmere Blend Sweater',
    description: 'Luxurious cashmere-wool blend in charcoal',
    image: '/product-1.jpg',
    regularPrice: 245,
    memberPrice: 189,
    category: 'Heritage',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    stockRemaining: 19,
  },
  {
    id: 'exclusive-8',
    name: 'Artisan Leather Belt',
    description: 'Hand-stitched full-grain leather belt',
    image: '/product-2.jpg',
    regularPrice: 85,
    memberPrice: 65,
    category: 'Accessories',
    tierRequired: 'silver',
    pointsMultiplier: 2,
    stockRemaining: 34,
  },
  {
    id: 'exclusive-9',
    name: 'Platinum Exclusive Overcoat',
    description: 'Limited run camel hair overcoat - Platinum members only',
    image: '/product-3.jpg',
    regularPrice: 495,
    memberPrice: 379,
    category: 'Platinum Exclusive',
    tierRequired: 'platinum',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 5,
  },
  {
    id: 'exclusive-10',
    name: 'Heritage Denim Jacket',
    description: 'Selvedge denim jacket with vintage wash',
    image: '/product-1.jpg',
    regularPrice: 178,
    memberPrice: 139,
    category: 'Vintage',
    tierRequired: 'silver',
    pointsMultiplier: 2,
    stockRemaining: 28,
  },
  {
    id: 'exclusive-11',
    name: 'Signature Scarf Collection',
    description: 'Italian wool scarves in seasonal colors',
    image: '/product-2.jpg',
    regularPrice: 95,
    memberPrice: 72,
    category: 'Accessories',
    tierRequired: 'bronze',
    pointsMultiplier: 1.5,
    stockRemaining: 56,
  },
  {
    id: 'exclusive-12',
    name: 'Tailored Wool Trousers',
    description: 'Bespoke-fit trousers in winter flannel',
    image: '/product-3.jpg',
    regularPrice: 195,
    memberPrice: 155,
    category: 'Heritage',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    stockRemaining: 21,
  },
  {
    id: 'exclusive-13',
    name: 'Collaboration Sneakers',
    description: 'Limited edition leather sneakers',
    image: '/product-1.jpg',
    regularPrice: 225,
    memberPrice: 175,
    category: 'Collaboration',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 7,
  },
  {
    id: 'exclusive-14',
    name: 'Vintage inspired Waistcoat',
    description: 'Three-piece suit waistcoat in herringbone',
    image: '/product-2.jpg',
    regularPrice: 135,
    memberPrice: 105,
    category: 'Vintage',
    tierRequired: 'silver',
    pointsMultiplier: 2,
    stockRemaining: 18,
  },
  {
    id: 'exclusive-15',
    name: 'Cufflink Collection',
    description: 'Sterling silver cufflinks with onyx inlay',
    image: '/product-3.jpg',
    regularPrice: 145,
    memberPrice: 115,
    category: 'Accessories',
    tierRequired: 'gold',
    pointsMultiplier: 3,
    isLimitedEdition: true,
    stockRemaining: 11,
  },
];

// Upcoming releases for countdown
const UPCOMING_RELEASES = [
  {
    id: 'upcoming-1',
    name: 'Spring Collection Preview',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    image: '/category-apparel.jpg',
  },
  {
    id: 'upcoming-2',
    name: 'Heritage Capsule Drop',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    image: '/category-western.jpg',
  },
];

// Countdown Timer Component
const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit: React.FC<{ value: number; label: string }> = ({
    value,
    label,
  }) => (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-pj-gold/10 border border-pj-gold/30 flex items-center justify-center">
        <span className="text-xl md:text-2xl font-bold text-pj-gold">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-pj-blue/70 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-pj-gold text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <span className="text-pj-gold text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="text-pj-gold text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
};

const MembersOnlyPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLogin = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  const handleSignup = useCallback(() => {
    navigate('/auth/signup');
  }, [navigate]);

  const handleAddToCart = useCallback((productId: string) => {
    // Would integrate with cart context
    console.log('Adding to cart:', productId);
  }, []);

  const handleViewDetails = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const ctx = gsap.context(() => {
        // Hero animation
        gsap.fromTo(
          '.hero-content',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );

        // Stagger content sections
        gsap.fromTo(
          '.section-animate',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.section-animate',
              start: 'top 85%',
            },
          }
        );
      }, contentRef);

      return () => ctx.revert();
    }
  }, [isAuthenticated]);

  // Group products by category
  const limitedEdition = EXCLUSIVE_PRODUCTS.filter(
    (p) => p.isLimitedEdition && p.tierRequired !== 'platinum'
  );
  const earlyAccess = EXCLUSIVE_PRODUCTS.filter(
    (p) => p.category === 'Collaboration' || p.category === 'Heritage'
  );
  const vintageCollection = EXCLUSIVE_PRODUCTS.filter(
    (p) => p.category === 'Vintage'
  );
  const platinumExclusives = EXCLUSIVE_PRODUCTS.filter(
    (p) => p.tierRequired === 'platinum'
  );

  if (!isAuthenticated) {
    return (
      <AccessGate
        onLogin={handleLogin}
        onSignup={handleSignup}
        previewProducts={EXCLUSIVE_PRODUCTS.slice(0, 8).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
          memberPrice: p.memberPrice,
          regularPrice: p.regularPrice,
        }))}
      />
    );
  }

  return (
    <div
      ref={contentRef}
      className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0F1F3C] to-[#0a1628]"
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pj-gold/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pj-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pj-blue/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="hero-content relative z-10 text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pj-gold/10 border border-pj-gold/30 mb-6">
            <Crown className="w-4 h-4 text-pj-gold" />
            <span className="text-sm text-pj-gold font-medium">
              {MOCK_MEMBER_DATA.tier.charAt(0).toUpperCase() +
                MOCK_MEMBER_DATA.tier.slice(1)}{' '}
              Member
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Welcome to the
            <span className="block text-pj-gold">Inner Circle</span>
          </h1>

          <p className="text-lg md:text-xl text-pj-blue/80 max-w-2xl mx-auto mb-8">
            Your exclusive portal to limited editions, member-only pricing, and
            first access to everything ParkerJoe.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-pj-blue/70">
              <Lock className="w-4 h-4 text-pj-gold" />
              <span>Exclusive Access</span>
            </div>
            <div className="flex items-center gap-2 text-pj-blue/70">
              <Sparkles className="w-4 h-4 text-pj-gold" />
              <span>Premium Pricing</span>
            </div>
            <div className="flex items-center gap-2 text-pj-blue/70">
              <Clock className="w-4 h-4 text-pj-gold" />
              <span>Early Releases</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Benefits Section */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <TierBenefits
            currentTier={MOCK_MEMBER_DATA.tier}
            currentPoints={MOCK_MEMBER_DATA.points}
          />
        </div>
      </section>

      {/* Early Access Timer Section */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-pj-gold/10 via-pj-gold/5 to-pj-gold/10 border border-pj-gold/20 p-6 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-pj-gold" />
                  <span className="text-sm text-pj-gold font-medium uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {UPCOMING_RELEASES[0].name}
                </h2>
                <p className="text-pj-blue/70">
                  Get ready for exclusive early access as a {MOCK_MEMBER_DATA.tier}{' '}
                  member
                </p>
              </div>
              <CountdownTimer targetDate={UPCOMING_RELEASES[0].date} />
            </div>
          </div>
        </div>
      </section>

      {/* Limited Edition Section */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-pj-gold" />
                <span className="text-sm text-pj-gold font-medium uppercase tracking-wider">
                  Limited Availability
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Limited Edition Collection
              </h2>
            </div>
            <Button
              variant="ghost"
              className="hidden md:flex text-pj-gold hover:text-pj-gold/80 hover:bg-pj-gold/10"
              onClick={() => navigate('/shop?filter=limited')}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {limitedEdition.slice(0, 4).map((product, index) => (
              <ExclusiveProductCard
                key={product.id}
                product={product}
                userTier={MOCK_MEMBER_DATA.tier}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration & Heritage Section */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gem className="w-5 h-5 text-pj-gold" />
                <span className="text-sm text-pj-gold font-medium uppercase tracking-wider">
                  Designer Partnerships
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Collaborations & Heritage
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {earlyAccess.map((product, index) => (
              <ExclusiveProductCard
                key={product.id}
                product={product}
                userTier={MOCK_MEMBER_DATA.tier}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Vintage Collection Section */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-pj-gold" />
                <span className="text-sm text-pj-gold font-medium uppercase tracking-wider">
                  Timeless Style
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Vintage & Heritage
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vintageCollection.map((product, index) => (
              <ExclusiveProductCard
                key={product.id}
                product={product}
                userTier={MOCK_MEMBER_DATA.tier}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Platinum Preview Section (Locked for non-Platinum) */}
      {MOCK_MEMBER_DATA.tier !== 'platinum' && (
        <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-[#0a1628] border border-purple-500/20 p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gem className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Platinum Tier Preview
                  </h2>
                  <p className="text-pj-blue/70">
                    Unlock these exclusive items when you reach Platinum status
                  </p>
                </div>
                <Button
                  className="md:ml-auto bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={() => navigate('/account/membership')}
                >
                  Upgrade to Platinum
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                {platinumExclusives.map((product, index) => (
                  <ExclusiveProductCard
                    key={product.id}
                    product={product}
                    userTier={MOCK_MEMBER_DATA.tier}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Points Multiplier Banner */}
      <section className="section-animate px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-pj-gold/20 via-pj-gold/10 to-pj-gold/20 border border-pj-gold/30 p-6 md:p-10 text-center">
            <Badge className="mb-4 bg-pj-gold/20 text-pj-gold border-pj-gold/30">
              <Star className="w-3 h-3 mr-1" />
              Points Multiplier Active
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Earn {MOCK_MEMBER_DATA.tier === 'platinum' ? '3x' : MOCK_MEMBER_DATA.tier === 'gold' ? '2x' : '1.5x'} Points on Every Purchase
            </h2>
            <p className="text-pj-blue/70 max-w-2xl mx-auto mb-6">
              As a {MOCK_MEMBER_DATA.tier} member, you earn{' '}
              {MOCK_MEMBER_DATA.tier === 'platinum'
                ? 'triple'
                : MOCK_MEMBER_DATA.tier === 'gold'
                ? 'double'
                : 'bonus'}{' '}
              points on all exclusive collection purchases. Reach the next tier faster!
            </p>
            <Button
              className="bg-pj-gold hover:bg-pj-gold/90 text-pj-navy font-semibold"
              onClick={() => navigate('/shop')}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop & Earn Points
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembersOnlyPage;
