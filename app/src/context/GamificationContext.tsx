import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  pointsRequired: number;
  category: 'purchase' | 'engagement' | 'social' | 'milestone' | 'special';
  unlockedAt?: string;
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus';
  amount: number;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface Tier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  color: string;
  gradient: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'gift_card' | 'merchandise' | 'discount' | 'experience';
  value: string;
  image?: string;
  available: boolean;
  stock?: number;
  terms?: string;
}

export interface UserGamification {
  currentPoints: number;
  totalPointsEarned: number;
  tier: Tier['name'];
  badges: Badge[];
  transactions: PointsTransaction[];
  redeemedRewards: Array<{
    rewardId: string;
    redeemedAt: string;
    code?: string;
  }>;
}

interface GamificationContextType {
  // User data
  user: UserGamification;
  
  // Points system
  currentPoints: number;
  totalPointsEarned: number;
  addPoints: (amount: number, description: string, metadata?: Record<string, unknown>) => void;
  spendPoints: (amount: number, description: string) => boolean;
  
  // Badges system
  allBadges: Badge[];
  unlockedBadges: Badge[];
  lockedBadges: Badge[];
  unlockBadge: (badgeId: string) => void;
  checkBadgeEligibility: () => Badge[];
  
  // Tier system
  currentTier: Tier;
  nextTier: Tier | null;
  tierProgress: number;
  allTiers: Tier[];
  
  // Rewards system
  allRewards: Reward[];
  availableRewards: Reward[];
  redeemedRewards: Array<{
    reward: Reward;
    redeemedAt: string;
    code?: string;
  }>;
  redeemReward: (rewardId: string) => { success: boolean; code?: string; error?: string };
  
  // Transactions
  recentTransactions: PointsTransaction[];
  getTransactionsByType: (type: PointsTransaction['type']) => PointsTransaction[];
}

// ==================== MOCK DATA ====================

