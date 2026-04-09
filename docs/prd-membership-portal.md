# ParkerJoe Membership Portal - Technical Product Requirements Document

## 1. Executive Summary

### Overview
The ParkerJoe Membership Portal is a comprehensive customer account management system designed to provide parents with a seamless experience for managing orders, tracking loyalty rewards, maintaining wishlists, and customizing preferences for their children's clothing needs.

### Goals
- Provide a centralized hub for customer account management
- Enable order tracking and history review
- Drive engagement through "The ParkerJoe Posse" loyalty program
- Simplify repeat purchases via saved preferences and wishlists
- Ensure COPPA compliance for children's privacy protection

### Target Audience
- Primary: Parents/guardians of boys aged newborn to 16
- Secondary: Gift purchasers seeking children's clothing

### Success Metrics
- 80% of registered users access portal within 30 days of account creation
- 25% increase in repeat purchase rate via wishlist conversions
- 40% of orders placed by loyalty program members

---

## 2. Component Inventory

### 2.1 Layout Components

#### AccountLayout
**Purpose:** Shared layout wrapper for all account pages with responsive sidebar navigation.

```typescript
interface AccountLayoutProps {
  children: React.ReactNode;
  activeSection?: 'dashboard' | 'orders' | 'wishlist' | 'loyalty' | 'settings';
}

interface SidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}
```

**Features:**
- Collapsible sidebar (desktop)
- Bottom navigation bar (mobile)
- User profile header with avatar
- Logout functionality
- Responsive breakpoints: <768px (mobile), 768px-1024px (tablet), >1024px (desktop)

---

### 2.2 Dashboard Components

#### AccountDashboard
**Purpose:** Overview page displaying summary cards and quick actions.

```typescript
interface AccountDashboardProps {
  customer: CustomerProfile;
  recentOrders: Order[];
  loyaltyPoints: LoyaltyPoints;
  wishlistCount: number;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}
```

**Features:**
- Welcome message with customer name
- Recent orders preview (last 3)
- Loyalty points balance with tier badge
- Wishlist quick access
- Personalized recommendations

---

### 2.3 Order Components

#### OrderHistory
**Purpose:** List view of all customer orders with filtering and search.

```typescript
interface OrderHistoryProps {
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
  onRequestReturn: (orderId: string) => void;
}

interface OrderFilterState {
  status: OrderStatus[];
  dateRange: { from?: Date; to?: Date };
  searchQuery: string;
}
```

**Features:**
- Sortable table/list view
- Status filter dropdown
- Date range picker
- Search by order number
- Pagination (20 items per page)

#### OrderDetail
**Purpose:** Individual order view with complete information.

```typescript
interface OrderDetailProps {
  order: Order;
  onTrackOrder: () => void;
  onRequestReturn: (items: OrderItem[]) => void;
  onReorder: (items: OrderItem[]) => void;
  onDownloadInvoice: () => void;
}
```

**Features:**
- Order timeline (placed → processed → shipped → delivered)
- Item list with images, prices, quantities
- Shipping address display
- Payment method summary
- Tracking information with external link
- Return request initiation
- Reorder functionality

---

### 2.4 Wishlist Components

#### WishlistGrid
**Purpose:** Grid display of saved products with quick actions.

```typescript
interface WishlistGridProps {
  items: WishlistItem[];
  onRemove: (itemId: string) => void;
  onAddToCart: (item: WishlistItem, size: string) => void;
  onMoveToCart: (itemId: string) => void;
  isLoading?: boolean;
}

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: () => void;
  onAddToCart: (size: string) => void;
  availableSizes: string[];
}
```

**Features:**
- Product image with hover zoom
- Size selector (required before add to cart)
- Price display with sale indicators
- "Added [date]" timestamp
- Quick remove with confirmation
- Empty state illustration
- Move all to cart (with size selection modal)

---

### 2.5 Loyalty Components

#### LoyaltyCard
**Purpose:** Prominent display of loyalty program status.

