import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import {
  Coins,
  Star,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  User,
  Gift,
  Share2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Mock data for points history (last 6 months)
const pointsHistoryData = [
  { month: 'Aug', earned: 350, spent: 200 },
  { month: 'Sep', earned: 420, spent: 0 },
  { month: 'Oct', earned: 280, spent: 500 },
  { month: 'Nov', earned: 550, spent: 0 },
  { month: 'Dec', earned: 680, spent: 300 },
  { month: 'Jan', earned: 425, spent: 0 },
];

const chartConfig = {
  earned: {
    label: 'Points Earned',
    color: '#C8A464',
  },
  spent: {
    label: 'Points Spent',
    color: '#84A7D5',
  },
};

// Ways to earn points
const earnActions = [
  { icon: ShoppingBag, label: 'Make a Purchase', points: '$1 spent = 1 point', color: 'bg-pj-navy', description: 'Earn points on every dollar spent' },
  { icon: MessageSquare, label: 'Write a Review', points: '+50 points', color: 'bg-pj-blue', description: 'Share your thoughts on products' },
  { icon: UserPlus, label: 'Refer a Friend', points: '+200 points', color: 'bg-green-500', description: 'Get rewarded for referrals' },
  { icon: User, label: 'Complete Profile', points: '+100 points', color: 'bg-purple-500', description: 'Fill out your account details' },
  { icon: Gift, label: 'Birthday Bonus', points: '+500 points', color: 'bg-pink-500', description: 'Celebrate with bonus points' },
  { icon: Share2, label: 'Social Share', points: '+25 points', color: 'bg-sky-500', description: 'Share on social media' },
  { icon: Calendar, label: 'Attend Event', points: '+150 points', color: 'bg-orange-500', description: 'Join our exclusive events' },
];

// Tier benefits
const currentTier = {
  name: 'Gold',
  color: 'text-pj-gold',
  bgColor: 'bg-pj-gold',
  pointsRequired: 2000,
  currentPoints: 2847,
  nextTier: 'Platinum',
  nextTierPoints: 5000,
};

const tierBenefits = {
  Gold: [
    'Earn 1.25x points on all purchases',
    'Free shipping on orders over $50',
    'Early access to sales',
    'Birthday reward: $25 off',
    'Exclusive member-only promotions',
  ],
  Platinum: [
    'Earn 1.5x points on all purchases',
    'Free shipping on all orders',
    'VIP early access to new arrivals',
    'Birthday reward: $50 off',
    'Dedicated customer support line',
    'Complimentary gift wrapping',
  ],
};

// Recent activity
const recentActivity = [
  { id: 1, type: 'earned', action: 'Purchase - Order #ORD-2024-003', points: 234, date: '2024-01-25', icon: ShoppingBag },
  { id: 2, type: 'spent', action: 'Redeemed - $25 Reward', points: -500, date: '2024-01-20', icon: Gift },
  { id: 3, type: 'earned', action: 'Referral Bonus - John D.', points: 200, date: '2024-01-18', icon: UserPlus },
  { id: 4, type: 'earned', action: 'Product Review', points: 50, date: '2024-01-15', icon: MessageSquare },
  { id: 5, type: 'earned', action: 'Social Share', points: 25, date: '2024-01-12', icon: Share2 },
  { id: 6, type: 'earned', action: 'Profile Completion', points: 100, date: '2024-01-10', icon: User },
];

export function PointsRewardsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'earned' | 'spent'>('all');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate cards
      gsap.fromTo(
        '.rewards-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );

      // Animate points counter
      if (pointsRef.current) {
        gsap.fromTo(
          pointsRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3 }
        );
      }

      // Animate earn actions
      gsap.fromTo(
        '.earn-action',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.4 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const filteredActivity = recentActivity.filter((item) => {
    if (activityFilter === 'all') return true;
    return item.type === activityFilter;
  });

  const progressPercentage = Math.min(
    ((currentTier.currentPoints - currentTier.pointsRequired) /
      (currentTier.nextTierPoints - currentTier.pointsRequired)) *
      100,
    100
  );

  const pointsToNextTier = currentTier.nextTierPoints - currentTier.currentPoints;

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="rewards-card">
        <h1 className="font-display text-2xl text-pj-navy">Points & Rewards</h1>
        <p className="text-pj-gray mt-1">Track your points, unlock rewards, and level up your membership</p>
      </div>

      {/* Points Dashboard */}
      <Card className="rewards-card border-pj-gold/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Points Display & Tier Status */}
            <div className="space-y-6">
              {/* Large Points Display */}
              <div className="text-center lg:text-left">
                <p className="text-sm text-pj-gray mb-2">Available Points</p>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-16 h-16 rounded-full bg-pj-gold/20 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-pj-gold" />
                  </div>
                  <span
                    ref={pointsRef}
                    className="font-display text-6xl text-pj-navy tracking-tight"
                  >
                    {currentTier.currentPoints.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-pj-gray mt-2">
                  Total earned: <span className="font-medium text-pj-navy">3,847 points</span>
                </p>
              </div>

              {/* Tier Status */}
              <div className="bg-pj-cream rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${currentTier.bgColor}/20 flex items-center justify-center`}>
                      <Star className={`w-5 h-5 ${currentTier.color}`} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-medium text-pj-navy">{currentTier.name} Member</p>
                      <p className="text-xs text-pj-gray">Current Tier</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-pj-gold">{progressPercentage.toFixed(0)}%</span>
                </div>

                <Progress value={progressPercentage} className="h-3 mb-3" />

                <p className="text-sm text-pj-gray">
                  <span className="font-medium text-pj-navy">{pointsToNextTier.toLocaleString()} points</span> needed
                  for {currentTier.nextTier}
                </p>
              </div>
            </div>

            {/* Points History Chart */}
            <div>
              <h3 className="font-medium text-pj-navy mb-4">Points History (Last 6 Months)</h3>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <AreaChart data={pointsHistoryData}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A464" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A464" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84A7D5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84A7D5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="earned"
                    stroke="#C8A464"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarned)"
                  />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    stroke="#84A7D5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpent)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ways to Earn Points */}
      <Card className="rewards-card">
        <CardHeader>
          <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pj-gold" />
            Ways to Earn Points
          </CardTitle>
          <CardDescription>Complete these actions to earn more points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {earnActions.map((action, index) => (
              <div
                key={index}
                className="earn-action group p-4 rounded-xl border border-gray-100 hover:border-pj-gold/30 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${action.color}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pj-navy text-sm">{action.label}</p>
                    <p className="text-xs text-pj-gold font-medium mt-0.5">{action.points}</p>
                    <p className="text-xs text-pj-gray mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Tier Benefits */}
        <Card className="rewards-card">
          <CardHeader>
            <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
              <Award className="w-5 h-5 text-pj-gold" />
              Current Benefits
            </CardTitle>
            <CardDescription>Your {currentTier.name} tier perks</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tierBenefits.Gold.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm text-pj-charcoal">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Tier Preview */}
        <Card className="rewards-card border-pj-blue/20">
          <CardHeader>
            <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pj-blue" />
              Coming Soon
            </CardTitle>
            <CardDescription>Unlock these benefits at {currentTier.nextTier} tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tierBenefits.Platinum.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-pj-blue/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-pj-blue" />
                  </div>
                  <span className="text-sm text-pj-gray">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-pj-blue/5 rounded-lg">
              <p className="text-sm text-pj-navy">
                <span className="font-medium">{pointsToNextTier.toLocaleString()} more points</span> to unlock{' '}
                {currentTier.nextTier} tier!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="rewards-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-pj-navy" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your points transactions</CardDescription>
          </div>
          <Tabs value={activityFilter} onValueChange={(v) => setActivityFilter(v as typeof activityFilter)}>
            <TabsList className="bg-pj-cream">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="earned" className="text-xs">Earned</TabsTrigger>
              <TabsTrigger value="spent" className="text-xs">Spent</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-pj-cream transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'earned' ? 'bg-green-100' : 'bg-pj-blue/10'
                    }`}
                  >
                    <activity.icon
                      className={`w-5 h-5 ${activity.type === 'earned' ? 'text-green-600' : 'text-pj-blue'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-pj-navy text-sm">{activity.action}</p>
                    <p className="text-xs text-pj-gray">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.type === 'earned' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-pj-blue" />
                  )}
                  <span
                    className={`font-medium ${
                      activity.type === 'earned' ? 'text-green-600' : 'text-pj-blue'
                    }`}
                  >
                    {activity.type === 'earned' ? '+' : ''}
                    {activity.points.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redeem Points CTA */}
      <Card className="rewards-card bg-gradient-to-r from-pj-navy to-pj-blue border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <h3 className="font-display text-2xl mb-2">Ready to Redeem?</h3>
              <p className="text-white/80 max-w-md">
                Use your points for discounts, exclusive products, and special experiences. Every 100 points = $1 off!
              </p>
            </div>
            <Link to="/rewards-catalog">
              <Button
                size="lg"
                className="bg-white text-pj-navy hover:bg-pj-cream font-medium px-8"
              >
                Browse Rewards
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PointsRewardsPage;