const ALL_BADGES: Badge[] = [
  // Purchase Badges
  {
    id: 'first-purchase',
    name: 'First Purchase',
    description: 'Complete your first order and begin your style journey',
    icon: 'ShoppingBag',
    criteria: 'Place your first order',
    pointsRequired: 0,
    category: 'purchase',
    unlockedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'style-explorer',
    name: 'Style Explorer',
    description: 'Purchase items from 3 different categories',
    icon: 'Compass',
    criteria: 'Buy from 3+ categories',
    pointsRequired: 200,
    category: 'purchase',
    unlockedAt: '2025-02-20T14:15:00Z',
  },
  {
    id: 'fashion-collector',
    name: 'Fashion Collector',
    description: 'Own 20+ items from ParkerJoe collections',
    icon: 'Shirt',
    criteria: 'Purchase 20+ items total',
    pointsRequired: 1000,
    category: 'purchase',
  },
  {
    id: 'big-spender',
    name: 'Big Spender',
    description: 'Spend over $1,000 in a single order',
    icon: 'DollarSign',
    criteria: 'Single order value > $1,000',
    pointsRequired: 500,
    category: 'purchase',
  },
  
  // Engagement Badges
  {
    id: 'reviewer',
    name: 'Style Critic',
    description: 'Leave 5+ reviews on purchased items',
    icon: 'Star',
    criteria: 'Write 5 product reviews',
    pointsRequired: 150,
    category: 'engagement',
    unlockedAt: '2025-03-01T09:45:00Z',
  },
  {
    id: 'photo-reviewer',
    name: 'Visual Storyteller',
    description: 'Share photos in 3+ reviews',
    icon: 'Camera',
    criteria: 'Add photos to 3 reviews',
    pointsRequired: 300,
    category: 'engagement',
  },
  {
    id: 'wishlist-creator',
    name: 'Dream Builder',
    description: 'Save 10+ items to your wishlist',
    icon: 'Heart',
    criteria: 'Have 10+ wishlist items',
    pointsRequired: 100,
    category: 'engagement',
    unlockedAt: '2025-01-25T16:20:00Z',
  },
  {
    id: 'profile-complete',
    name: 'Style Identity',
    description: 'Complete your style profile with all preferences',
    icon: 'UserCheck',
    criteria: 'Complete style profile 100%',
    pointsRequired: 50,
    category: 'engagement',
    unlockedAt: '2025-01-10T11:00:00Z',
  },
  
  // Social Badges
  {
    id: 'referrer',
    name: 'Style Ambassador',
    description: 'Successfully refer 3 friends who make a purchase',
    icon: 'Users',
    criteria: '3 successful referrals',
    pointsRequired: 600,
    category: 'social',
  },
  {
    id: 'social-sharer',
    name: 'Trendsetter',
    description: 'Share your purchases on social media 5 times',
    icon: 'Share2',
    criteria: 'Share 5 purchases socially',
    pointsRequired: 250,
    category: 'social',
  },
  {
    id: 'influencer',
    name: 'Fashion Influencer',
    description: 'Get 50+ likes on your style photos',
    icon: 'TrendingUp',
    criteria: '50+ likes on shared photos',
    pointsRequired: 400,
    category: 'social',
  },
  
  // Milestone Badges
  {
    id: 'loyal-customer',
    name: 'Loyal Customer',
    description: 'Make 10+ purchases over time',
    icon: 'Award',
    criteria: 'Complete 10 orders',
    pointsRequired: 800,
    category: 'milestone',
    unlockedAt: '2025-03-15T13:30:00Z',
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Celebrate 1 year with ParkerJoe',
    icon: 'Calendar',
    criteria: 'Member for 1 year',
    pointsRequired: 0,
    category: 'milestone',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Be among the first 1,000 members',
    icon: 'Sunrise',
    criteria: 'Founding member status',
    pointsRequired: 0,
    category: 'milestone',
    unlockedAt: '2024-12-01T00:00:00Z',
  },
  
  // Special Badges
  {
    id: 'birthday',
    name: 'Birthday VIP',
    description: 'Celebrate your birthday month with us',
    icon: 'Cake',
    criteria: 'Active during birthday month',
    pointsRequired: 0,
    category: 'special',
  },
  {
    id: 'sale-hunter',
    name: 'Sale Hunter',
    description: 'Make 5+ purchases during sale events',
    icon: 'Tag',
    criteria: '5 sale purchases',
    pointsRequired: 350,
    category: 'special',
  },
  {
    id: 'sustainable-style',
    name: 'Eco Warrior',
    description: 'Purchase 5+ items from sustainable collections',
    icon: 'Leaf',
    criteria: '5 sustainable items',
    pointsRequired: 450,
    category: 'special',
  },
];

const TIERS: Tier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday month bonus: 100 points',
      'Access to member-only sales',
      'Free standard shipping on orders $75+',
    ],
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-600',
  },
  {
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 2499,
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Birthday month bonus: 250 points',
      'Early access to new arrivals (24h)',
      'Free standard shipping on orders $50+',
      'Exclusive Silver member events',
    ],
    color: '#C0C0C0',
    gradient: 'from-slate-400 to-slate-300',
  },
  {
    name: 'Gold',
    minPoints: 2500,
    maxPoints: 4999,
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Birthday month bonus: 500 points',
      'Early access to new arrivals (48h)',
      'Free standard shipping on all orders',
      'Free returns on all orders',
      'Quarterly style consultation',
    ],
    color: '#FFD700',
    gradient: 'from-yellow-400 to-yellow-300',
  },
  {
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: 9999,
    benefits: [
      'Earn 2 points per $1 spent',
      'Birthday month bonus: 1,000 points',
      'Early access to new arrivals (72h)',
      'Free expedited shipping on all orders',
      'Priority customer support',
      'Monthly style box recommendations',
      'Exclusive Platinum member gifts',
    ],
    color: '#E5E4E2',
    gradient: 'from-purple-300 to-pink-200',
  },
  {
    name: 'Diamond',
    minPoints: 10000,
    benefits: [
      'Earn 2.5 points per $1 spent',
      'Birthday month bonus: 2,500 points',
      'First access to all new arrivals',
      'Free overnight shipping on all orders',
      'Dedicated personal stylist',
      'Invitation to exclusive fashion events',
      'Limited edition early access',
      'Annual Diamond member gala invitation',
    ],
    color: '#B9F2FF',
    gradient: 'from-cyan-300 to-blue-200',
  },
];

