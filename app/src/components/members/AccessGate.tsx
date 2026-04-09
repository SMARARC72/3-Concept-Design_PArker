import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Lock, Sparkles, Star, Clock, Zap, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessGateProps {
  onLogin: () => void;
  onSignup: () => void;
  previewProducts?: Array<{
    id: string;
    name: string;
    image: string;
    memberPrice: number;
    regularPrice: number;
  }>;
}

const benefits = [
  {
    icon: Sparkles,
    title: 'Exclusive Items',
    description: 'Access limited edition products not available to the public',
  },
  {
    icon: Star,
    title: 'Member Pricing',
    description: 'Save up to 30% on every purchase with exclusive member rates',
  },
  {
    icon: Clock,
    title: 'Early Access',
    description: 'Shop new collections 48 hours before everyone else',
  },
  {
    icon: Zap,
    title: 'Bonus Points',
    description: 'Earn 2x-3x points on every purchase for faster rewards',
  },
];

export const AccessGate: React.FC<AccessGateProps> = ({
  onLogin,
  onSignup,
  previewProducts = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gate animation
      gsap.fromTo(
        gateRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Benefits stagger animation
      gsap.fromTo(
        '.benefit-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0F1F3C] to-[#0a1628]">
      {/* Blurred Background Preview */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F1F3C]/80 to-[#0a1628]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 blur-xl opacity-30">
          {previewProducts.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="aspect-[3/4] bg-pj-navy/40 rounded-lg"
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Locked Gate */}
        <div
          ref={gateRef}
          className="w-full max-w-2xl mx-auto text-center"
        >
          {/* Lock Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-pj-gold/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pj-gold/30 to-pj-gold/10 border border-pj-gold/50 flex items-center justify-center">
              <Lock className="w-12 h-12 text-pj-gold" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Members Only
          </h1>
          <p className="text-lg md:text-xl text-pj-blue/80 mb-8 max-w-lg mx-auto">
            Unlock exclusive access to limited edition collections, member-only pricing, and VIP experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={onLogin}
              size="lg"
              className="bg-pj-gold hover:bg-pj-gold/90 text-pj-navy font-semibold px-8 h-14 text-lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Member Login
            </Button>
            <Button
              onClick={onSignup}
              size="lg"
              variant="outline"
              className="border-pj-gold/50 text-pj-gold hover:bg-pj-gold/10 px-8 h-14 text-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Join Now
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div ref={benefitsRef} className="w-full max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-semibold text-white mb-8">
            Exclusive Member Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="benefit-card group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-pj-gold/30 transition-all duration-300 hover:shadow-2xl hover:shadow-pj-gold/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pj-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-pj-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-6 h-6 text-pj-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-pj-blue/70">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-pj-blue/60">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            50,000+ Members
          </span>
          <span className="w-1 h-1 rounded-full bg-pj-gold/50" />
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            4.9/5 Rating
          </span>
          <span className="w-1 h-1 rounded-full bg-pj-gold/50" />
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Free Shipping
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;
