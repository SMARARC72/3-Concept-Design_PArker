import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;
let stripeInstance: Stripe | null = null;

// Initialize Stripe.js with publishable key
export const initializeStripe = async (): Promise<Stripe | null> => {
  if (stripeInstance) {
    return stripeInstance;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }

  stripeInstance = await stripePromise;
  return stripeInstance;
};

// Get the current Stripe instance (must be initialized first)
export const getStripe = (): Stripe | null => {
  return stripeInstance;
};

// Payment Method types
export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    } | null;
  };
  created: number;
}

export interface CreatePaymentMethodResult {
  paymentMethod?: PaymentMethod;
  error?: {
    message: string;
    code?: string;
    decline_code?: string;
  };
}

// Create payment method from card element
export const createPaymentMethod = async (
  cardElement: StripeCardElement,
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  }
): Promise<CreatePaymentMethodResult> => {
  const stripe = await initializeStripe();

  if (!stripe) {
    return {
      error: { message: 'Stripe failed to initialize' }
    };
  }

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  });

  if (error) {
    return {
      error: {
        message: error.message || 'An error occurred',
        code: error.code,
        decline_code: error.decline_code,
      }
    };
  }

  return { paymentMethod: paymentMethod as unknown as PaymentMethod };
};

// Attach payment method to customer (requires backend)
export const attachPaymentMethod = async (
  paymentMethodId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // This requires a backend endpoint for security
    // The Stripe secret key should never be exposed in the frontend
    const response = await fetch('/api/stripe/attach-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId, customerId }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to attach payment method' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
};

// Get payment methods for a customer
export const getPaymentMethods = async (
  customerId: string
): Promise<{ paymentMethods: PaymentMethod[]; error?: string }> => {
  try {
    const response = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const data = await response.json();
      return { paymentMethods: [], error: data.error || 'Failed to fetch payment methods' };
    }

    const data = await response.json();
    return { paymentMethods: data.paymentMethods || [] };
  } catch (error) {
    return { paymentMethods: [], error: 'Network error occurred' };
  }
};

// Detach payment method from customer
export const detachPaymentMethod = async (
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/stripe/detach-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to detach payment method' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
};

// Set default payment method for customer
export const setDefaultPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/stripe/set-default-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, paymentMethodId }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to set default payment method' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
};

// Get card brand icon name (for use with Lucide icons)
export const getCardBrandIcon = (brand: string): string => {
  const brandMap: Record<string, string> = {
    'visa': 'CreditCard',
    'mastercard': 'CreditCard',
    'amex': 'CreditCard',
    'discover': 'CreditCard',
    'diners': 'CreditCard',
    'jcb': 'CreditCard',
    'unionpay': 'CreditCard',
  };
  return brandMap[brand.toLowerCase()] || 'CreditCard';
};

// Format card number for display (**** **** **** 4242)
export const formatCardNumber = (last4: string): string => {
  return `•••• •••• •••• ${last4}`;
};

// Mock data for development/testing
export const getMockPaymentMethods = (): PaymentMethod[] => [
  {
    id: 'pm_mock_1',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2027,
    },
    billing_details: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: null,
      address: null,
    },
    created: Date.now() / 1000,
  },
  {
    id: 'pm_mock_2',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '8888',
      exp_month: 6,
      exp_year: 2026,
    },
    billing_details: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: null,
      address: null,
    },
    created: Date.now() / 1000 - 86400,
  },
];

// Stripe API object
export const stripeApi = {
  initialize: initializeStripe,
  getStripe,
  createPaymentMethod,
  attachPaymentMethod,
  getPaymentMethods,
  detachPaymentMethod,
  setDefaultPaymentMethod,
  getCardBrandIcon,
  formatCardNumber,
  getMockPaymentMethods,
};

export default stripeApi;
