import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  CreditCard,
  Plus,
  Shield,
  Lock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { stripeApi, type PaymentMethod } from '@/services/stripeApi';
import { SavedPaymentMethods } from '@/components/payment/SavedPaymentMethods';
import { AddPaymentMethod } from '@/components/payment/AddPaymentMethod';

// PCI Compliance Info Component
function PCIComplianceNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-pj-navy/5 to-pj-blue/5 rounded-xl p-6 border border-pj-navy/10">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-pj-navy rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-display text-lg text-pj-navy mb-1">
            Your Payment Information is Secure
          </h4>
          <p className="text-sm text-pj-gray mb-3">
            We use Stripe, a PCI DSS Level 1 certified payment processor, to securely store and handle your payment information.
          </p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-pj-blue hover:text-pj-navy transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Learn More
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-3 text-sm text-pj-gray animate-slide-up">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-pj-navy">PCI DSS Level 1 Compliant:</strong> Stripe meets the highest level of security certification in the payments industry.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-pj-gold mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-pj-navy">End-to-End Encryption:</strong> Your card details are encrypted from the moment you enter them.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-pj-blue mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-pj-navy">Tokenization:</strong> We never store your actual card number—only a secure token.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-pj-navy">Fraud Protection:</strong> Stripe&apos;s advanced fraud detection keeps your transactions safe.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentMethodsPage() {
  const { user } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string>('');

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would call the API
      // For now, using mock data for development
      const { paymentMethods: methods, error: apiError } = await stripeApi.getPaymentMethods(user.id);

      if (apiError) {
        // Fall back to mock data for development
        const mockMethods = stripeApi.getMockPaymentMethods();
        setPaymentMethods(mockMethods);
        setDefaultPaymentMethodId(mockMethods[0]?.id || null);
      } else {
        setPaymentMethods(methods);
        setDefaultPaymentMethodId(methods[0]?.id || null);
      }
    } catch (err) {
      setError('Failed to load payment methods');
      // Fallback to mock data
      const mockMethods = stripeApi.getMockPaymentMethods();
      setPaymentMethods(mockMethods);
      setDefaultPaymentMethodId(mockMethods[0]?.id || null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Page entrance animation
  useEffect(() => {
    if (pageRef.current && !isLoading) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.animate-item'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [isLoading]);

  // Handle set default
  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user?.id) return;

    try {
      const { success, error: apiError } = await stripeApi.setDefaultPaymentMethod(
        user.id,
        paymentMethodId
      );

      if (success) {
        setDefaultPaymentMethodId(paymentMethodId);
      } else {
        console.error('Failed to set default:', apiError);
        // Update UI anyway for mock data
        setDefaultPaymentMethodId(paymentMethodId);
      }
    } catch (err) {
      console.error('Error setting default:', err);
      // Update UI anyway for mock data
      setDefaultPaymentMethodId(paymentMethodId);
    }
  };

  // Handle delete
  const handleDelete = async (paymentMethodId: string) => {
    try {
      const { success, error: apiError } = await stripeApi.detachPaymentMethod(paymentMethodId);

      if (success) {
        setPaymentMethods((prev) => {
          const updated = prev.filter((pm) => pm.id !== paymentMethodId);
          // If we deleted the default, set a new default
          if (defaultPaymentMethodId === paymentMethodId && updated.length > 0) {
            setDefaultPaymentMethodId(updated[0].id);
          }
          return updated;
        });
      } else {
        console.error('Failed to delete:', apiError);
        // Update UI anyway for mock data
        setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId));
      }
    } catch (err) {
      console.error('Error deleting:', err);
      // Update UI anyway for mock data
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId));
    }
  };

  // Handle add success
  const handleAddSuccess = () => {
    loadPaymentMethods();
    setShowAddForm(false);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-pj-gray">Please sign in to manage your payment methods.</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="animate-item">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-pj-navy mb-1">
              Payment Methods
            </h1>
            <p className="text-pj-gray">
              Manage your saved cards and billing information
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className={cn(
              'bg-pj-navy hover:bg-pj-navy/90',
              showAddForm && 'bg-pj-gray hover:bg-pj-gray/90'
            )}
          >
            {showAddForm ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="animate-item bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Security Notice */}
      <div className="animate-item">
        <PCIComplianceNotice />
      </div>

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="animate-item">
          <div className="bg-pj-cream rounded-xl p-6 border border-pj-gold/20">
            <h2 className="font-display text-xl text-pj-navy mb-6">Add New Card</h2>
            <AddPaymentMethod
              customerId={user.id}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Saved Payment Methods */}
      <div className="animate-item">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-pj-navy" />
          <h2 className="font-display text-xl text-pj-navy">
            Saved Cards ({paymentMethods.length})
          </h2>
        </div>
        <SavedPaymentMethods
          paymentMethods={paymentMethods}
          defaultPaymentMethodId={defaultPaymentMethodId}
          onSetDefault={handleSetDefault}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Info */}
      <div className="animate-item text-center text-sm text-pj-gray pt-4 border-t border-gray-200">
        <p>
          Need help?{' '}
          <a href="/contact" className="text-pj-blue hover:text-pj-navy transition-colors">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}

export default PaymentMethodsPage;