```typescript
interface LoyaltyCardProps {
  points: LoyaltyPoints;
  tier: LoyaltyTier;
  nextTier?: {
    name: string;
    pointsNeeded: number;
    benefits: string[];
  };
}

interface TierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  size?: 'sm' | 'md' | 'lg';
}
```

**Features:**
- Tier badge with icon
- Current points balance
- Progress bar to next tier
- Points value in dollars
- Tier benefits list
- Animated counter for points

#### LoyaltyHistory
**Purpose:** Transaction history for points earned and redeemed.

```typescript
interface LoyaltyHistoryProps {
  transactions: LoyaltyTransaction[];
  filter?: 'all' | 'earned' | 'redeemed';
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}
```

**Features:**
- Chronological list with color-coded amounts
- Filter by transaction type
- Order reference links
- Points expiration warnings
- Export to CSV

---

### 2.6 Settings Components

#### ProfileForm
**Purpose:** Edit customer profile information.

```typescript
interface ProfileFormProps {
  profile: CustomerProfile;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  marketingConsent: boolean;
}
```

**Features:**
- Form validation with Zod schema
- Email change with verification
- Password change modal
- Profile picture upload (optional)
- Save/Discard changes

#### AddressManager
**Purpose:** Add, edit, and manage shipping addresses.

```typescript
interface AddressManagerProps {
  addresses: Address[];
  defaultAddressId?: string;
  onAdd: (address: Omit<Address, 'id'>) => Promise<void>;
  onEdit: (id: string, address: Omit<Address, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

interface AddressFormProps {
  address?: Address;
  onSubmit: (address: AddressFormData) => Promise<void>;
  onCancel: () => void;
  countries: { code: string; name: string }[];
}
```

**Features:**
- Address validation (USPS/US validation)
- Default address indicator
- Add/Edit modal with form
- Delete confirmation
- Address type labels (Home, Work, etc.)
- Maximum 10 addresses per account

#### PaymentMethods
**Purpose:** Display and manage saved payment methods.

```typescript
interface PaymentMethodsProps {
  methods: PaymentMethod[];
  defaultMethodId?: string;
  onAdd: (paymentMethod: PaymentMethodData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  brand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}
```

**Features:**
- Stripe/Shopify vault integration
- Card brand icons
- Expiration warnings (< 30 days)
- PCI-compliant display (last 4 only)
- Add new card modal with Stripe Elements
- Delete confirmation

#### SizePreferences
**Purpose:** Save child's size preferences for faster shopping.

```typescript
interface SizePreferencesProps {
  children: ChildProfile[];
  brandSizeGuides: BrandSizeGuide[];
  onAddChild: (child: Omit<ChildProfile, 'id'>) => Promise<void>;
  onUpdateChild: (id: string, child: Partial<ChildProfile>) => Promise<void>;
  onRemoveChild: (id: string) => Promise<void>;
}

interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  currentSize: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  notes?: string;
}

interface BrandSizeGuide {
  brandId: string;
  brandName: string;
  category: string;
  sizeChart: SizeChartEntry[];
}
```

**Features:**
- Add child profile (name, DOB auto-calculates size)
- Brand-specific size selection
- Size chart reference modals
- Growth predictions
- Privacy-focused (no child photos, minimal PII)

#### CommunicationPrefs
**Purpose:** Manage email and SMS communication preferences.

```typescript
interface CommunicationPrefsProps {
  preferences: CommunicationPreferences;
  onUpdate: (prefs: Partial<CommunicationPreferences>) => Promise<void>;
}

interface CommunicationPreferences {
  email: {
    orderUpdates: boolean;
    shippingNotifications: boolean;
    promotions: boolean;
    newArrivals: boolean;
    loyaltyUpdates: boolean;
  };
  sms: {
    orderUpdates: boolean;
    shippingNotifications: boolean;
    promotions: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}
```

**Features:**
- Granular opt-in controls
- SMS verification flow
- Unsubscribe all option
- Preference change confirmation
- CAN-SPAM compliance indicators

---

### 2.7 Security Components