const REWARDS: Reward[] = [
  // Gift Cards
  {
    id: 'gc-10',
    name: '$10 Gift Card',
    description: 'Digital gift card redeemable on any purchase',
    pointsCost: 1000,
    type: 'gift_card',
    value: '$10',
    available: true,
    stock: 999,
    terms: 'Valid for 12 months from redemption',
  },
  {
    id: 'gc-25',
    name: '$25 Gift Card',
    description: 'Digital gift card redeemable on any purchase',
    pointsCost: 2400,
    type: 'gift_card',
    value: '$25',
    available: true,
    stock: 999,
    terms: 'Valid for 12 months from redemption',
  },
  {
    id: 'gc-50',
    name: '$50 Gift Card',
    description: 'Digital gift card redeemable on any purchase',
    pointsCost: 4600,
    type: 'gift_card',
    value: '$50',
    available: true,
    stock: 500,
    terms: 'Valid for 12 months from redemption',
  },
  {
    id: 'gc-100',
    name: '$100 Gift Card',
    description: 'Digital gift card redeemable on any purchase',
    pointsCost: 9000,
    type: 'gift_card',
    value: '$100',
    available: true,
    stock: 200,
    terms: 'Valid for 12 months from redemption',
  },
  
  // Discounts
  {
    id: 'disc-10',
    name: '10% Off Coupon',
    description: 'One-time use discount on any order',
    pointsCost: 500,
    type: 'discount',
    value: '10%',
    available: true,
    stock: 999,
    terms: 'Cannot be combined with other offers',
  },
  {
    id: 'disc-20',
    name: '20% Off Coupon',
    description: 'One-time use discount on any order',
    pointsCost: 1000,
    type: 'discount',
    value: '20%',
    available: true,
    stock: 500,
    terms: 'Cannot be combined with other offers',
  },
  {
    id: 'disc-30',
    name: '30% Off Coupon',
    description: 'One-time use discount on any order',
    pointsCost: 1500,
    type: 'discount',
    value: '30%',
    available: true,
    stock: 200,
    terms: 'Cannot be combined with other offers',
  },
  
  // Merchandise
  {
    id: 'merch-tote',
    name: 'ParkerJoe Tote Bag',
    description: 'Exclusive canvas tote with signature design',
    pointsCost: 800,
    type: 'merchandise',
    value: 'Tote Bag',
    available: true,
    stock: 150,
  },
  {
    id: 'merch-cap',
    name: 'ParkerJoe Snapback',
    description: 'Premium embroidered snapback cap',
    pointsCost: 1200,
    type: 'merchandise',
    value: 'Snapback Cap',
    available: true,
    stock: 100,
  },
  {
    id: 'merch-hoodie',
    name: 'ParkerJoe Hoodie',
    description: 'Limited edition branded hoodie',
    pointsCost: 2500,
    type: 'merchandise',
    value: 'Hoodie',
    available: true,
    stock: 50,
  },
  {
    id: 'merch-jacket',
    name: 'ParkerJoe Bomber Jacket',
    description: 'Exclusive member-only bomber jacket',
    pointsCost: 5000,
    type: 'merchandise',
    value: 'Bomber Jacket',
    available: true,
    stock: 25,
  },
  
  // Experiences
  {
    id: 'exp-styling',
    name: 'Personal Styling Session',
    description: '45-minute virtual styling consultation',
    pointsCost: 2000,
    type: 'experience',
    value: 'Styling Session',
    available: true,
    stock: 30,
  },
  {
    id: 'exp-vip',
    name: 'VIP Shopping Experience',
    description: 'Private in-store shopping with stylist',
    pointsCost: 5000,
    type: 'experience',
    value: 'VIP Experience',
    available: true,
    stock: 10,
  },
  {
    id: 'exp-show',
    name: 'Fashion Show Tickets',
    description: 'Front row seats at our seasonal showcase',
    pointsCost: 8000,
    type: 'experience',
    value: 'Fashion Show',
    available: true,
    stock: 5,
  },
];

