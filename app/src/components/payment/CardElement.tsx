import { useState } from 'react';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import type { StripeCardNumberElementChangeEvent, StripeCardExpiryElementChangeEvent, StripeCardCvcElementChangeEvent } from '@stripe/stripe-js';
import { AlertCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardElementProps {
  onChange?: (event: StripeCardNumberElementChangeEvent | StripeCardExpiryElementChangeEvent | StripeCardCvcElementChangeEvent) => void;
  onReady?: () => void;
  error?: string;
  disabled?: boolean;
}

// Stripe element appearance options
const elementStyles = {
  base: {
    fontSize: '16px',
    color: '#0F1F3C',
    fontFamily: 'Inter, sans-serif',
    fontSmoothing: 'antialiased',
    '::placeholder': {
      color: '#9CA3AF',
    },
    ':-webkit-autofill': {
      color: '#0F1F3C',
    },
  },
  invalid: {
    color: '#EF4444',
    iconColor: '#EF4444',
  },
  complete: {
    color: '#0F1F3C',
    iconColor: '#C8A464',
  },
};

export function CardElement({ onChange, onReady, error, disabled }: CardElementProps) {
  const [cardError, setCardError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleNumberChange = (event: StripeCardNumberElementChangeEvent) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
    onChange?.(event);
  };

  const handleExpiryChange = (event: StripeCardExpiryElementChangeEvent) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
    onChange?.(event);
  };

  const handleCvcChange = (event: StripeCardCvcElementChangeEvent) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
    onChange?.(event);
  };

  const handleReady = () => {
    setIsReady(true);
    onReady?.();
  };

  const displayError = error || cardError;

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-pj-navy">
          Card Number
        </label>
        <div
          className={cn(
            'relative rounded-lg border bg-white px-4 py-3 transition-all duration-200',
            isFocused && !displayError && 'border-pj-blue ring-2 ring-pj-blue/20',
            displayError && 'border-red-500 ring-2 ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            'hover:border-pj-blue/50'
          )}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-pj-gray flex-shrink-0" />
            <div className="flex-1">
              <CardNumberElement
                options={{
                  style: elementStyles,
                  placeholder: '0000 0000 0000 0000',
                  disabled,
                }}
                onChange={handleNumberChange}
                onReady={handleReady}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expiry and CVC Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiry Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-pj-navy">
            Expiry Date
          </label>
          <div
            className={cn(
              'rounded-lg border bg-white px-4 py-3 transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              'hover:border-pj-blue/50'
            )}
          >
            <CardExpiryElement
              options={{
                style: elementStyles,
                placeholder: 'MM / YY',
                disabled,
              }}
              onChange={handleExpiryChange}
            />
          </div>
        </div>

        {/* CVC */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-pj-navy">
            CVC
          </label>
          <div
            className={cn(
              'rounded-lg border bg-white px-4 py-3 transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              'hover:border-pj-blue/50'
            )}
          >
            <CardCvcElement
              options={{
                style: elementStyles,
                placeholder: '123',
                disabled,
              }}
              onChange={handleCvcChange}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Loading State */}
      {!isReady && !disabled && (
        <div className="flex items-center gap-2 text-pj-gray text-sm">
          <div className="w-4 h-4 border-2 border-pj-gold border-t-transparent rounded-full animate-spin" />
          <span>Loading secure card input...</span>
        </div>
      )}
    </div>
  );
}

// Simpler single card element version
interface SingleCardElementProps {
  onChange?: (event: StripeCardNumberElementChangeEvent) => void;
  error?: string;
  disabled?: boolean;
}

export function SingleCardElement({ onChange, error, disabled }: SingleCardElementProps) {
  const [cardError, setCardError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: StripeCardNumberElementChangeEvent) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
    onChange?.(event);
  };

  const displayError = error || cardError;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative rounded-lg border bg-white px-4 py-3 transition-all duration-200',
          isFocused && !displayError && 'border-pj-blue ring-2 ring-pj-blue/20',
          displayError && 'border-red-500 ring-2 ring-red-500/20',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          'hover:border-pj-blue/50'
        )}
      >
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-pj-gray flex-shrink-0" />
          <div className="flex-1">
            <CardNumberElement
              options={{
                style: elementStyles,
                placeholder: 'Card number',
                disabled,
              }}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
        </div>
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default CardElement;
