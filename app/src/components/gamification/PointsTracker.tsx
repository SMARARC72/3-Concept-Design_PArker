import { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Gift,
  History,
  Crown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Tier, PointsTransaction } from '@/context/GamificationContext';

// ==================== ANIMATED POINTS DISPLAY ====================

interface AnimatedPointsProps {
  value: number;
  className?: string;
  duration?: number;
}

function AnimatedPoints({ value, className, duration = 1000 }: AnimatedPointsProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}

// ==================== TIER BADGE ====================

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
}

function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold text-white',
        'bg-gradient-to-r shadow-sm',
        tier.gradient,
        sizeClasses[size]
      )}
    >
      <Crown className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
      )} />
      {tier.name}
    </div>
  );
}

// ==================== TRANSACTION ITEM ====================

interface TransactionItemProps {
  transaction: PointsTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const icons = {
    earned: TrendingUp,
    spent: TrendingDown,
    bonus: Gift,
  };

  const colors = {
    earned: 'text-green-500 bg-green-500/10',
    spent: 'text-red-500 bg-red-500/10',
    bonus: 'text-purple-500 bg-purple-500/10',
  };

  const Icon = icons[transaction.type];
  const colorClass = colors[transaction.type];

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className={cn(
        'font-semibold text-sm',
        transaction.type === 'spent' ? 'text-red-500' : 'text-green-500'
      )}>
        {transaction.type === 'spent' ? '-' : '+'}{transaction.amount.toLocaleString()}
      </div>
    </div>
  );
}

// ==================== POINTS TRACKER CARD ====================

interface PointsTrackerProps {
  currentPoints: number;
  totalPointsEarned: number;
  currentTier: Tier;
  nextTier: Tier | null;
  tierProgress: number;
  recentTransactions: PointsTransaction[];
  className?: string;
}

export function PointsTracker({
  currentPoints,
  totalPointsEarned,
  currentTier,
  nextTier,
  tierProgress,
  recentTransactions,
  className,
}: PointsTrackerProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const pointsToNextTier = nextTier 
    ? nextTier.minPoints - totalPointsEarned 
    : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Points Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Your Points</CardTitle>
                <CardDescription>Redeem for exclusive rewards</CardDescription>
              </div>
            </div>
            <TierBadge tier={currentTier} size="sm" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Points Display */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <AnimatedPoints
                value={currentPoints}
                className="text-5xl font-bold tracking-tight"
                duration={1500}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Available points to redeem
            </p>
          </div>

          <Separator className="my-6" />

          {/* Tier Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-sm">Tier Progress</span>
              </div>
              {nextTier ? (
                <span className="text-xs text-muted-foreground">
                  {pointsToNextTier.toLocaleString()} pts to {nextTier.name}
                </span>
              ) : (
                <UIBadge variant="secondary" className="text-xs">
                  Max Tier Reached!
                </UIBadge>
              )}
            </div>

            <div className="relative">
              <Progress value={tierProgress} className="h-3" />
              
              {/* Tier markers */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{currentTier.minPoints.toLocaleString()}</span>
                {nextTier && (
                  <span>{nextTier.minPoints.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Current tier benefits preview */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-primary cursor-help">
                    <span>View {currentTier.name} benefits</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm p-4">
                  <p className="font-semibold mb-2">{currentTier.name} Benefits</p>
                  <ul className="space-y-1">
                    {currentTier.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Your latest point transactions</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{totalPointsEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <ScrollArea className={showAllTransactions ? 'h-80' : 'h-auto'}>
            <div className="divide-y">
              {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 5)).map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </ScrollArea>

          {recentTransactions.length > 5 && (
            <button
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showAllTransactions ? 'Show less' : `View all ${recentTransactions.length} transactions`}
            </button>
          )}

          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <History className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start shopping to earn points!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== COMPACT POINTS WIDGET ====================

interface PointsWidgetProps {
  currentPoints: number;
  currentTier: Tier;
  className?: string;
}

export function PointsWidget({ currentPoints, currentTier, className }: PointsWidgetProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-xl border bg-card',
      className
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Your Points</span>
        </div>
        <AnimatedPoints
          value={currentPoints}
          className="text-2xl font-bold"
          duration={800}
        />
      </div>
      
      <Separator orientation="vertical" className="h-10" />
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4" style={{ color: currentTier.color }} />
          <span className="text-sm text-muted-foreground">Current Tier</span>
        </div>
        <p className="text-lg font-semibold" style={{ color: currentTier.color }}>
          {currentTier.name}
        </p>
      </div>
    </div>
  );
}

// ==================== TIER COMPARISON ====================

interface TierComparisonProps {
  tiers: Tier[];
  currentTier: Tier;
  className?: string;
}

export function TierComparison({ tiers, currentTier, className }: TierComparisonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Membership Tiers</CardTitle>
        <CardDescription>Unlock more benefits as you level up</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isUnlocked = tiers.findIndex(t => t.name === currentTier.name) >= index;

            return (
              <div
                key={tier.name}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all',
                  isCurrentTier
                    ? 'border-primary bg-primary/5'
                    : isUnlocked
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-muted bg-muted/50 opacity-70'
                )}
              >
                {isCurrentTier && (
                  <UIBadge className="absolute -top-2 left-4 bg-primary">Current</UIBadge>
                )}
                
                <div className="flex items-center justify-between mb-2">
                  <TierBadge tier={tier} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {tier.minPoints.toLocaleString()}+ pts
                  </span>
                </div>

                <ul className="space-y-1 mt-3">
                  {tier.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className={isUnlocked ? 'text-green-500' : 'text-muted-foreground'}>
                        {isUnlocked ? '✓' : '○'}
                      </span>
                      {benefit}
                    </li>
                  ))}
                  {tier.benefits.length > 3 && (
                    <li className="text-xs text-muted-foreground pl-4">
                      +{tier.benefits.length - 3} more benefits
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default PointsTracker;