const INITIAL_TRANSACTIONS: PointsTransaction[] = [
  {
    id: 'tx-001',
    type: 'earned',
    amount: 100,
    description: 'Welcome bonus',
    date: '2024-12-01T00:00:00Z',
  },
  {
    id: 'tx-002',
    type: 'earned',
    amount: 150,
    description: 'First purchase - Order #1234',
    date: '2025-01-15T10:30:00Z',
  },
  {
    id: 'tx-003',
    type: 'earned',
    amount: 50,
    description: 'Completed style profile',
    date: '2025-01-10T11:00:00Z',
  },
  {
    id: 'tx-004',
    type: 'earned',
    amount: 75,
    description: 'Purchase - Order #1256',
    date: '2025-01-25T16:20:00Z',
  },
  {
    id: 'tx-005',
    type: 'earned',
    amount: 200,
    description: 'Style Explorer badge unlocked',
    date: '2025-02-20T14:15:00Z',
  },
  {
    id: 'tx-006',
    type: 'earned',
    amount: 180,
    description: 'Left 3 product reviews',
    date: '2025-03-01T09:45:00Z',
  },
  {
    id: 'tx-007',
    type: 'earned',
    amount: 300,
    description: 'Loyal Customer badge unlocked',
    date: '2025-03-15T13:30:00Z',
  },
  {
    id: 'tx-008',
    type: 'bonus',
    amount: 250,
    description: 'Birthday month bonus',
    date: '2025-03-20T00:00:00Z',
  },
];

