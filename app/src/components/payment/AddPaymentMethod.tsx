import { useEffect, useRef, useState } from 'react';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { gsap } from 'gsap';
import { CreditCard, User, MapPin, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { stripeApi, initializeStripe } from '@/services/stripeApi';
import type { StripeCardNumberElementChangeEvent, StripeCardExpiryElementChangeEvent, StripeCardCvcElementChangeEvent } from '@stripe/stripe-js';

interface AddPaymentMethodProps {
  customerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
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

function AddPaymentMethodForm({ customerId, onSuccess, onCancel }: AddPaymentMethodProps) {
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [cardholderName, setCardholderName] = useState('');
  const [isBillingAddressVisible, setIsBillingAddressVisible] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  // GSAP entrance animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // Success animation
  useEffect(() => {
    if (success && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [success]);

  const handleCardNumberChange = (event: StripeCardNumberElementChangeEvent) => {
    setCardComplete((prev) => ({ ...prev, cardNumber: event.complete }));
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  const handleCardExpiryChange = (event: StripeCardExpiryElementChangeEvent) => {
    setCardComplete((prev) => ({ ...prev, expiry: event.complete }));
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  const handleCardCvcChange = (event: StripeCardCvcElementChangeEvent) => {
    setCardComplete((prev) => ({ ...prev, cvc: event.complete }));
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    if (!cardComplete.cardNumber || !cardComplete.expiry || !cardComplete.cvc) {
      setError('Please complete all card fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          address: isBillingAddressVisible
            ? {
                line1: billingAddress.line1,
                line2: billingAddress.line2 || undefined,
                city: billingAddress.city,
                state: billingAddress.state,
                postal_code: billingAddress.postalCode,
                country: billingAddress.country,
              }
            : undefined,
        },
      });

      if (createError) {
        throw new Error(createError.message);
      }

      if (paymentMethod) {
        // Attach payment method to customer
        const { success: attachSuccess, error: attachError } = await stripeApi.attachPaymentMethod(
          paymentMethod.id,
          customerId
        );

        if (!attachSuccess) {
          throw new Error(attachError || 'Failed to save payment method');
        }

        // Set as default if requested
        if (isDefault) {
          await stripeApi.setDefaultPaymentMethod(customerId, paymentMethod.id);
        }

        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        ref={successRef}
        className="bg-white rounded-xl p-8 shadow-sm border border-pj-gold/30 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-2xl text-pj-navy mb-2">Card Added Successfully!</h3>
        <p className="text-pj-gray mb-6">
          Your payment method has been securely saved to your account.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setSuccess(false);
              setCardholderName('');
              setBillingAddress({
                line1: '',
                line2: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'US',
              });
              setIsDefault(false);
              elements?.getElement(CardNumberElement)?.clear();
            }}
            variant="outline"
          >
            Add Another Card
          </Button>
          <Button onClick={onCancel} className="bg-pj-navy hover:bg-pj-navy/90">
            Done
          </Button>
        </div>
      </div>
    );
  }

  const isCardValid = cardComplete.cardNumber && cardComplete.expiry && cardComplete.cvc;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Card Details Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-pj-navy rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-display text-lg text-pj-navy">Card Details</h3>
        </div>

        <div className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card-number" className="text-pj-navy">
              Card Number
            </Label>
            <div
              className={cn(
                'relative rounded-lg border bg-white px-4 py-3 transition-all duration-200',
                'focus-within:border-pj-blue focus-within:ring-2 focus-within:ring-pj-blue/20',
                error && !cardComplete.cardNumber && 'border-red-500 ring-2 ring-red-500/20'
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-pj-gray flex-shrink-0" />
                <div className="flex-1">
                  <CardNumberElement
                    options={{
                      style: elementStyles,
                      placeholder: '0000 0000 0000 0000',
                    }}
                    onChange={handleCardNumberChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-pj-navy">
                Expiry Date
              </Label>
              <div
                className={cn(
                  'rounded-lg border bg-white px-4 py-3 transition-all duration-200',
                  'focus-within:border-pj-blue focus-within:ring-2 focus-within:ring-pj-blue/20'
                )}
              >
                <CardExpiryElement
                  options={{
                    style: elementStyles,
                    placeholder: 'MM / YY',
                  }}
                  onChange={handleCardExpiryChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-pj-navy">
                CVC
              </Label>
              <div
                className={cn(
                  'rounded-lg border bg-white px-4 py-3 transition-all duration-200',
                  'focus-within:border-pj-blue focus-within:ring-2 focus-within:ring-pj-blue/20'
                )}
              >
                <CardCvcElement
                  options={{
                    style: elementStyles,
                    placeholder: '123',
                  }}
                  onChange={handleCardCvcChange}
                />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholder-name" className="text-pj-navy">
              Cardholder Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
              <Input
                id="cardholder-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name as it appears on card"
                className={cn(
                  'pl-10 border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20',
                  !cardholderName.trim() && error && 'border-red-500'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="billing-address"
          checked={isBillingAddressVisible}
          onCheckedChange={(checked) => setIsBillingAddressVisible(checked as boolean)}
        />
        <Label
          htmlFor="billing-address"
          className="text-sm text-pj-gray cursor-pointer"
        >
          Add billing address (optional)
        </Label>
      </div>

      {/* Billing Address Fields */}
      {isBillingAddressVisible && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-pj-blue/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-pj-navy" />
            </div>
            <h3 className="font-display text-lg text-pj-navy">Billing Address</h3>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-pj-navy">Address Line 1</Label>
                <Input
                  value={billingAddress.line1}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))
                  }
                  placeholder="Street address"
                  className="border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-pj-navy">Address Line 2</Label>
                <Input
                  value={billingAddress.line2}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, line2: e.target.value }))
                  }
                  placeholder="Apt, suite, etc."
                  className="border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-pj-navy">City</Label>
                <Input
                  value={billingAddress.city}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                  className="border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-pj-navy">State</Label>
                <Input
                  value={billingAddress.state}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                  placeholder="State"
                  className="border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-pj-navy">ZIP Code</Label>
                <Input
                  value={billingAddress.postalCode}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                  placeholder="00000"
                  className="border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set as Default */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="set-default"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked as boolean)}
        />
        <Label
          htmlFor="set-default"
          className="text-sm text-pj-gray cursor-pointer"
        >
          Set as default payment method
        </Label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !stripe || !isCardValid || !cardholderName.trim()}
          className="flex-1 bg-pj-navy hover:bg-pj-navy/90 text-white h-12"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Adding Card...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Add Payment Method
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-pj-gray pt-2">
        <Lock className="w-3 h-3" />
        <span>Your card information is encrypted and secure</span>
      </div>
    </form>
  );
}

// Wrapper component with Stripe Elements
export function AddPaymentMethod(props: AddPaymentMethodProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof initializeStripe> | null>(null);

  useEffect(() => {
    setStripePromise(initializeStripe());
  }, []);

  if (!stripePromise) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-pj-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <AddPaymentMethodForm {...props} />
    </Elements>
  );
}

export default AddPaymentMethod;