#### CoppaConsentModal
**Purpose:** Parental consent verification for COPPA compliance.

```typescript
interface CoppaConsentModalProps {
  isOpen: boolean;
  onConsent: (verified: boolean) => void;
  childInfo: {
    name: string;
    dateOfBirth: string;
  };
}
```

**Features:**
- Clear explanation of data collection
- Parent verification via email or SMS
- Consent timestamp recording
- Withdraw consent option

---

## 3. Page Specifications

### 3.1 Route Structure

```
/account                    → AccountDashboard (default)
/account/orders            → OrderHistory
/account/orders/:id        → OrderDetail
/account/wishlist          → WishlistGrid
/account/loyalty           → LoyaltyCard + LoyaltyHistory
/account/settings          → Settings hub (tabs)
/account/settings/profile  → ProfileForm
/account/settings/address  → AddressManager
/account/settings/payment  → PaymentMethods
/account/settings/sizes    → SizePreferences
/account/settings/comms    → CommunicationPrefs
```

### 3.2 Page Details

#### /account (Dashboard)
- **Layout:** Full-width cards, 2-column on desktop
- **Sections:** 
  - Welcome header with member since date
  - Quick stats row (4 cards)
  - Recent orders (max 3)
  - Loyalty status card
  - Wishlist preview (max 4 items)
- **Empty States:** First-time user onboarding flow
- **Loading:** Skeleton cards with stagger animation

#### /account/orders
- **Layout:** Table on desktop, cards on mobile
- **Features:**
  - Filter sidebar (collapsible)
  - Search bar
  - Sort dropdown
  - Pagination
- **Empty State:** "No orders yet" with CTA to shop

#### /account/orders/:id
- **Layout:** Single column, timeline visualization
- **Sections:**
  - Order summary header
  - Progress timeline
  - Item list with images
  - Shipping details
  - Payment summary
  - Actions bar

#### /account/wishlist
- **Layout:** Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
- **Features:**
  - Select all / batch actions
  - Share wishlist
  - Move to cart modal
- **Empty State:** Heart illustration, "Start your wishlist" CTA

#### /account/loyalty
- **Layout:** Hero card + transaction list
- **Features:**
  - Animated points counter
  - Tier benefits accordion
  - Points calculator
  - Redemption options
- **Empty State:** "Start earning" with first purchase CTA

#### /account/settings
- **Layout:** Tabs navigation (desktop) / Accordion (mobile)
- **Sections:** Profile, Addresses, Payment, Sizes, Communications
- **Auto-save:** Debounced 500ms after field change
- **Validation:** Real-time with Zod schemas

---

## 4. Data Models

### 4.1 Core Types

```typescript
// User/Auth Types
interface CustomerProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  marketingConsent: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Order Types
interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethodSummary;
  tracking?: TrackingInfo;
  placedAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  sku: string;
  size: string;
  color: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  isGift: boolean;
  giftMessage?: string;
}

interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
}

// Wishlist Types
interface WishlistItem {
  id: string;
  customerId: string;
  productId: string;
  variantId: string;
  addedAt: string;
  notes?: string;
  // Joined from Shopify
  product: {
    id: string;
    title: string;
    brand: string;
    handle: string;
    images: { url: string; altText: string }[];
    price: {
      amount: number;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: number;
      currencyCode: string;
    };
    availableSizes: string[];
    availableColors: string[];
    inStock: boolean;
  };
}

// Loyalty Types
interface LoyaltyPoints {
  customerId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  pendingPoints: number;
  tier: LoyaltyTier;
  tierEntryAt: string;
  nextTier?: {
    name: string;
    pointsNeeded: number;
  };
}

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface LoyaltyTierConfig {
  id: LoyaltyTier;
  name: string;
  minPoints: number;
  pointsMultiplier: number;
  benefits: string[];
  badgeUrl: string;
}

interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjusted';
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  expiresAt?: string;
  createdAt: string;
}

// Address Types
interface Address {
  id: string;
  customerId: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Size Preferences Types
interface SizePreference {
  id: string;
  customerId: string;
  childName: string;
  dateOfBirth: string;
  measurements?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
  };
  brandSizes: BrandSizePreference[];
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BrandSizePreference {
  brandId: string;
  brandName: string;
  tops?: string;
  bottoms?: string;
  shoes?: string;
  outerwear?: string;
}

// Payment Types
interface PaymentMethodSummary {
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  brand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

interface CommunicationPreferences {
  customerId: string;
  email: {
    orderUpdates: boolean;
    shippingNotifications: boolean;
    promotions: boolean;
    newArrivals: boolean;
    loyaltyUpdates: boolean;
    surveyInvites: boolean;
  };
  sms: {
    orderUpdates: boolean;
    shippingNotifications: boolean;
    promotions: boolean;
    loyaltyUpdates: boolean;
  };
  push: {
    orderUpdates: boolean;
    shippingNotifications: boolean;
    promotions: boolean;
    backInStock: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  updatedAt: string;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    hasMore?: boolean;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

### 4.2 Zod Validation Schemas

```typescript
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().datetime().optional(),
  marketingConsent: z.boolean(),
});

