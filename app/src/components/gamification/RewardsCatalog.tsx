import React, { useState, useMemo } from 'react';
import {
  Gift,
  ShoppingBag,
  Tag,
  Ticket,
  Star,
  Filter,
  Search,
  CheckCircle2,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Reward } from '@/context/GamificationContext';

// ==================== REWARD TYPE CONFIG ====================

const REWARD_TYPE_CONFIG: Record<Reward['type'], { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}> = {
  gift_card: {
    icon: Gift,
    label: 'Gift Card',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  merchandise: {
    icon: ShoppingBag,
    label: 'Merchandise',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  discount: {
    icon: Tag,
    label: 'Discount',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  experience: {
    icon: Ticket,
    label: 'Experience',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
};

// ==================== REWARD CARD ====================

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
}

function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.pointsCost;
  const isLowStock = reward.stock !== undefined && reward.stock > 0 && reward.stock <= 10;
  const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;

  const typeConfig = REWARD_TYPE_CONFIG[reward.type];
  const TypeIcon = typeConfig.icon;

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-1',
      !canAfford && 'opacity-75'
    )}>
      {/* Image/Header */}
      <div className={cn(
        'relative h-32 flex items-center justify-center',
        typeConfig.bgColor
      )}>
        <TypeIcon className={cn('w-12 h-12', typeConfig.color)} />
        
        {/* Type Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 text-xs"
        >
          {typeConfig.label}
        </Badge>

        {/* Stock indicator */}
        {isLowStock && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 right-3 text-xs"
          >
            Only {reward.stock} left
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}

        {/* Value overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white font-bold text-lg">{reward.value}</p>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{reward.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {reward.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className={cn(
              'font-bold',
              !canAfford && 'text-muted-foreground'
            )}>
              {reward.pointsCost.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          
          {!canAfford && (
            <span className="text-xs text-muted-foreground">
              Need {reward.pointsCost - userPoints} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          disabled={!canAfford || isOutOfStock || !reward.available}
          onClick={() => onRedeem(reward)}
          variant={canAfford && !isOutOfStock ? 'default' : 'outline'}
        >
          {isOutOfStock ? 'Out of Stock' : canAfford ? 'Redeem' : 'Not Enough Points'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==================== REDEMPTION DIALOG ====================

interface RedemptionDialogProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
  redemptionResult?: { success: boolean; code?: string; error?: string } | null;
}

function RedemptionDialog({
  reward,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  redemptionResult,
}: RedemptionDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (redemptionResult?.code) {
      await navigator.clipboard.writeText(redemptionResult.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!reward) return null;

  const typeConfig = REWARD_TYPE_CONFIG[reward.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!redemptionResult ? (
          // Confirmation State
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <typeConfig.icon className={cn('w-5 h-5', typeConfig.color)} />
                Redeem Reward
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to redeem this reward?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0',
                      typeConfig.bgColor
                    )}>
                      <typeConfig.icon className={cn('w-8 h-8', typeConfig.color)} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-bold">{reward.pointsCost.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">points</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {reward.terms && (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {reward.terms}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Redemption'}
              </Button>
            </DialogFooter>
          </>
        ) : redemptionResult.success ? (
          // Success State
          <>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <DialogTitle className="text-center">Redemption Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your reward has been redeemed successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-center mb-4">
                <p className="font-semibold text-lg">{reward.name}</p>
                <p className="text-muted-foreground">{reward.value}</p>
              </div>

              {redemptionResult.code && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Your redemption code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-background rounded border font-mono text-center text-lg">
                      {redemptionResult.code}
                    </code>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? 'Copied!' : 'Copy code'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Save this code! It has also been emailed to you.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Error State
          <>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <DialogTitle className="text-center">Redemption Failed</DialogTitle>
              <DialogDescription className="text-center">
                {redemptionResult.error || 'Something went wrong. Please try again.'}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ==================== REWARDS CATALOG ====================

interface RewardsCatalogProps {
  rewards: Reward[];
  userPoints: number;
  onRedeemReward: (rewardId: string) => { success: boolean; code?: string; error?: string };
  redeemedRewards?: Array<{
    reward: Reward;
    redeemedAt: string;
    code?: string;
  }>;
  className?: string;
}

export function RewardsCatalog({
  rewards,
  userPoints,
  onRedeemReward,
  redeemedRewards = [],
  className,
}: RewardsCatalogProps) {
  const [selectedType, setSelectedType] = useState<Reward['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points_asc' | 'points_desc' | 'name'>('points_asc');
  
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{ success: boolean; code?: string; error?: string } | null>(null);

  // Filter and sort rewards
  const filteredRewards = useMemo(() => {
    let result = [...rewards];

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(r => r.type === selectedType);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'points_asc':
          return a.pointsCost - b.pointsCost;
        case 'points_desc':
          return b.pointsCost - a.pointsCost;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [rewards, selectedType, searchQuery, sortBy]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setRedemptionResult(null);
    setIsDialogOpen(true);
  };

  const handleConfirmRedemption = async () => {
    if (!selectedReward) return;

    setIsProcessing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = onRedeemReward(selectedReward.id);
    setRedemptionResult(result);
    setIsProcessing(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReward(null);
    setRedemptionResult(null);
  };

  const filterTypes: Array<{ value: Reward['type'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Rewards' },
    { value: 'gift_card', label: 'Gift Cards' },
    { value: 'discount', label: 'Discounts' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'experience', label: 'Experiences' },
  ];

  return (
    <div className={className}>
      {/* Header with Points */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Rewards Catalog</h2>
              <p className="text-muted-foreground">
                Redeem your points for exclusive rewards
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="w-5 h-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as Reward['type'] | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points_asc">Points: Low to High</SelectItem>
                <SelectItem value="points_desc">Points: High to Low</SelectItem>
                <SelectItem value="name">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick filter buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filterTypes.map(type => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      {filteredRewards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={userPoints}
              onRedeem={handleRedeemClick}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </Card>
      )}

      {/* Redeemed Rewards Section */}
      {redeemedRewards.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Redeemed Rewards</CardTitle>
            <CardDescription>
              Rewards you&apos;ve already claimed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto max-h-64">
              <div className="space-y-3">
                {redeemedRewards.map((item, index) => {
                  const typeConfig = REWARD_TYPE_CONFIG[item.reward.type];
                  return (
                    <div
                      key={`${item.reward.id}-${index}`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                        typeConfig.bgColor
                      )}>
                        <typeConfig.icon className={cn('w-6 h-6', typeConfig.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Redeemed on {new Date(item.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {item.code && (
                        <code className="px-2 py-1 bg-background rounded text-xs font-mono">
                          {item.code}
                        </code>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Redemption Dialog */}
      <RedemptionDialog
        reward={selectedReward}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRedemption}
        isProcessing={isProcessing}
        redemptionResult={redemptionResult}
      />
    </div>
  );
}

export default RewardsCatalog;
