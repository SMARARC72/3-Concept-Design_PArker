import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Lock,
  Crown,
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  Star,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MemberTier } from './TierBenefits';

export interface ExclusiveProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  regularPrice: number;
  memberPrice: number;
  category: string;
  tierRequired: MemberTier;
  pointsMultiplier: number;
  isLimitedEdition?: boolean;
  stockRemaining?: number;
  releaseDate?: Date;
}

interface ExclusiveProductCardProps {
  product: ExclusiveProduct;
  userTier: MemberTier;
  onAddToCart: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  index?: number;
}

const tierOrder: MemberTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export const ExclusiveProductCard: React.FC<ExclusiveProductCardProps> = ({
  product,
  userTier,
  onAddToCart,
  onViewDetails,
  onAddToWishlist,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(product.tierRequired);
  const isLocked = userTierIndex < requiredTierIndex;
  const savings = product.regularPrice - product.memberPrice;
  const savingsPercent = Math.round((savings / product.regularPrice) * 100);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power2.out',
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  useEffect(() => {
    if (isHovered && !isLocked) {
      gsap.to('.card-image', {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      gsap.to('.card-image', {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [isHovered, isLocked]);

  const getTierColor = (tier: MemberTier): string => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-600';
      case 'silver':
        return 'text-slate-400';
      case 'gold':
        return 'text-pj-gold';
      case 'platinum':
        return 'text-purple-400';
      default:
        return 'text-pj-blue';
    }
  };

  const getTierBgColor = (tier: MemberTier): string => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-600/20';
      case 'silver':
        return 'bg-slate-400/20';
      case 'gold':
        return 'bg-pj-gold/20';
      case 'platinum':
        return 'bg-purple-400/20';
      default:
        return 'bg-pj-blue/20';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0F1F3C] to-[#0a1628] border ${
        isLocked ? 'border-white/5' : 'border-pj-gold/20 hover:border-pj-gold/40'
      } transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Product Image */}
        <div
          className={`card-image absolute inset-0 bg-pj-navy/40 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${product.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-pj-navy/60 animate-pulse" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isLimitedEdition && (
            <Badge className="bg-red-500/80 text-white border-0 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Limited Edition
            </Badge>
          )}
          <Badge className="bg-pj-gold/90 text-pj-navy border-0 text-xs font-semibold">
            <Crown className="w-3 h-3 mr-1" />
            Members Only
          </Badge>
        </div>

        {/* Points Multiplier Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`${getTierBgColor(
              product.tierRequired
            )} ${getTierColor(product.tierRequired)} border-0 text-xs`}
          >
            <Star className="w-3 h-3 mr-1" />
            {product.pointsMultiplier}x Points
          </Badge>
        </div>

        {/* Stock Indicator */}
        {product.stockRemaining && product.stockRemaining <= 20 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-red-500/80 text-white border-0 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Only {product.stockRemaining} left
            </Badge>
          </div>
        )}

        {/* Lock Overlay for Restricted Tiers */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#0a1628]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <Lock className="w-8 h-8 text-pj-gold" />
            </div>
            <p className="text-white font-semibold mb-1">
              Unlock at {product.tierRequired.charAt(0).toUpperCase() + product.tierRequired.slice(1)}
            </p>
            <p className="text-pj-blue/70 text-sm text-center px-6">
              Upgrade your tier to access this exclusive item
            </p>
          </div>
        )}

        {/* Quick Actions (visible on hover when unlocked) */}
        {!isLocked && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
              onClick={() => onViewDetails(product.id)}
            >
              <Eye className="w-4 h-4 text-pj-navy" />
            </Button>
            {onAddToWishlist && (
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
                onClick={() => onAddToWishlist(product.id)}
              >
                <Heart className="w-4 h-4 text-pj-navy" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Tier */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-pj-blue/70 uppercase tracking-wider">
            {product.category}
          </span>
          <span
            className={`text-xs font-medium ${getTierColor(
              product.tierRequired
            )} flex items-center gap-1`}
          >
            <Crown className="w-3 h-3" />
            {product.tierRequired}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-white font-semibold mb-1 line-clamp-1 group-hover:text-pj-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-pj-blue/60 line-clamp-1 mb-3">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-pj-gold">
            ${product.memberPrice}
          </span>
          <span className="text-sm text-pj-blue/50 line-through">
            ${product.regularPrice}
          </span>
          <span className="text-xs text-green-400 font-medium">
            Save {savingsPercent}%
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full bg-pj-gold hover:bg-pj-gold/90 text-pj-navy font-semibold"
          disabled={isLocked}
          onClick={() => !isLocked && onAddToCart(product.id)}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExclusiveProductCard;