export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  company: z.string().max(100).optional(),
  address1: z.string().min(1).max(100),
  address2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  province: z.string().min(1).max(50),
  country: z.string().length(2),
  zip: z.string().min(3).max(20),
  phone: z.string().optional(),
});

export const sizePreferenceSchema = z.object({
  childName: z.string().min(1).max(50),
  dateOfBirth: z.string().datetime(),
  measurements: z.object({
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    chest: z.number().positive().optional(),
    waist: z.number().positive().optional(),
    hips: z.number().positive().optional(),
    inseam: z.number().positive().optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
});
```

---

## 5. API Integration Details

### 5.1 Supabase Integration

#### Auth
```typescript
// Supabase Auth Configuration
const supabaseAuth = {
  // Authentication methods
  signUp: async (email: string, password: string, metadata: object) => {
    // Email confirmation required
    // Creates customer_profile on auth.user() insert trigger
  },
  signIn: async (email: string, password: string) => {
    // Returns session with JWT
  },
  signInWithOAuth: async (provider: 'google' | 'facebook') => {
    // Social login options
  },
  resetPassword: async (email: string) => {
    // Sends reset email
  },
  updatePassword: async (newPassword: string) => {
    // Requires valid session
  },
  signOut: async () => {
    // Clears session
  },
  onAuthStateChange: (callback) => {
    // Subscribe to auth events
  }
};
```

#### Database (RLS Protected)

```sql
-- RLS Policy Examples
-- Customers can only read/update their own data

-- customer_profiles
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- wishlist_items
CREATE POLICY "Users can manage own wishlist"
  ON wishlist_items FOR ALL
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- loyalty_points
CREATE POLICY "Users can view own loyalty data"
  ON loyalty_points FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));
```

#### TypeScript Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Custom hooks
export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>
) {
  // React Query integration
}
```

### 5.2 Shopify Storefront API

```typescript
// lib/shopify.ts
const SHOPIFY_STOREFRONT_API = import.meta.env.VITE_SHOPIFY_STOREFRONT_API;
const SHOPIFY_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

// GraphQL queries
const GET_PRODUCT = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// Wishlist enrichment
export async function fetchProductDetails(productId: string) {
  const response = await fetch(SHOPIFY_STOREFRONT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: GET_PRODUCT,
      variables: { id: productId },
    }),
  });
  return response.json();
}
```

### 5.3 API Service Layer