// ==================== CONTEXT ====================

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  // User state
  const [user, setUser] = useState<UserGamification>({
    currentPoints: 1305,
    totalPointsEarned: 1805,
    tier: 'Silver',
    badges: ALL_BADGES.filter(b => b.unlockedAt),
    transactions: INITIAL_TRANSACTIONS,
    redeemedRewards: [],
  });

  // ==================== POINTS SYSTEM ====================

  const addPoints = useCallback((amount: number, description: string, metadata?: Record<string, unknown>) => {
    const newTransaction: PointsTransaction = {
      id: `tx-${Date.now()}`,
      type: 'earned',
      amount,
      description,
      date: new Date().toISOString(),
      metadata,
    };

    setUser(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + amount,
      totalPointsEarned: prev.totalPointsEarned + amount,
      transactions: [newTransaction, ...prev.transactions],
    }));

    toast.success(`+${amount} points earned!`, {
      description,
    });
  }, []);

  const spendPoints = useCallback((amount: number, description: string): boolean => {
    if (user.currentPoints < amount) {
      toast.error('Insufficient points', {
        description: `You need ${amount - user.currentPoints} more points`,
      });
      return false;
    }

    const newTransaction: PointsTransaction = {
      id: `tx-${Date.now()}`,
      type: 'spent',
      amount: -amount,
      description,
      date: new Date().toISOString(),
    };

    setUser(prev => ({
      ...prev,
      currentPoints: prev.currentPoints - amount,
      transactions: [newTransaction, ...prev.transactions],
    }));

    return true;
  }, [user.currentPoints]);

  // ==================== BADGE SYSTEM ====================

  const unlockedBadges = useMemo(() => user.badges, [user.badges]);
  
  const lockedBadges = useMemo(() => {
    const unlockedIds = new Set(user.badges.map(b => b.id));
    return ALL_BADGES.filter(b => !unlockedIds.has(b.id));
  }, [user.badges]);

  const unlockBadge = useCallback((badgeId: string) => {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge || user.badges.some(b => b.id === badgeId)) return;

    const unlockedBadge = { ...badge, unlockedAt: new Date().toISOString() };
    
    setUser(prev => ({
      ...prev,
      badges: [...prev.badges, unlockedBadge],
    }));

    // Award points for unlocking badge
    addPoints(badge.pointsRequired, `Badge unlocked: ${badge.name}`);

    toast.success('Badge Unlocked!', {
      description: `${badge.name}: ${badge.description}`,
    });
  }, [user.badges, addPoints]);

  const checkBadgeEligibility = useCallback((): Badge[] => {
    // This would normally check against actual user activity
    // For now, return badges that could be unlocked based on points
    return lockedBadges.filter(b => user.totalPointsEarned >= b.pointsRequired * 2);
  }, [lockedBadges, user.totalPointsEarned]);

  // ==================== TIER SYSTEM ====================

  const currentTier = useMemo(() => {
    return TIERS.find(t => t.name === user.tier) || TIERS[0];
  }, [user.tier]);

  const nextTier = useMemo(() => {
    const currentIndex = TIERS.findIndex(t => t.name === user.tier);
    return TIERS[currentIndex + 1] || null;
  }, [user.tier]);

  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;
    const range = nextTier.minPoints - currentTier.minPoints;
    const progress = user.totalPointsEarned - currentTier.minPoints;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  }, [currentTier, nextTier, user.totalPointsEarned]);

  // Check for tier upgrades - currently unused but kept for future implementation
  const checkTierUpgrade = useCallback(() => {
    const eligibleTier = [...TIERS].reverse().find(t => user.totalPointsEarned >= t.minPoints);
    if (eligibleTier && eligibleTier.name !== user.tier) {
      setUser(prev => ({ ...prev, tier: eligibleTier.name }));
      toast.success(`Tier Upgraded to ${eligibleTier.name}!`, {
        description: 'Enjoy your new benefits!',
      });
    }
  }, [user.totalPointsEarned, user.tier]);

  // ==================== REWARDS SYSTEM ====================

  const availableRewards = useMemo(() => {
    return REWARDS.filter(r => r.available && (r.stock === undefined || r.stock > 0));
  }, []);

  const redeemedRewards = useMemo(() => {
    return user.redeemedRewards.map(rr => ({
      reward: REWARDS.find(r => r.id === rr.rewardId)!,
      redeemedAt: rr.redeemedAt,
      code: rr.code,
    })).filter(rr => rr.reward);
  }, [user.redeemedRewards]);

  const redeemReward = useCallback((rewardId: string): { success: boolean; code?: string; error?: string } => {
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    if (!reward.available || (reward.stock !== undefined && reward.stock <= 0)) {
      return { success: false, error: 'Reward out of stock' };
    }

    if (user.currentPoints < reward.pointsCost) {
      return { 
        success: false, 
        error: `Need ${reward.pointsCost - user.currentPoints} more points` 
      };
    }

    // Spend points
    const spent = spendPoints(reward.pointsCost, `Redeemed: ${reward.name}`);
    if (!spent) {
      return { success: false, error: 'Failed to process redemption' };
    }

    // Generate redemption code
    const code = `PJ${Date.now().toString(36).toUpperCase()}`;

    setUser(prev => ({
      ...prev,
      redeemedRewards: [
        ...prev.redeemedRewards,
        { rewardId, redeemedAt: new Date().toISOString(), code },
      ],
    }));

    toast.success('Reward Redeemed!', {
      description: `${reward.name} - Code: ${code}`,
    });

    return { success: true, code };
  }, [user.currentPoints, spendPoints]);

  // ==================== TRANSACTIONS ====================

  const recentTransactions = useMemo(() => {
    return user.transactions.slice(0, 20);
  }, [user.transactions]);

  const getTransactionsByType = useCallback((type: PointsTransaction['type']) => {
    return user.transactions.filter(t => t.type === type);
  }, [user.transactions]);

  // ==================== CONTEXT VALUE ====================

  // Check tier upgrades when points change
  useEffect(() => {
    checkTierUpgrade();
  }, [user.currentPoints, checkTierUpgrade]);

  const contextValue: GamificationContextType = {
    user,
    currentPoints: user.currentPoints,
    totalPointsEarned: user.totalPointsEarned,
    addPoints,
    spendPoints,
    allBadges: ALL_BADGES,
    unlockedBadges,
    lockedBadges,
    unlockBadge,
    checkBadgeEligibility,
    currentTier,
    nextTier,
    tierProgress,
    allTiers: TIERS,
    allRewards: REWARDS,
    availableRewards,
    redeemedRewards,
    redeemReward,
    recentTransactions,
    getTransactionsByType,
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export { ALL_BADGES as MOCK_BADGES, TIERS as MOCK_TIERS, REWARDS as MOCK_REWARDS };
