import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Crown,
  Star,
  Gem,
  Check,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierInfo {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  benefits: string[];
}

const tierData: Record<MemberTier, TierInfo> = {
  bronze: {
    name: 'Bronze',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600',
    minPoints: 0,
    maxPoints: 499,
    multiplier: 1,
    benefits: [
      'Member pricing on all products',
      'Birthday reward',
      'Free shipping over $75',
    ],
  },
  silver: {
    name: 'Silver',
    icon: Star,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400',
    minPoints: 500,
    maxPoints: 1499,
    multiplier: 1.5,
    benefits: [
      'All Bronze benefits',
      '2x points on purchases',
      'Early access to sales',
      'Exclusive member events',
      'Free shipping over $50',
    ],
  },
  gold: {
    name: 'Gold',
    icon: Crown,
    color: 'text-pj-gold',
    bgColor: 'bg-pj-gold',
    minPoints: 1500,
    maxPoints: 4999,
    multiplier: 2,
    benefits: [
      'All Silver benefits',
      'Access to exclusive collections',
      '3x points on purchases',
      '48-hour early access',
      'Free shipping on all orders',
      'Priority customer support',
    ],
  },
  platinum: {
    name: 'Platinum',
    icon: Gem,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400',
    minPoints: 5000,
    maxPoints: Infinity,
    multiplier: 3,
    benefits: [
      'All Gold benefits',
      '3x points on all purchases',
      'First access to limited editions',
      'VIP styling consultations',
      'Exclusive Platinum events',
      'Dedicated support line',
      'Surprise gifts',
    ],
  },
};

interface TierBenefitsProps {
  currentTier: MemberTier;
  currentPoints: number;
  onViewAllBenefits?: () => void;
}

export const TierBenefits: React.FC<TierBenefitsProps> = ({
  currentTier,
  currentPoints,
  onViewAllBenefits,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTierInfo = tierData[currentTier];
  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? tierData[nextTier] : null;

  const progressToNext = nextTierInfo
    ? Math.min(
        100,
        ((currentPoints - currentTierInfo.minPoints) /
          (nextTierInfo.minPoints - currentTierInfo.minPoints)) *
          100
      )
    : 100;

  const pointsNeeded = nextTierInfo
    ? nextTierInfo.minPoints - currentPoints
    : 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tier-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  function getNextTier(tier: MemberTier): MemberTier | null {
    const tiers: MemberTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  const CurrentTierIcon = currentTierInfo.icon;

  return (
    <div ref={containerRef} className="w-full">
      {/* Current Tier Header */}
      <div className="tier-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1F3C] to-[#0a1628] border border-pj-gold/20 p-6 md:p-8">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pj-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Tier Info */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl ${currentTierInfo.bgColor}/20 flex items-center justify-center`}
            >
              <CurrentTierIcon
                className={`w-8 h-8 ${currentTierInfo.color}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-pj-blue/70 uppercase tracking-wider">
                  Current Tier
                </span>
                <Sparkles className="w-4 h-4 text-pj-gold" />
              </div>
              <h2 className={`text-2xl md:text-3xl font-bold ${currentTierInfo.color}`}>
                {currentTierInfo.name}
              </h2>
              <p className="text-pj-blue/70 text-sm mt-1">
                {currentTierInfo.multiplier}x Points Multiplier
              </p>
            </div>
          </div>

          {/* Points Display */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">
                {currentPoints.toLocaleString()}
              </p>
              <p className="text-sm text-pj-blue/70">Total Points</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="hidden md:block text-center">
              <p className="text-2xl md:text-3xl font-bold text-pj-gold">
                {Math.floor(currentPoints / 100) * 5}
              </p>
              <p className="text-sm text-pj-blue/70">Rewards Value ($)</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTierInfo && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-pj-blue/70">
                Progress to {nextTierInfo.name}
              </span>
              <span className="text-sm font-medium text-white">
                {pointsNeeded.toLocaleString()} points needed
              </span>
            </div>
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${currentTierInfo.bgColor} rounded-full transition-all duration-1000`}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-pj-blue/50">
              <span>{currentTierInfo.minPoints.toLocaleString()}</span>
              <span>{nextTierInfo.minPoints.toLocaleString()}</span>
            </div>
          </div>
        )}

        {onViewAllBenefits && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              className="text-pj-gold hover:text-pj-gold/80 hover:bg-pj-gold/10"
              onClick={onViewAllBenefits}
            >
              View All Benefits
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Benefits Checklist */}
      <div className="mt-6 tier-card">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Unlocked Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentTierInfo.benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              <div className="w-6 h-6 rounded-full bg-pj-gold/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-pj-gold" />
              </div>
              <span className="text-sm text-pj-cream">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Tiers Preview */}
      {nextTierInfo && (
        <div className="mt-6 tier-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Coming Up at {nextTierInfo.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nextTier && tierData[nextTier].benefits
              .filter(
                (benefit: string) =>
                  !currentTierInfo.benefits.some((b: string) =>
                    benefit.toLowerCase().includes(b.toLowerCase().split(' ')[0])
                  )
              )
              .slice(0, 4)
              .map((benefit: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 opacity-60"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-3 h-3 text-pj-blue/50" />
                  </div>
                  <span className="text-sm text-pj-blue/70">{benefit}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Tiers Overview */}
      <div className="mt-6 tier-card">
        <h3 className="text-lg font-semibold text-white mb-4">Tier Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(tierData) as MemberTier[]).map((tier) => {
            const tierInfo = tierData[tier];
            const TierIcon = tierInfo.icon;
            const isCurrent = tier === currentTier;
            const isLocked = currentPoints < tierInfo.minPoints;

            return (
              <div
                key={tier}
                className={`relative p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-pj-gold/50 bg-pj-gold/10'
                    : isLocked
                    ? 'border-white/5 bg-white/5 opacity-50'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-pj-gold text-pj-navy text-xs font-semibold rounded-full">
                    Current
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  <TierIcon
                    className={`w-6 h-6 mb-2 ${
                      isCurrent ? tierInfo.color : 'text-pj-blue/50'
                    }`}
                  />
                  <p
                    className={`font-semibold ${
                      isCurrent ? 'text-white' : 'text-pj-blue/70'
                    }`}
                  >
                    {tierInfo.name}
                  </p>
                  <p className="text-xs text-pj-blue/50 mt-1">
                    {tierInfo.multiplier}x Points
                  </p>
                  <p className="text-xs text-pj-blue/40 mt-1">
                    {tierInfo.minPoints.toLocaleString()}+ pts
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TierBenefits;