```typescript
// services/customerApi.ts
export const customerApi = {
  // Profile
  getProfile: () => supabase
    .from('customer_profiles')
    .select('*')
    .single(),
  
  updateProfile: (data: Partial<CustomerProfile>) => supabase
    .from('customer_profiles')
    .update(data)
    .eq('user_id', supabase.auth.getUser()),

  // Orders
  getOrders: (params: { page?: number; limit?: number }) => supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('placed_at', { ascending: false })
    .range(params.page * params.limit, (params.page + 1) * params.limit - 1),

  getOrderById: (id: string) => supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single(),

  // Wishlist
  getWishlist: () => supabase
    .from('wishlist_items')
    .select('*')
    .order('added_at', { ascending: false }),

  addToWishlist: (productId: string, variantId: string) => supabase
    .from('wishlist_items')
    .insert({ product_id: productId, variant_id: variantId }),

  removeFromWishlist: (id: string) => supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id),

  // Loyalty
  getLoyaltyPoints: () => supabase
    .from('loyalty_points')
    .select('*')
    .single(),

  getLoyaltyHistory: () => supabase
    .from('loyalty_transactions')
    .select('*')
    .order('created_at', { ascending: false }),

  // Addresses
  getAddresses: () => supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false }),

  createAddress: (address: Omit<Address, 'id'>) => supabase
    .from('addresses')
    .insert(address)
    .select()
    .single(),

  updateAddress: (id: string, address: Partial<Address>) => supabase
    .from('addresses')
    .update(address)
    .eq('id', id)
    .select()
    .single(),

  deleteAddress: (id: string) => supabase
    .from('addresses')
    .delete()
    .eq('id', id),

  setDefaultAddress: (id: string) => supabase.rpc('set_default_address', {
    address_id: id,
  }),
};
```

---

## 6. File Structure

```
app/
├── src/
│   ├── App.tsx                          # Main app with routing
│   ├── main.tsx                         # Entry point with providers
│   ├── index.css                        # Global styles
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components (existing)
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   │
│   │   └── account/                     # NEW: Account components
│   │       ├── AccountLayout.tsx
│   │       ├── AccountDashboard.tsx
│   │       ├── DashboardCard.tsx
│   │       │
│   │       ├── orders/
│   │       │   ├── OrderHistory.tsx
│   │       │   ├── OrderDetail.tsx
│   │       │   ├── OrderStatusBadge.tsx
│   │       │   ├── OrderTimeline.tsx
│   │       │   └── OrderItemCard.tsx
│   │       │
│   │       ├── wishlist/
│   │       │   ├── WishlistGrid.tsx
│   │       │   ├── WishlistItemCard.tsx
│   │       │   └── WishlistEmpty.tsx
│   │       │
│   │       ├── loyalty/
│   │       │   ├── LoyaltyCard.tsx
│   │       │   ├── LoyaltyHistory.tsx
│   │       │   ├── TierBadge.tsx
│   │       │   ├── PointsProgress.tsx
│   │       │   └── LoyaltyEmpty.tsx
│   │       │
│   │       ├── settings/
│   │       │   ├── ProfileForm.tsx
│   │       │   ├── AddressManager.tsx
│   │       │   ├── AddressForm.tsx
│   │       │   ├── AddressCard.tsx
│   │       │   ├── PaymentMethods.tsx
│   │       │   ├── PaymentCard.tsx
│   │       │   ├── SizePreferences.tsx
│   │       │   ├── ChildProfileForm.tsx
│   │       │   ├── SizeSelector.tsx
│   │       │   └── CommunicationPrefs.tsx
│   │       │
│   │       └── shared/
│   │           ├── SidebarNav.tsx
│   │           ├── MobileNav.tsx
│   │           ├── PageHeader.tsx
│   │           ├── EmptyState.tsx
│   │           ├── LoadingSkeleton.tsx
│   │           └── ErrorBoundary.tsx
│   │
│   ├── context/                         # Context providers
│   │   ├── CartContext.tsx              # Existing
│   │   ├── AuthContext.tsx              # NEW
│   │   └── UserContext.tsx              # NEW
│   │
│   ├── hooks/                           # Custom hooks
│   │   ├── use-mobile.ts                # Existing
│   │   ├── use-auth.ts                  # NEW
│   │   ├── use-user.ts                  # NEW
│   │   ├── use-orders.ts                # NEW
│   │   ├── use-wishlist.ts              # NEW
│   │   ├── use-loyalty.ts               # NEW
│   │   └── use-gsap.ts                  # NEW
│   │
│   ├── lib/                             # Utilities
│   │   ├── utils.ts                     # Existing (cn helper)
│   │   ├── supabase.ts                  # NEW
│   │   ├── shopify.ts                   # NEW
│   │   └── validations.ts               # NEW (Zod schemas)
│   │
│   ├── services/                        # API services
│   │   ├── customerApi.ts               # NEW
│   │   ├── orderApi.ts                  # NEW
│   │   ├── wishlistApi.ts               # NEW
│   │   └── loyaltyApi.ts                # NEW
│   │
│   ├── types/                           # TypeScript types
│   │   ├── database.ts                  # NEW (Supabase generated)
│   │   ├── customer.ts                  # NEW
│   │   ├── order.ts                     # NEW
│   │   ├── wishlist.ts                  # NEW
│   │   ├── loyalty.ts                   # NEW
│   │   └── index.ts                     # NEW
│   │
│   ├── pages/                           # Page components
│   │   ├── HomePage.tsx                 # NEW (current App content)
│   │   └── account/                     # NEW
│   │       ├── AccountPage.tsx
│   │       ├── OrdersPage.tsx
│   │       ├── OrderDetailPage.tsx
│   │       ├── WishlistPage.tsx
│   │       ├── LoyaltyPage.tsx
│   │       └── SettingsPage.tsx
│   │
│   └── sections/                        # Existing landing sections
│       ├── Navigation.tsx
│       ├── Hero.tsx
│       └── ...
│
├── supabase/                            # Supabase config
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── seed.sql
│
└── docs/
    └── prd-membership-portal.md         # This document
```

