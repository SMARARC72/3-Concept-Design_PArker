import React, { useState } from 'react';
import {
  ShoppingBag,
  Compass,
  Shirt,
  DollarSign,
  Star,
  Camera,
  Heart,
  UserCheck,
  Users,
  Share2,
  TrendingUp,
  Award,
  Calendar,
  Sunrise,
  Cake,
  Tag,
  Leaf,
  Lock,
  Unlock,
  Trophy,
} from 'lucide-react';
import type { Badge } from '@/context/GamificationContext';
type BadgeType = Badge;
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icon mapping for badges
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Compass,
  Shirt,
  DollarSign,
  Star,
  Camera,
  Heart,
  UserCheck,
  Users,
  Share2,
  TrendingUp,
  Award,
  Calendar,
  Sunrise,
  Cake,
  Tag,
  Leaf,
};

interface BadgeCardProps {
  badge: BadgeType;
  isUnlocked: boolean;
  progress?: number;
}

function BadgeCard({ badge, isUnlocked, progress = 0 }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] || Trophy;
  
  const categoryColors: Record<BadgeType['category'], { bg: string; border: string; icon: string }> = {
    purchase: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500' },
    engagement: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-500' },
    social: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-500' },
    milestone: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500' },
    special: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: 'text-pink-500' },
  };

  const colors = categoryColors[badge.category];

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative group cursor-pointer transition-all duration-300',
              'rounded-xl border-2 p-4',
              'hover:scale-105 hover:shadow-lg',
              isUnlocked
                ? cn(colors.bg, colors.border, 'opacity-100')
                : 'bg-muted/50 border-muted opacity-70 grayscale'
            )}
          >
            {/* Badge Icon */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  'relative w-16 h-16 rounded-full flex items-center justify-center',
                  'transition-all duration-300',
                  isUnlocked
                    ? cn('bg-background shadow-md', colors.icon)
                    : 'bg-muted'
                )}
              >
                <Icon className="w-8 h-8" />
                
                {/* Lock overlay for locked badges */}
                {!isUnlocked && (
                  <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                {/* Unlocked indicator */}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                    <Unlock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Badge Name */}
              <div className="text-center">
                <p
                  className={cn(
                    'font-semibold text-sm line-clamp-1',
                    isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {badge.name}
                </p>
                
                {/* Points indicator */}
                {isUnlocked ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{badge.pointsRequired} pts
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.pointsRequired} pts to unlock
                  </p>
                )}
              </div>
            </div>

            {/* Progress bar for locked badges */}
            {!isUnlocked && progress > 0 && (
              <div className="mt-3">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', colors.icon)} />
              <p className="font-semibold">{badge.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <div className="pt-2 border-t">
              <p className="text-xs">
                <span className="font-medium">How to unlock:</span> {badge.criteria}
              </p>
            </div>
            {isUnlocked && badge.unlockedAt && (
              <p className="text-xs text-green-600">
                Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeDisplayProps {
  unlockedBadges?: BadgeType[];
  lockedBadges?: BadgeType[];
  showFilters?: boolean;
  className?: string;
}

export function BadgeDisplay({
  unlockedBadges = [],
  lockedBadges = [],
  showFilters = true,
  className,
}: BadgeDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeType['category'] | 'all'>('all');

  const categories: Array<{ value: BadgeType['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Badges' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'social', label: 'Social' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'special', label: 'Special' },
  ];

  const filteredUnlocked = selectedCategory === 'all'
    ? unlockedBadges
    : unlockedBadges.filter(b => b.category === selectedCategory);

  const filteredLocked = selectedCategory === 'all'
    ? lockedBadges
    : lockedBadges.filter(b => b.category === selectedCategory);

  const totalBadges = unlockedBadges.length + lockedBadges.length;
  const progress = totalBadges > 0 ? (unlockedBadges.length / totalBadges) * 100 : 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Achievement Badges</CardTitle>
              <CardDescription>
                {unlockedBadges.length} of {totalBadges} unlocked
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(progress)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        
        {/* Overall Progress */}
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>

      <CardContent>
        {showFilters && (
          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="flex-wrap h-auto gap-1">
              {categories.map(cat => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="text-xs"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Unlocked Badges */}
        {filteredUnlocked.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-green-500" />
              Unlocked ({filteredUnlocked.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredUnlocked.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {filteredLocked.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Locked ({filteredLocked.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredLocked.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={false}
                  progress={Math.random() * 60 + 20} // Mock progress
                />
              ))}
            </div>
          </div>
        )}

        {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No badges found in this category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboards
interface BadgePreviewProps {
  badges: BadgeType[];
  maxDisplay?: number;
  className?: string;
}

export function BadgePreview({ badges, maxDisplay = 5, className }: BadgePreviewProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {displayBadges.map(badge => {
        const Icon = ICON_MAP[badge.icon] || Trophy;
        return (
          <TooltipProvider key={badge.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default BadgeDisplay;
