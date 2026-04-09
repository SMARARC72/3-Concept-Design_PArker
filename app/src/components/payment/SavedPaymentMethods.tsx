import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  CreditCard,
  Trash2,
  Star,
  AlertCircle,
  Shield,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PaymentMethod } from '@/services/stripeApi';

interface SavedPaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string | null;
  onSetDefault: (paymentMethodId: string) => Promise<void>;
  onDelete: (paymentMethodId: string) => Promise<void>;
  isLoading?: boolean;
}

// Card brand to display name mapping
const brandDisplayNames: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

// Card brand colors for visual differentiation
const brandColors: Record<string, string> = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-500',
  amex: 'bg-blue-500',
  discover: 'bg-orange-500',
  diners: 'bg-blue-400',
  jcb: 'bg-green-500',
  unionpay: 'bg-red-600',
};

// Format card number for display
const formatCardNumber = (last4: string): string => {
  return `•••• •••• •••• ${last4}`;
};

// Format expiry date
const formatExpiry = (month: number, year: number): string => {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
};

// Check if card is expired
const isCardExpired = (month: number, year: number): boolean => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  return year < currentYear || (year === currentYear && month < currentMonth);
};

export function SavedPaymentMethods({
  paymentMethods,
  defaultPaymentMethodId,
  onSetDefault,
  onDelete,
  isLoading = false,
}: SavedPaymentMethodsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP animation on mount and when list changes
  useEffect(() => {
    if (containerRef.current && paymentMethods.length > 0) {
      const cards = containerRef.current.querySelectorAll('.payment-method-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [paymentMethods.length]);

  const handleSetDefault = async (paymentMethodId: string) => {
    if (actionLoading || paymentMethodId === defaultPaymentMethodId) return;
    
    setActionLoading(paymentMethodId);
    try {
      await onSetDefault(paymentMethodId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (paymentMethodId: string) => {
    setPaymentMethodToDelete(paymentMethodId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentMethodToDelete) return;

    setActionLoading(paymentMethodToDelete);
    try {
      await onDelete(paymentMethodToDelete);
      setDeleteDialogOpen(false);
      setPaymentMethodToDelete(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-pj-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-pj-gray" />
        </div>
        <h3 className="font-display text-xl text-pj-navy mb-2">No Saved Cards</h3>
        <p className="text-pj-gray text-sm max-w-sm mx-auto">
          You haven&apos;t saved any payment methods yet. Add a card below for faster checkout.
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="space-y-4">
        {paymentMethods.map((paymentMethod) => {
          const isDefault = paymentMethod.id === defaultPaymentMethodId;
          const card = paymentMethod.card;
          const expired = card ? isCardExpired(card.exp_month, card.exp_year) : false;
          const brand = card?.brand || 'unknown';
          const brandName = brandDisplayNames[brand.toLowerCase()] || 'Card';
          const brandColor = brandColors[brand.toLowerCase()] || 'bg-pj-navy';

          return (
            <div
              key={paymentMethod.id}
              className={cn(
                'payment-method-card group relative bg-white rounded-xl p-6 shadow-sm border transition-all duration-300',
                isDefault
                  ? 'border-pj-gold ring-1 ring-pj-gold/30'
                  : 'border-gray-100 hover:border-pj-blue/30 hover:shadow-md'
              )}
            >
              {/* Default Badge */}
              {isDefault && (
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pj-gold text-pj-navy text-xs font-medium rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Card Info */}
                <div className="flex items-center gap-4">
                  {/* Brand Icon */}
                  <div
                    className={cn(
                      'w-14 h-9 rounded flex items-center justify-center text-white text-xs font-bold',
                      brandColor
                    )}
                  >
                    {brand === 'visa' ? 'VISA' : brand === 'mastercard' ? 'MC' : <CreditCard className="w-5 h-5" />}
                  </div>

                  {/* Card Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-pj-navy">
                        {brandName}
                      </span>
                      {expired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-pj-gray space-y-0.5">
                      <p className="font-mono tracking-wider">
                        {card ? formatCardNumber(card.last4) : '•••• •••• •••• ••••'}
                      </p>
                      {card && (
                        <p>
                          Expires {formatExpiry(card.exp_month, card.exp_year)}
                          {paymentMethod.billing_details.name && (
                            <span className="ml-3">| {paymentMethod.billing_details.name}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(paymentMethod.id)}
                      disabled={!!actionLoading}
                      className="hidden sm:flex text-pj-navy hover:text-pj-gold hover:bg-pj-gold/10"
                    >
                      {actionLoading === paymentMethod.id ? (
                        <div className="w-4 h-4 border-2 border-pj-gold border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-1" />
                          Set Default
                        </>
                      )}
                    </Button>
                  )}

                  {/* Mobile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(paymentMethod.id)}
                          disabled={!!actionLoading}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(paymentMethod.id)}
                        disabled={!!actionLoading}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Desktop Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(paymentMethod.id)}
                    disabled={!!actionLoading}
                    className="hidden sm:flex text-pj-gray hover:text-red-600 hover:bg-red-50"
                  >
                    {actionLoading === paymentMethod.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-pj-gray">
                <Shield className="w-3 h-3" />
                <span>Securely stored with Stripe</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-pj-navy">
              Remove Payment Method?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this card from your account. You can add it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SavedPaymentMethods;