---

## 7. Implementation Notes

### 7.1 Routing Setup

```typescript
// main.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>
);

// App.tsx routing structure
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/account" element={<AccountLayout />}>
    <Route index element={<AccountPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="orders/:id" element={<OrderDetailPage />} />
    <Route path="wishlist" element={<WishlistPage />} />
    <Route path="loyalty" element={<LoyaltyPage />} />
    <Route path="settings/*" element={<SettingsPage />} />
  </Route>
</Routes>
```

### 7.2 Context Implementation

```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// context/UserContext.tsx
interface UserContextType {
  profile: CustomerProfile | null;
  addresses: Address[];
  preferences: CommunicationPreferences | null;
  isLoading: boolean;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### 7.3 GSAP Animation Patterns

```typescript
// hooks/use-gsap.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function usePageAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for cards
      gsap.from('.animate-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });

      // Fade in for text
      gsap.from('.animate-fade', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

// Usage in components
function AccountDashboard() {
  const containerRef = usePageAnimation();
  
  return (
    <div ref={containerRef}>
      <div className="animate-fade">Welcome back!</div>
      <div className="animate-card">Card 1</div>
      <div className="animate-card">Card 2</div>
    </div>
  );
}
```

### 7.4 Loading States

```typescript
// components/shared/LoadingSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}
```

### 7.5 Empty States

```typescript
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage examples
<EmptyState
  icon={ShoppingBag}
  title="No orders yet"
  description="Start shopping to see your orders here"
  action={{ label: 'Shop Now', onClick: () => navigate('/') }}
/>

<EmptyState
  icon={Heart}
  title="Your wishlist is empty"
  description="Save items you love for later"
  action={{ label: 'Browse Products', onClick: () => navigate('/') }}
/>
```

### 7.6 Responsive Breakpoints

```css
/* Tailwind classes pattern */
/* Mobile-first approach */
.account-layout {
  @apply flex flex-col;              /* Mobile: stacked */
  @apply lg:flex-row;                /* Desktop: sidebar + content */
}

.sidebar {
  @apply w-full;                     /* Mobile: full width */
  @apply lg:w-64 lg:shrink-0;        /* Desktop: fixed sidebar */
  @apply hidden lg:block;            /* Hide on mobile */
}

.mobile-nav {
  @apply fixed bottom-0 left-0 right-0;  /* Mobile: bottom bar */
  @apply lg:hidden;                       /* Hide on desktop */
}

.content {
  @apply p-4;                        /* Mobile padding */
  @apply lg:p-8;                     /* Desktop padding */
}
```

### 7.7 Security Implementation

```typescript
// COPPA compliance - no child PII storage
interface ChildProfile {
  // OK to store
  name: string;           // First name only, no last name
  dateOfBirth: string;    // Used for size recommendations
  
  // NEVER store
  // - Last name
  // - Photos
  // - Location data
  // - School information
  // - Social media handles
}

// Parental consent verification
async function verifyParentalConsent(childAge: number) {
  if (childAge < 13) {
    // Show COPPA consent modal
    // Require email verification from parent
    // Store consent timestamp and method
    return showCoppaConsentModal();
  }
  return true;
}

// RLS enforcement on all queries
// All queries automatically filter by authenticated user
// No manual user_id filtering needed in application code
```

---

## 8. Testing Checklist

### 8.1 Unit Tests

```typescript
// Component tests
describe('AccountDashboard', () => {
  it('renders welcome message with customer name', () => {});
  it('displays correct order count', () => {});
  it('shows loyalty points balance', () => {});
  it('handles empty state correctly', () => {});
});

describe('OrderHistory', () => {
  it('filters orders by status', () => {});
  it('searches by order number', () => {});
  it('sorts by date correctly', () => {});
  it('paginates results', () => {});
});

describe('ProfileForm', () => {
  it('validates email format', () => {});
  it('validates required fields', () => {});
  it('submits valid data', () => {});
  it('shows loading state during submission', () => {});
});
```

### 8.2 Integration Tests

- [ ] User authentication flow (login → dashboard → logout)
- [ ] Order placement → appearance in order history
- [ ] Wishlist add/remove → persistence
- [ ] Loyalty points earning → balance update
- [ ] Address CRUD operations
- [ ] Payment method management
- [ ] Settings changes → persistence

### 8.3 E2E Tests

- [ ] Complete user journey: Register → Browse → Add to wishlist → Checkout → View order
- [ ] Mobile responsive navigation
- [ ] Error handling (network failure, invalid inputs)
- [ ] Session expiration handling
- [ ] Password reset flow

### 8.4 Accessibility Tests

- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on icon buttons
- [ ] Focus visible indicators
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (WCAG 2.1 AA)
- [ ] Form error announcements

### 8.5 Security Tests

- [ ] RLS policies prevent cross-user data access
- [ ] Authentication required for all account routes
- [ ] COPPA compliance verification (< 13 years)
- [ ] CSRF protection on state-changing operations
- [ ] XSS prevention on user-generated content
- [ ] Secure session management

### 8.6 Performance Tests

- [ ] Initial page load < 2s (3G)
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB (account section)
- [ ] Smooth 60fps animations
- [ ] Lazy loading for order history pagination

---

## 9. Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "@stripe/stripe-js": "^2.x",
    "@stripe/react-stripe-js": "^2.x"
  },
  "devDependencies": {
    "supabase": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "msw": "^2.x"
  }
}
```

---

## 10. Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Shopify
VITE_SHOPIFY_STOREFRONT_API=https://parkerjoe.myshopify.com/api/2024-01/graphql.json
VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Appendix: Brand Color Usage Guide

| Element | Color | Usage |
|---------|-------|-------|
| Primary buttons | pj-navy | CTA, submit actions |
| Secondary buttons | pj-blue | Cancel, back actions |
| Accents/highlights | pj-gold | Loyalty tiers, badges |
| Background | pj-cream | Page backgrounds |
| Success states | green-600 | Order confirmed, points earned |
| Warning states | amber-500 | Low stock, expiring soon |
| Error states | red-500 | Validation errors, failures |
| Text primary | pj-navy | Headings, important text |
| Text secondary | pj-gray | Descriptions, metadata |
| Borders | gray-200 | Cards, dividers |

---

*Document Version: 1.0*
*Last Updated: April 2026*
*Author: ParkerJoe Engineering Team*
