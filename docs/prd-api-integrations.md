# ParkerJoe API Integration Layer - Technical PRD

## Document Information

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Author | Technical Architecture Team |
| Date | 2026-04-09 |
| Reviewers | Engineering Lead, DevOps |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Service Layer Design](#3-service-layer-design)
4. [Shopify Integration](#4-shopify-integration)
5. [Klaviyo Integration](#5-klaviyo-integration)
6. [Judge.me Integration](#6-judgeme-integration)
7. [Smile.io Integration](#7-smileio-integration)
8. [Anthropic API Integration](#8-anthropic-api-integration)
9. [GA4 Analytics Integration](#9-ga4-analytics-integration)
10. [Error Handling & Resilience](#10-error-handling--resilience)
11. [Rate Limiting](#11-rate-limiting)
12. [Configuration & Environment](#12-configuration--environment)
13. [Testing Strategy](#13-testing-strategy)

---

## 1. Executive Summary

### Purpose

This document defines the technical specifications for the ParkerJoe API Integration Layer—a comprehensive TypeScript-based service architecture that enables seamless communication between the ParkerJoe e-commerce platform and third-party services.

### Scope

| Integration | Primary Use Case | Criticality |
|-------------|------------------|-------------|
| **Shopify** | Product catalog, cart, checkout, orders | Critical |
| **Klaviyo** | Email/SMS marketing, customer segmentation | Critical |
| **Judge.me** | Product reviews, UGC content | High |
| **Smile.io** | Loyalty program, points, rewards | High |
| **Anthropic** | AI-powered content, personalization | Medium |
| **GA4** | Analytics, conversion tracking | Critical |

### Key Design Principles

1. **Type Safety**: All API contracts fully typed with TypeScript
2. **Resilience**: Circuit breakers, retries, and graceful degradation
3. **Performance**: Intelligent caching and request batching
4. **Observability**: Comprehensive logging and metrics
5. **Maintainability**: Consistent patterns across all services

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ParkerJoe Frontend                               │
│                    (React + TypeScript + Vite)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Integration Layer                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Shopify    │ │   Klaviyo    │ │  Judge.me    │ │   Smile.io   │  │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                    │
│  │  Anthropic   │ │   Analytics  │ │   Rate       │                    │
│  │   Service    │ │   Service    │ │   Limiter    │                    │
│  └──────────────┘ └──────────────┘ └──────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │    Redis     │ │   Webhook    │ │    Queue     │
           │    Cache     │ │   Handler    │ │   Service    │
           └──────────────┘ └──────────────┘ └──────────────┘
```

### 2.2 Core Infrastructure Components

#### 2.2.1 Base HTTP Client

```typescript
// lib/api/base-client.ts

import type { ApiConfig, ApiResponse, RetryConfig } from './types';

export interface HttpClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: RetryConfig;
}

export class BaseHttpClient {
  private config: HttpClientOptions;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;

  constructor(options: HttpClientOptions) {
    this.config = {
      timeout: 30000,
      retries: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
      },
      ...options,
    };
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = new RateLimiter();
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Implementation with circuit breaker, rate limiting, and retries
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>>;
  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>>;
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>>;
  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>>;
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}
```

#### 2.2.2 Service Factory Pattern

```typescript
// lib/api/service-factory.ts

import { ShopifyService } from './services/shopify';
import { KlaviyoService } from './services/klaviyo';
import { JudgeMeService } from './services/judgeme';
import { SmileService } from './services/smile';
import { AnthropicService } from './services/anthropic';
import { AnalyticsService } from './services/analytics';

export class ServiceFactory {
  private static instances: Map<string, unknown> = new Map();

  static getShopify(): ShopifyService {
    return this.getOrCreate('shopify', () => new ShopifyService());
  }

  static getKlaviyo(): KlaviyoService {
    return this.getOrCreate('klaviyo', () => new KlaviyoService());
  }

  static getJudgeMe(): JudgeMeService {
    return this.getOrCreate('judgeme', () => new JudgeMeService());
  }

  static getSmile(): SmileService {
    return this.getOrCreate('smile', () => new SmileService());
  }

  static getAnthropic(): AnthropicService {
    return this.getOrCreate('anthropic', () => new AnthropicService());
  }

  static getAnalytics(): AnalyticsService {
    return this.getOrCreate('analytics', () => new AnalyticsService());
  }

  private static getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }
}
```

---

## 3. Service Layer Design

### 3.1 Shared Type Definitions

```typescript
// lib/api/types/common.ts

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  rateLimit?: RateLimitInfo;
  cache?: CacheMeta;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface CacheMeta {
  hit: boolean;
  ttl?: number;
  stale?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelayMs: number;
  maxDelayMs: number;
  retryableStatuses?: number[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  version?: string;
  timeout?: number;
  retries?: RetryConfig;
}
```

### 3.2 Error Handling Types

```typescript
// lib/api/types/errors.ts

export enum ErrorCode {
  // HTTP Errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Application Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ApiException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export interface ErrorHandlerConfig {
  fallbackStrategy: 'throw' | 'return-null' | 'cache-stale' | 'default-value';
  defaultValue?: unknown;
  logErrors: boolean;
  alertOnError?: (error: ApiException) => boolean;
}
```

---

## 4. Shopify Integration

### 4.1 Architecture Overview

The Shopify integration uses a dual-API approach:
- **Storefront API**: Client-side operations (products, cart, checkout)
- **Admin API**: Server-side operations (orders, inventory, customers via proxy)

### 4.2 Configuration

```typescript
// lib/api/services/shopify/config.ts

export interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string;
  adminAccessToken: string; // Server-side only
  apiVersion: string;
  storefrontApiUrl: string;
  adminApiUrl: string;
  webhookSecret: string;
}

export const shopifyConfig: ShopifyConfig = {
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
  adminAccessToken: import.meta.env.SHOPIFY_ADMIN_TOKEN, // Server only
  apiVersion: '2024-01',
  get storefrontApiUrl() {
    return `https://${this.storeDomain}/api/${this.apiVersion}/graphql`;
  },
  get adminApiUrl() {
    return `https://${this.storeDomain}/admin/api/${this.apiVersion}`;
  },
  webhookSecret: import.meta.env.SHOPIFY_WEBHOOK_SECRET,
};
```

### 4.3 Type Definitions

```typescript
// lib/api/services/shopify/types.ts

// ============ Product Types ============

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  options: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
  priceRange: PriceRange;
  compareAtPriceRange?: PriceRange;
  metafields: Metafield[];
  seo: SEO;
  availableForSale: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: Money;
  compareAtPrice?: Money;
  inventoryQuantity: number;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  image?: ProductImage;
  weight?: number;
  weightUnit: string;
  requiresShipping: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface PriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface SEO {
  title: string;
  description: string;
}

// ============ Collection Types ============

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image?: ProductImage;
  products: PaginatedResponse<ShopifyProduct>;
  seo: SEO;
  updatedAt: string;
}

export interface CollectionQueryParams extends PaginationParams {
  sortKey?: 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED' | 'UPDATED';
  reverse?: boolean;
  filters?: ProductFilter[];
}

export interface ProductFilter {
  field: 'tag' | 'product_type' | 'vendor' | 'price' | 'available';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

// ============ Cart Types ============

export interface Cart {
  id: string;
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
  lines: CartLine[];
  attributes: CartAttribute[];
  cost: CartCost;
  buyerIdentity: BuyerIdentity;
  discountCodes: AppliedDiscountCode[];
  totalQuantity: number;
}

export interface CartLine {
  id: string;
  merchandise: ProductVariant;
  quantity: number;
  attributes: CartAttribute[];
  cost: LineCost;
}

export interface CartAttribute {
  key: string;
  value: string;
}

export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount?: Money;
  totalDutyAmount?: Money;
  checkoutChargeAmount: Money;
}

export interface LineCost {
  subtotalAmount: Money;
  totalAmount: Money;
}

export interface BuyerIdentity {
  email?: string;
  phone?: string;
  customer?: Customer;
  countryCode?: string;
  deliveryAddressPreferences: DeliveryAddress[];
}

export interface DeliveryAddress {
  deliveryAddress: MailingAddress;
  deliveryAddressValidationStrategy: 'STRICT' | 'COUNTRY_CODE_ONLY';
}

export interface MailingAddress {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

export interface AppliedDiscountCode {
  code: string;
  applicable: boolean;
}

// ============ Customer Types ============

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  orders: PaginatedResponse<Order>;
  defaultAddress?: MailingAddress;
  addresses: MailingAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

// ============ Order Types ============

export interface Order {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  totalPrice: Money;
  subtotalPrice: Money;
  totalShippingPrice: Money;
  totalTax: Money;
  lineItems: OrderLineItem[];
  shippingAddress?: MailingAddress;
  billingAddress?: MailingAddress;
  statusUrl: string;
}

export type OrderFinancialStatus = 
  | 'PENDING' 
  | 'AUTHORIZED' 
  | 'PARTIALLY_PAID' 
  | 'PAID' 
  | 'PARTIALLY_REFUNDED' 
  | 'REFUNDED' 
  | 'VOIDED';

export type OrderFulfillmentStatus = 
  | 'UNFULFILLED' 
  | 'PARTIAL' 
  | 'FULFILLED' 
  | 'RESTOCKED';

export interface OrderLineItem {
  title: string;
  variant?: ProductVariant;
  quantity: number;
  originalTotalPrice: Money;
  discountedTotalPrice: Money;
}

// ============ Webhook Types ============

export type ShopifyWebhookTopic =
  | 'orders/create'
  | 'orders/paid'
  | 'orders/fulfilled'
  | 'products/update'
  | 'products/create'
  | 'products/delete'
  | 'customers/create'
  | 'customers/update'
  | 'checkouts/create'
  | 'checkouts/update'
  | 'app/uninstalled';

export interface ShopifyWebhookPayload<T = unknown> {
  id: string;
  topic: ShopifyWebhookTopic;
  created_at: string;
  data: T;
}
```

### 4.4 Shopify Service Class

```typescript
// lib/api/services/shopify/index.ts

import { BaseHttpClient } from '../../base-client';
import { shopifyConfig } from './config';
import type {
  ShopifyProduct,
  ShopifyCollection,
  Cart,
  Customer,
  CustomerCreateInput,
  CustomerAccessToken,
  Order,
  CollectionQueryParams,
  PaginatedResponse,
} from './types';

export class ShopifyService {
  private client: BaseHttpClient;
  private cartId: string | null = null;

  constructor() {
    this.client = new BaseHttpClient({
      baseURL: shopifyConfig.storefrontApiUrl,
      headers: {
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
        'Content-Type': 'application/json',
      },
    });

    // Restore cart ID from localStorage
    if (typeof window !== 'undefined') {
      this.cartId = localStorage.getItem('shopify_cart_id');
    }
  }

  // ============ Product Methods ============

  /**
   * Fetches a single product by handle
   */
  async getProduct(handle: string): Promise<ShopifyProduct> {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          productType
          tags
          vendor
          options { id name values }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                inventoryQuantity
                availableForSale
                selectedOptions { name value }
                image { id url altText width height }
              }
            }
          }
          images(first: 20) {
            edges {
              node { id url altText width height }
            }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          availableForSale
          seo { title description }
        }
      }
    `;

    const response = await this.client.post<{
      data: { product: ShopifyProduct };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({ query, variables: { handle } }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.product;
  }

  /**
   * Fetches multiple products with pagination and filtering
   */
  async getProducts(params: {
    first?: number;
    after?: string;
    query?: string;
    sortKey?: 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED' | 'UPDATED' | 'RELEVANCE';
    reverse?: boolean;
  } = {}): Promise<PaginatedResponse<ShopifyProduct>> {
    const { first = 20, after, query: searchQuery, sortKey = 'CREATED', reverse = true } = params;

    const graphQuery = `
      query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              id
              handle
              title
              description
              vendor
              productType
              tags
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              availableForSale
              images(first: 1) {
                edges {
                  node { id url altText width height }
                }
              }
              seo { title description }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        products: {
          edges: Array<{ node: ShopifyProduct; cursor: string }>;
          pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string;
            endCursor: string;
          };
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: graphQuery,
        variables: { first, after, query: searchQuery, sortKey, reverse },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    const { edges, pageInfo } = response.data.data.products;

    return {
      data: edges.map((edge) => edge.node),
      pagination: {
        currentPage: after ? parseInt(after, 10) || 1 : 1,
        totalPages: pageInfo.hasNextPage ? 2 : 1,
        totalCount: edges.length,
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.hasPreviousPage,
        nextCursor: pageInfo.endCursor,
        previousCursor: pageInfo.startCursor,
      },
    };
  }

  /**
   * Search products by query string
   */
  async searchProducts(query: string, limit: number = 20): Promise<ShopifyProduct[]> {
    const result = await this.getProducts({
      first: limit,
      query: query,
      sortKey: 'RELEVANCE',
    });
    return result.data;
  }

  /**
   * Get products by tag
   */
  async getProductsByTag(tag: string, limit: number = 20): Promise<ShopifyProduct[]> {
    const result = await this.getProducts({
      first: limit,
      query: `tag:${tag}`,
    });
    return result.data;
  }

  /**
   * Get new arrivals (sorted by created date)
   */
  async getNewArrivals(limit: number = 8): Promise<ShopifyProduct[]> {
    const result = await this.getProducts({
      first: limit,
      sortKey: 'CREATED',
      reverse: true,
    });
    return result.data;
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit: number = 8): Promise<ShopifyProduct[]> {
    const result = await this.getProducts({
      first: limit,
      sortKey: 'BEST_SELLING',
      reverse: true,
    });
    return result.data;
  }

  // ============ Collection Methods ============

  /**
   * Fetches a single collection by handle with its products
   */
  async getCollection(
    handle: string,
    params: CollectionQueryParams = {}
  ): Promise<ShopifyCollection> {
    const { limit = 20, cursor } = params;

    const query = `
      query GetCollection($handle: String!, $first: Int!, $after: String) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          image { id url altText width height }
          seo { title description }
          updatedAt
          products(first: $first, after: $after) {
            edges {
              node {
                id
                handle
                title
                description
                vendor
                productType
                priceRange {
                  minVariantPrice { amount currencyCode }
                  maxVariantPrice { amount currencyCode }
                }
                images(first: 1) {
                  edges {
                    node { id url altText }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: { collection: ShopifyCollection };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query,
        variables: { handle, first: limit, after: cursor },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.collection;
  }

  /**
   * Fetches all collections
   */
  async getCollections(limit: number = 50): Promise<PaginatedResponse<ShopifyCollection>> {
    const query = `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              image { id url altText width height }
              products(first: 0) {
                pageInfo { totalCount }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        collections: {
          edges: Array<{ node: ShopifyCollection; cursor: string }>;
          pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string;
            endCursor: string;
          };
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({ query, variables: { first: limit } }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    const { edges, pageInfo } = response.data.data.collections;

    return {
      data: edges.map((edge) => edge.node),
      pagination: {
        currentPage: 1,
        totalPages: pageInfo.hasNextPage ? 2 : 1,
        totalCount: edges.length,
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.hasPreviousPage,
        nextCursor: pageInfo.endCursor,
        previousCursor: pageInfo.startCursor,
      },
    };
  }

  // ============ Cart Methods ============

  /**
   * Creates a new cart
   */
  async createCart(
    lines: Array<{ merchandiseId: string; quantity: number; attributes?: Array<{ key: string; value: string }> }> = [],
    buyerIdentity?: {
      email?: string;
      phone?: string;
      countryCode?: string;
    }
  ): Promise<Cart> {
    const mutation = `
      mutation CreateCart($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            createdAt
            updatedAt
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      sku
                      price { amount currencyCode }
                      product { id title handle }
                      image { id url altText }
                    }
                  }
                }
              }
            }
            cost {
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
              totalTaxAmount { amount currencyCode }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        cartCreate: {
          cart: Cart;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: { lines, buyerIdentity },
        },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.cartCreate.userErrors.length) {
      throw new Error(response.data.data.cartCreate.userErrors[0].message);
    }

    const cart = response.data.data.cartCreate.cart;
    this.setCartId(cart.id);
    return cart;
  }

  /**
   * Adds items to the cart
   */
  async addToCart(
    items: Array<{ merchandiseId: string; quantity: number; attributes?: Array<{ key: string; value: string }> }>
  ): Promise<Cart> {
    if (!this.cartId) {
      return this.createCart(items);
    }

    const mutation = `
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      sku
                      price { amount currencyCode }
                      product { id title handle }
                      image { id url altText }
                    }
                  }
                }
              }
            }
            cost {
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        cartLinesAdd: {
          cart: Cart;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: { cartId: this.cartId, lines: items },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.cartLinesAdd.userErrors.length) {
      throw new Error(response.data.data.cartLinesAdd.userErrors[0].message);
    }

    return response.data.data.cartLinesAdd.cart;
  }

  /**
   * Updates cart line items
   */
  async updateCartLine(
    lines: Array<{ id: string; quantity: number; attributes?: Array<{ key: string; value: string }> }>
  ): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No active cart');
    }

    const mutation = `
      mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      sku
                      price { amount currencyCode }
                    }
                  }
                }
              }
            }
            cost {
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        cartLinesUpdate: {
          cart: Cart;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: {
          cartId: this.cartId,
          lines: lines.map((line) => ({
            id: line.id,
            quantity: line.quantity,
            attributes: line.attributes,
          })),
        },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.cartLinesUpdate.userErrors.length) {
      throw new Error(response.data.data.cartLinesUpdate.userErrors[0].message);
    }

    return response.data.data.cartLinesUpdate.cart;
  }

  /**
   * Removes items from cart
   */
  async removeFromCart(lineIds: string[]): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No active cart');
    }

    const mutation = `
      mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                }
              }
            }
            cost {
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        cartLinesRemove: {
          cart: Cart;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: { cartId: this.cartId, lineIds },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.cartLinesRemove.userErrors.length) {
      throw new Error(response.data.data.cartLinesRemove.userErrors[0].message);
    }

    const cart = response.data.data.cartLinesRemove.cart;

    // Clear cart ID if empty
    if (cart.totalQuantity === 0) {
      this.clearCartId();
    }

    return cart;
  }

  private setCartId(id: string): void {
    this.cartId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopify_cart_id', id);
    }
  }

  private clearCartId(): void {
    this.cartId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopify_cart_id');
    }
  }

  // ============ Customer Methods ============

  /**
   * Creates a new customer account
   */
  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    const mutation = `
      mutation CustomerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
            acceptsMarketing
            createdAt
            updatedAt
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        customerCreate: {
          customer: Customer;
          customerUserErrors: Array<{ field: string[]; message: string; code: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: { input },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.customerCreate.customerUserErrors.length) {
      throw new Error(response.data.data.customerCreate.customerUserErrors[0].message);
    }

    return response.data.data.customerCreate.customer;
  }

  /**
   * Authenticates a customer and returns access token
   */
  async authenticateCustomer(email: string, password: string): Promise<CustomerAccessToken> {
    const mutation = `
      mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: {
        customerAccessTokenCreate: {
          customerAccessToken: CustomerAccessToken;
          customerUserErrors: Array<{ field: string[]; message: string; code: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query: mutation,
        variables: { input: { email, password } },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    if (response.data.data.customerAccessTokenCreate.customerUserErrors.length) {
      throw new Error(response.data.data.customerAccessTokenCreate.customerUserErrors[0].message);
    }

    return response.data.data.customerAccessTokenCreate.customerAccessToken;
  }

  /**
   * Fetches customer details with order history
   */
  async getCustomer(accessToken: string): Promise<Customer> {
    const query = `
      query GetCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
          createdAt
          updatedAt
          defaultAddress {
            id
            address1
            address2
            city
            company
            country
            firstName
            lastName
            phone
            province
            zip
          }
          orders(first: 20, reverse: true) {
            edges {
              node {
                id
                name
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                totalPrice { amount currencyCode }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      originalTotalPrice { amount currencyCode }
                    }
                  }
                }
                statusUrl
              }
            }
          }
        }
      }
    `;

    const response = await this.client.post<{
      data: { customer: Customer };
      errors?: Array<{ message: string }>;
    }>('', {
      body: JSON.stringify({
        query,
        variables: { customerAccessToken: accessToken },
      }),
    });

    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.customer;
  }

  // ============ Admin API Methods (Server-side proxy) ============

  async getOrders(): Promise<Order[]> {
    // Server proxy endpoint: /api/admin/orders
    throw new Error('Use server proxy for admin operations');
  }

  async updateProductInventory(variantId: string, quantity: number): Promise<void> {
    // Server proxy endpoint: /api/admin/inventory
    throw new Error('Use server proxy for admin operations');
  }

  // ============ Webhook Handling ============

  verifyWebhookSignature(payload: string, signature: string): boolean {
    throw new Error('Server-side only');
  }

  async processWebhook<T>(topic: string, payload: T): Promise<void> {
    switch (topic) {
      case 'orders/create':
        // Handle order created
        break;
      case 'orders/paid':
        // Handle order paid
        break;
      case 'orders/fulfilled':
        // Handle order fulfilled
        break;
      case 'products/update':
        // Handle product update
        break;
      case 'customers/create':
        // Handle customer created
        break;
      default:
        console.warn(`Unhandled webhook topic: ${topic}`);
    }
  }
}

export const shopifyService = new ShopifyService();
```



---

## 5. Klaviyo Integration

### 5.1 Configuration

```typescript
// lib/api/services/klaviyo/config.ts

export interface KlaviyoConfig {
  publicApiKey: string;
  privateApiKey: string;
  apiVersion: string;
  baseUrl: string;
  companyId: string;
}

export const klaviyoConfig: KlaviyoConfig = {
  publicApiKey: import.meta.env.VITE_KLAVIYO_PUBLIC_API_KEY,
  privateApiKey: import.meta.env.KLAVIYO_PRIVATE_API_KEY,
  apiVersion: '2024-06-15',
  baseUrl: 'https://a.klaviyo.com',
  companyId: import.meta.env.VITE_KLAVIYO_COMPANY_ID,
};
```

### 5.2 Type Definitions

```typescript
// lib/api/services/klaviyo/types.ts

export interface KlaviyoProfile {
  id: string;
  type: 'profile';
  attributes: {
    email: string;
    phone_number?: string;
    external_id?: string;
    anonymous_id?: string;
    first_name?: string;
    last_name?: string;
    organization?: string;
    title?: string;
    image?: string;
    created: string;
    updated: string;
    last_event_date?: string;
    location?: {
      address1?: string;
      address2?: string;
      city?: string;
      country?: string;
      region?: string;
      zip?: string;
      timezone?: string;
      ip?: string;
    };
    properties: Record<string, unknown>;
  };
}

export interface ProfileCreateInput {
  email?: string;
  phone_number?: string;
  external_id?: string;
  anonymous_id?: string;
  first_name?: string;
  last_name?: string;
  organization?: string;
  title?: string;
  image?: string;
  location?: {
    address1?: string;
    address2?: string;
    city?: string;
    country?: string;
    region?: string;
    zip?: string;
    timezone?: string;
    ip?: string;
  };
  properties?: Record<string, unknown>;
}

export type KlaviyoEventName =
  | 'Viewed Product'
  | 'Added to Cart'
  | 'Started Checkout'
  | 'Placed Order'
  | 'Ordered Product'
  | 'Fulfilled Order'
  | 'Cancelled Order'
  | 'Refunded Order'
  | 'Active on Site'
  | 'Viewed Category'
  | 'Searched Site'
  | 'Subscribed to Back in Stock'
  | 'Consent Updated';

export interface ViewedProductProperties {
  ProductID: string;
  ProductName: string;
  SKU: string;
  Categories: string[];
  ImageURL: string;
  URL: string;
  Brand: string;
  Price: number;
  CompareAtPrice?: number;
  VariantID?: string;
  VariantTitle?: string;
  Color?: string;
  Size?: string;
}

export interface AddedToCartProperties {
  ProductID: string;
  ProductName: string;
  SKU: string;
  Categories: string[];
  ImageURL: string;
  URL: string;
  Brand: string;
  Price: number;
  Quantity: number;
  VariantID?: string;
  VariantTitle?: string;
  CartID?: string;
}

export interface PlacedOrderProperties {
  OrderID: string;
  OrderNumber: string;
  Categories: string[];
  ItemCount: number;
  Subtotal: number;
  Tax: number;
  Shipping: number;
  Total: number;
  Currency: string;
  DiscountCode?: string;
  DiscountValue: number;
  LineItems: Array<{
    ProductID: string;
    ProductName: string;
    SKU: string;
    Categories: string[];
    ImageURL: string;
    URL: string;
    Brand: string;
    Price: number;
    Quantity: number;
    RowTotal: number;
  }>;
}

export interface ConsentUpdateInput {
  email?: string;
  phone_number?: string;
  consents: {
    email?: {
      marketing?: {
        can_receive_marketing: boolean;
        consent: 'subscribed' | 'unsubscribed' | 'never_subscribed' | 'pending';
        consent_timestamp?: string;
        method?: 'TEXT' | 'WEB' | 'API' | 'UPLOAD' | 'INTEGRATION' | 'OTHER';
      };
    };
    sms?: {
      marketing?: {
        can_receive_marketing: boolean;
        consent: 'subscribed' | 'unsubscribed' | 'never_subscribed' | 'pending';
        consent_timestamp?: string;
        method?: 'TEXT' | 'WEB' | 'API' | 'UPLOAD' | 'INTEGRATION' | 'OTHER';
      };
    };
  };
}
```

### 5.3 Klaviyo Service Class

```typescript
// lib/api/services/klaviyo/index.ts

import { BaseHttpClient } from '../../base-client';
import { klaviyoConfig } from './config';
import type {
  KlaviyoProfile,
  ProfileCreateInput,
  KlaviyoEventName,
  ViewedProductProperties,
  AddedToCartProperties,
  PlacedOrderProperties,
  ConsentUpdateInput,
} from './types';

export class KlaviyoService {
  private client: BaseHttpClient;

  constructor() {
    this.client = new BaseHttpClient({
      baseURL: `${klaviyoConfig.baseUrl}/api`,
      headers: {
        Authorization: `Klaviyo-API-Key ${klaviyoConfig.privateApiKey}`,
        revision: klaviyoConfig.apiVersion,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Creates or updates a profile (upsert)
   */
  async upsertProfile(profile: ProfileCreateInput): Promise<KlaviyoProfile> {
    const response = await this.client.post<{
      data: KlaviyoProfile;
    }>('/profile-import/', {
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: profile,
        },
      }),
    });

    return response.data.data;
  }

  /**
   * Tracks a custom event
   */
  async trackEvent(
    eventName: KlaviyoEventName,
    profile: ProfileCreateInput,
    properties?: Record<string, unknown>,
    timestamp?: string,
    value?: number,
    valueCurrency?: string
  ): Promise<void> {
    const event = {
      data: {
        type: 'event',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: profile,
            },
          },
          metric: {
            data: {
              type: 'metric',
              attributes: { name: eventName },
            },
          },
          timestamp: timestamp || new Date().toISOString(),
          value,
          value_currency: valueCurrency,
          properties,
          unique_id: `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      },
    };

    await this.client.post('/events/', {
      body: JSON.stringify(event),
    });
  }

  /**
   * Tracks "Viewed Product" event
   */
  async trackViewedProduct(
    profile: ProfileCreateInput,
    product: ViewedProductProperties
  ): Promise<void> {
    await this.trackEvent('Viewed Product', profile, product);
  }

  /**
   * Tracks "Added to Cart" event
   */
  async trackAddedToCart(
    profile: ProfileCreateInput,
    item: AddedToCartProperties
  ): Promise<void> {
    await this.trackEvent('Added to Cart', profile, item, undefined, item.Price * item.Quantity);
  }

  /**
   * Tracks "Placed Order" event
   */
  async trackPlacedOrder(
    profile: ProfileCreateInput,
    order: PlacedOrderProperties
  ): Promise<void> {
    await this.trackEvent('Placed Order', profile, order, undefined, order.Total, order.Currency);

    // Track individual line items
    for (const item of order.LineItems) {
      await this.trackEvent('Ordered Product', profile, item, undefined, item.RowTotal, order.Currency);
    }
  }

  /**
   * Updates marketing consent
   */
  async updateConsent(input: ConsentUpdateInput): Promise<void> {
    await this.client.post('/profile-subscription-bulk-create-jobs/', {
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: input.email,
                    phone_number: input.phone_number,
                    subscriptions: input.consents,
                  },
                },
              ],
            },
          },
        },
      }),
    });
  }

  /**
   * Handles SMS opt-in
   */
  async handleSMSOptIn(
    phoneNumber: string,
    email?: string,
    source: string = 'website'
  ): Promise<void> {
    await this.updateConsent({
      email,
      phone_number: phoneNumber,
      consents: {
        sms: {
          marketing: {
            can_receive_marketing: true,
            consent: 'subscribed',
            consent_timestamp: new Date().toISOString(),
            method: 'WEB',
          },
        },
      },
    });
  }

  /**
   * Client-side identify (using Klaviyo.js)
   */
  identify(profile: ProfileCreateInput): void {
    if (typeof window !== 'undefined' && window.klaviyo) {
      window.klaviyo.identify({
        $email: profile.email,
        $first_name: profile.first_name,
        $last_name: profile.last_name,
        $phone_number: profile.phone_number,
        ...profile.properties,
      });
    }
  }

  /**
   * Client-side track event
   */
  track(eventName: string, properties?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.klaviyo) {
      window.klaviyo.track(eventName, properties);
    }
  }
}

declare global {
  interface Window {
    klaviyo?: {
      identify: (props: Record<string, unknown>) => void;
      track: (event: string, props?: Record<string, unknown>) => void;
      push: (args: unknown[]) => void;
    };
  }
}

export const klaviyoService = new KlaviyoService();
```

---

## 6. Judge.me Integration

### 6.1 Configuration

```typescript
// lib/api/services/judgeme/config.ts

export interface JudgeMeConfig {
  shopDomain: string;
  apiToken: string;
  apiKey: string;
  baseUrl: string;
}

export const judgemeConfig: JudgeMeConfig = {
  shopDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiToken: import.meta.env.VITE_JUDGEME_API_TOKEN,
  apiKey: import.meta.env.JUDGEME_API_KEY,
  baseUrl: 'https://judge.me/api/v1',
};
```

### 6.2 Type Definitions

```typescript
// lib/api/services/judgeme/types.ts

export interface JudgeMeReview {
  id: number;
  title: string;
  body: string;
  rating: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  reviewer: {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
    verified_buyer: boolean;
  };
  product_handle: string;
  product_id: number;
  product_title: string;
  product_image_url: string;
  pictures: Array<{
    id: number;
    urls: {
      original: string;
      large: string;
      small: string;
      thumbnail: string;
    };
  }>;
  videos: Array<{
    id: number;
    urls: {
      mp4: string;
      thumbnail: string;
    };
  }>;
  helpful_count: number;
  unhelpful_count: number;
  hidden: boolean;
  published: boolean;
  featured: boolean;
}

export interface ReviewStatistics {
  product_handle: string;
  product_id: number;
  average_rating: number;
  review_count: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommend_percentage: number;
}

export interface ReviewSubmissionInput {
  product_handle: string;
  product_id?: number;
  name: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  pictures?: File[];
  videos?: File[];
}

export interface UGCGalleryItem {
  id: number;
  type: 'picture' | 'video';
  url: string;
  thumbnail_url: string;
  review_id: number;
  product_handle: string;
  product_title: string;
  rating: number;
  reviewer_name: string;
  featured: boolean;
}
```

### 6.3 Judge.me Service Class

```typescript
// lib/api/services/judgeme/index.ts

import { BaseHttpClient } from '../../base-client';
import { judgemeConfig } from './config';
import type {
  JudgeMeReview,
  ReviewStatistics,
  ReviewSubmissionInput,
  UGCGalleryItem,
  PaginatedResponse,
} from './types';

export class JudgeMeService {
  private client: BaseHttpClient;

  constructor() {
    this.client = new BaseHttpClient({
      baseURL: judgemeConfig.baseUrl,
      headers: {
        Authorization: `Bearer ${judgemeConfig.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetches reviews for a product
   */
  async getProductReviews(
    productHandle: string,
    params: {
      page?: number;
      per_page?: number;
      sort_by?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
    } = {}
  ): Promise<PaginatedResponse<JudgeMeReview>> {
    const { page = 1, per_page = 10, sort_by = 'newest' } = params;

    const response = await this.client.get<{
      reviews: JudgeMeReview[];
      current_page: number;
      per_page: number;
      total: number;
    }>('/reviews', {
      params: {
        api_token: judgemeConfig.apiToken,
        shop_domain: judgemeConfig.shopDomain,
        product_handle: productHandle,
        page,
        per_page,
        sort_by,
      },
    });

    const { reviews, current_page, total } = response.data;
    const totalPages = Math.ceil(total / per_page);

    return {
      data: reviews,
      pagination: {
        currentPage: current_page,
        totalPages,
        totalCount: total,
        hasNextPage: current_page < totalPages,
        hasPreviousPage: current_page > 1,
        nextCursor: current_page < totalPages ? String(current_page + 1) : undefined,
        previousCursor: current_page > 1 ? String(current_page - 1) : undefined,
      },
    };
  }

  /**
   * Gets review statistics for a product
   */
  async getProductReviewStatistics(productHandle: string): Promise<ReviewStatistics> {
    const response = await this.client.get<{
      product: ReviewStatistics;
    }>('/products/review_counts', {
      params: {
        api_token: judgemeConfig.apiToken,
        shop_domain: judgemeConfig.shopDomain,
        handle: productHandle,
      },
    });

    return response.data.product;
  }

  /**
   * Gets bulk review statistics for multiple products
   */
  async getBulkReviewStatistics(productHandles: string[]): Promise<ReviewStatistics[]> {
    const response = await this.client.get<{
      products: ReviewStatistics[];
    }>('/products/review_counts', {
      params: {
        api_token: judgemeConfig.apiToken,
        shop_domain: judgemeConfig.shopDomain,
        handles: productHandles.join(','),
      },
    });

    return response.data.products;
  }

  /**
   * Submits a new review
   */
  async submitReview(input: ReviewSubmissionInput): Promise<{ review: JudgeMeReview; message: string }> {
    const formData = new FormData();
    formData.append('api_token', judgemeConfig.apiToken);
    formData.append('shop_domain', judgemeConfig.shopDomain);
    formData.append('product_handle', input.product_handle);
    formData.append('name', input.name);
    formData.append('email', input.email);
    formData.append('rating', String(input.rating));
    formData.append('title', input.title);
    formData.append('body', input.body);

    if (input.product_id) {
      formData.append('product_id', String(input.product_id));
    }

    if (input.pictures) {
      input.pictures.forEach((picture, index) => {
        formData.append(`pictures[${index}]`, picture);
      });
    }

    if (input.videos) {
      input.videos.forEach((video, index) => {
        formData.append(`videos[${index}]`, video);
      });
    }

    const response = await this.client.post<{
      review: JudgeMeReview;
      message: string;
    }>('/reviews', {
      body: formData,
    });

    return response.data;
  }

  /**
   * Marks a review as helpful
   */
  async markHelpful(reviewId: number): Promise<void> {
    await this.client.post(`/reviews/${reviewId}/helpful`, {
      body: JSON.stringify({
        api_token: judgemeConfig.apiToken,
        shop_domain: judgemeConfig.shopDomain,
      }),
    });
  }

  /**
   * Gets UGC gallery items
   */
  async getUGCGallery(params: {
    product_handle?: string;
    featured_only?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<UGCGalleryItem>> {
    const { product_handle, featured_only, page = 1, per_page = 20 } = params;

    const response = await this.client.get<{
      pictures: UGCGalleryItem[];
      current_page: number;
      per_page: number;
      total: number;
    }>('/pictures', {
      params: {
        api_token: judgemeConfig.apiToken,
        shop_domain: judgemeConfig.shopDomain,
        product_handle,
        featured_only,
        page,
        per_page,
      },
    });

    const { pictures, current_page, total } = response.data;
    const totalPages = Math.ceil(total / per_page);

    return {
      data: pictures,
      pagination: {
        currentPage: current_page,
        totalPages,
        totalCount: total,
        hasNextPage: current_page < totalPages,
        hasPreviousPage: current_page > 1,
        nextCursor: current_page < totalPages ? String(current_page + 1) : undefined,
        previousCursor: current_page > 1 ? String(current_page - 1) : undefined,
      },
    };
  }

  /**
   * Gets featured UGC for homepage/carousel
   */
  async getFeaturedUGC(limit: number = 10): Promise<UGCGalleryItem[]> {
    const result = await this.getUGCGallery({
      featured_only: true,
      per_page: limit,
    });
    return result.data;
  }
}

export const judgemeService = new JudgeMeService();
```

---

## 7. Smile.io Integration

### 7.1 Configuration

```typescript
// lib/api/services/smile/config.ts

export interface SmileConfig {
  apiKey: string;
  channelKey: string;
  baseUrl: string;
  shopDomain: string;
}

export const smileConfig: SmileConfig = {
  apiKey: import.meta.env.SMILE_API_KEY,
  channelKey: import.meta.env.VITE_SMILE_CHANNEL_KEY,
  baseUrl: 'https://api.smile.io/v1',
  shopDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
};
```

### 7.2 Type Definitions

```typescript
// lib/api/services/smile/types.ts

export interface SmileCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  points_balance: number;
  points_earned: number;
  points_spent: number;
  points_expiring_soon: number;
  state: 'not_member' | 'member' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateInput {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  external_id?: string;
}

export interface PointsActivity {
  id: string;
  customer_id: string;
  points_change: number;
  points_balance_after: number;
  description: string;
  created_at: string;
  source: {
    type: string;
    id: string;
    name: string;
  };
}

export interface SmileReward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: 'fixed_amount' | 'percentage' | 'free_product' | 'free_shipping';
  reward_value: number;
  min_cart_value?: number;
  max_cart_value?: number;
  variable_points?: boolean;
  min_points_cost?: number;
  max_points_cost?: number;
  active: boolean;
}

export interface RedeemedReward {
  id: string;
  customer_id: string;
  reward_id: string;
  reward_name: string;
  points_cost: number;
  discount_code: string;
  discount_url?: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface VIPTier {
  id: string;
  name: string;
  description?: string;
  points_threshold: number;
  perks: string[];
  active: boolean;
}

export interface CustomerTier {
  tier: VIPTier;
  points_to_next_tier: number;
  next_tier?: VIPTier;
  progress_percentage: number;
}
```

### 7.3 Smile Service Class

```typescript
// lib/api/services/smile/index.ts

import { BaseHttpClient } from '../../base-client';
import { smileConfig } from './config';
import type {
  SmileCustomer,
  CustomerCreateInput,
  PointsActivity,
  SmileReward,
  RedeemedReward,
  VIPTier,
  CustomerTier,
} from './types';

export class SmileService {
  private client: BaseHttpClient;

  constructor() {
    this.client = new BaseHttpClient({
      baseURL: smileConfig.baseUrl,
      headers: {
        Authorization: `Bearer ${smileConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Creates or retrieves a Smile customer
   */
  async getOrCreateCustomer(input: CustomerCreateInput): Promise<SmileCustomer> {
    try {
      const existing = await this.getCustomerByEmail(input.email);
      if (existing) return existing;
    } catch {
      // Customer doesn't exist, create new
    }

    const response = await this.client.post<{
      customer: SmileCustomer;
    }>('/customers', {
      body: JSON.stringify({
        customer: {
          ...input,
          channel_key: smileConfig.channelKey,
        },
      }),
    });

    return response.data.customer;
  }

  /**
   * Gets a customer by email
   */
  async getCustomerByEmail(email: string): Promise<SmileCustomer | null> {
    try {
      const response = await this.client.get<{
        customers: SmileCustomer[];
      }>('/customers', {
        params: { email },
      });
      return response.data.customers[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Gets customer's points balance
   */
  async getPointsBalance(customerId: string): Promise<number> {
    const customer = await this.getCustomer(customerId);
    return customer.points_balance;
  }

  private async getCustomer(customerId: string): Promise<SmileCustomer> {
    const response = await this.client.get<{
      customer: SmileCustomer;
    }>(`/customers/${customerId}`);
    return response.data.customer;
  }

  /**
   * Gets customer's points activity history
   */
  async getPointsActivity(
    customerId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PointsActivity[]> {
    const { page = 1, limit = 20 } = params;

    const response = await this.client.get<{
      points_transactions: PointsActivity[];
    }>(`/customers/${customerId}/points_transactions`, {
      params: { page, limit },
    });

    return response.data.points_transactions;
  }

  /**
   * Gets all available rewards
   */
  async getRewards(): Promise<SmileReward[]> {
    const response = await this.client.get<{
      rewards: SmileReward[];
    }>('/rewards', {
      params: { channel_key: smileConfig.channelKey },
    });

    return response.data.rewards.filter((r) => r.active);
  }

  /**
   * Gets rewards available for a customer
   */
  async getAvailableRewards(customerId: string): Promise<SmileReward[]> {
    const customer = await this.getCustomer(customerId);
    const allRewards = await this.getRewards();

    return allRewards.filter((reward) => {
      if (reward.variable_points) {
        return customer.points_balance >= (reward.min_points_cost || 0);
      }
      return customer.points_balance >= reward.points_cost;
    });
  }

  /**
   * Redeems points for a reward
   */
  async redeemReward(
    customerId: string,
    rewardId: string,
    pointsCost?: number
  ): Promise<RedeemedReward> {
    const response = await this.client.post<{
      points_purchase: RedeemedReward;
    }>('/points_purchases', {
      body: JSON.stringify({
        points_purchase: {
          customer_id: customerId,
          reward_id: rewardId,
          points_cost: pointsCost,
        },
      }),
    });

    return response.data.points_purchase;
  }

  /**
   * Gets all VIP tiers
   */
  async getVIPTiers(): Promise<VIPTier[]> {
    const response = await this.client.get<{
      vip_tiers: VIPTier[];
    }>('/vip_tiers', {
      params: { channel_key: smileConfig.channelKey },
    });

    return response.data.vip_tiers.filter((tier) => tier.active);
  }

  /**
   * Gets customer's VIP tier status
   */
  async getCustomerTier(customerId: string): Promise<CustomerTier | null> {
    try {
      const response = await this.client.get<{
        vip_tier_membership: CustomerTier;
      }>(`/customers/${customerId}/vip_tier_membership`);
      return response.data.vip_tier_membership;
    } catch {
      return null;
    }
  }

  /**
   * Records a purchase for points earning
   */
  async recordPurchase(
    customerId: string,
    orderId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    await this.client.post('/activities', {
      body: JSON.stringify({
        activity: {
          customer_id: customerId,
          activity_type: 'purchase',
          order_id: orderId,
          amount,
          currency,
        },
      }),
    });
  }

  /**
   * Records account creation
   */
  async recordAccountCreation(customerId: string): Promise<void> {
    await this.client.post('/activities', {
      body: JSON.stringify({
        activity: {
          customer_id: customerId,
          activity_type: 'account_creation',
        },
      }),
    });
  }

  /**
   * Records a review submission
   */
  async recordReview(customerId: string, reviewId: string): Promise<void> {
    await this.client.post('/activities', {
      body: JSON.stringify({
        activity: {
          customer_id: customerId,
          activity_type: 'review',
          external_id: reviewId,
        },
      }),
    });
  }

  // ============ Client-side SDK Methods ============

  initSmileUI(): void {
    if (typeof window !== 'undefined' && window.Smile) {
      window.Smile.init({
        channel_key: smileConfig.channelKey,
        domain: smileConfig.shopDomain,
      });
    }
  }

  openPanel(): void {
    if (typeof window !== 'undefined' && window.Smile) {
      window.Smile.ui.open();
    }
  }
}

declare global {
  interface Window {
    Smile?: {
      init: (config: { channel_key: string; domain: string }) => void;
      ui: {
        open: () => void;
        close: () => void;
      };
      setCustomer: (customer: { email: string; first_name?: string; last_name?: string }) => void;
      clearCustomer: () => void;
    };
  }
}

export const smileService = new SmileService();
```



---

## 8. Anthropic API Integration

### 8.1 Configuration

```typescript
// lib/api/services/anthropic/config.ts

export interface AnthropicConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
}

export const anthropicConfig: AnthropicConfig = {
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
  baseUrl: 'https://api.anthropic.com/v1',
  defaultModel: 'claude-3-5-sonnet-20241022',
  defaultMaxTokens: 4096,
  defaultTemperature: 0.7,
};
```

### 8.2 Type Definitions

```typescript
// lib/api/services/anthropic/types.ts

export type AnthropicRole = 'user' | 'assistant';

export interface AnthropicMessage {
  role: AnthropicRole;
  content: string | AnthropicContentBlock[];
}

export type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string };

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  system?: string;
  stop_sequences?: string[];
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
  stop_sequence: string | null;
  usage: TokenUsage;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface ProductDescriptionInput {
  productName: string;
  brand: string;
  category: string;
  ageRange?: string;
  materials?: string[];
  features?: string[];
  styleNotes?: string;
  targetAudience: 'parents' | 'gift_givers' | 'both';
  tone: 'professional' | 'playful' | 'luxury' | 'casual';
  maxLength?: number;
}

export interface ParsedProductDescription {
  shortDescription: string;
  fullDescription: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

export interface SizeRecommendationInput {
  measurements: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
  age: number;
  brand: string;
  productType: string;
  fitPreference: 'tight' | 'regular' | 'loose';
}

export interface ParsedSizeRecommendation {
  recommendedSize: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  alternatives: string[];
  fitNotes: string;
}
```

### 8.3 Anthropic Service Class

```typescript
// lib/api/services/anthropic/index.ts

import { BaseHttpClient } from '../../base-client';
import { anthropicConfig } from './config';
import type {
  AnthropicRequest,
  AnthropicResponse,
  AnthropicMessage,
  TokenUsage,
  ProductDescriptionInput,
  SizeRecommendationInput,
  ParsedProductDescription,
  ParsedSizeRecommendation,
} from './types';

export class AnthropicService {
  private client: BaseHttpClient;
  private tokenUsage: TokenUsage;

  constructor() {
    this.client = new BaseHttpClient({
      baseURL: anthropicConfig.baseUrl,
      headers: {
        'x-api-key': anthropicConfig.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    });
    this.tokenUsage = { input_tokens: 0, output_tokens: 0 };
  }

  /**
   * Sends a message to Claude and returns the response
   */
  async sendMessage(
    messages: AnthropicMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): Promise<AnthropicResponse> {
    const {
      model = anthropicConfig.defaultModel,
      maxTokens = anthropicConfig.defaultMaxTokens,
      temperature = anthropicConfig.defaultTemperature,
      system,
    } = options;

    const request: AnthropicRequest = {
      model,
      max_tokens: maxTokens,
      messages,
      temperature,
      system,
    };

    const response = await this.client.post<AnthropicResponse>('/messages', {
      body: JSON.stringify(request),
    });

    this.tokenUsage.input_tokens += response.data.usage.input_tokens;
    this.tokenUsage.output_tokens += response.data.usage.output_tokens;

    return response.data;
  }

  /**
   * Streams a message response
   */
  async *streamMessage(
    messages: AnthropicMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      model = anthropicConfig.defaultModel,
      maxTokens = anthropicConfig.defaultMaxTokens,
      temperature = anthropicConfig.defaultTemperature,
      system,
    } = options;

    const request: AnthropicRequest = {
      model,
      max_tokens: maxTokens,
      messages,
      temperature,
      system,
      stream: true,
    };

    const response = await fetch(`${anthropicConfig.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': anthropicConfig.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield parsed.delta.text;
              }
              if (parsed.usage) {
                this.tokenUsage.input_tokens += parsed.usage.input_tokens;
                this.tokenUsage.output_tokens += parsed.usage.output_tokens;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Gets current token usage
   */
  getTokenUsage(): TokenUsage {
    return { ...this.tokenUsage };
  }

  /**
   * Resets token usage counter
   */
  resetTokenUsage(): void {
    this.tokenUsage = { input_tokens: 0, output_tokens: 0 };
  }

  /**
   * Generates a product description
   */
  async generateProductDescription(
    input: ProductDescriptionInput
  ): Promise<ParsedProductDescription> {
    const systemPrompt = `You are a professional e-commerce copywriter specializing in premium children's clothing. 
Create compelling, SEO-optimized product descriptions.

Respond in JSON format with:
- shortDescription (1-2 sentences)
- fullDescription (2-3 paragraphs)
- bulletPoints (array of 4-6 features)
- seoTitle (under 60 chars)
- seoDescription (under 160 chars)
- keywords (array of 8-10 relevant keywords)`;

    const userMessage = {
      role: 'user' as const,
      content: `Product: ${input.productName}
Brand: ${input.brand}
Category: ${input.category}
Age Range: ${input.ageRange || 'Not specified'}
Materials: ${input.materials?.join(', ') || 'Not specified'}
Features: ${input.features?.join(', ') || 'Not specified'}
Style Notes: ${input.styleNotes || 'Not specified'}
Tone: ${input.tone}
Target: ${input.targetAudience}`,
    };

    const response = await this.sendMessage([userMessage], {
      system: systemPrompt,
      temperature: 0.7,
    });

    const content = this.extractTextContent(response);
    return this.parseJsonResponse<ParsedProductDescription>(content);
  }

  /**
   * Generates size recommendations
   */
  async recommendSize(input: SizeRecommendationInput): Promise<ParsedSizeRecommendation> {
    const systemPrompt = `You are a sizing expert for children's clothing. 
Provide accurate size recommendations.

Respond in JSON format with:
- recommendedSize: the recommended size
- confidence: "high", "medium", or "low"
- reasoning: explanation
- alternatives: array of alternative sizes
- fitNotes: specific fit guidance`;

    const userMessage = {
      role: 'user' as const,
      content: `Age: ${input.age}
Brand: ${input.brand}
Product Type: ${input.productType}
Fit Preference: ${input.fitPreference}
Measurements: ${JSON.stringify(input.measurements)}`,
    };

    const response = await this.sendMessage([userMessage], {
      system: systemPrompt,
      temperature: 0.3,
    });

    const content = this.extractTextContent(response);
    return this.parseJsonResponse<ParsedSizeRecommendation>(content);
  }

  private extractTextContent(response: AnthropicResponse): string {
    const textBlocks = response.content.filter(
      (block): block is { type: 'text'; text: string } => block.type === 'text'
    );
    return textBlocks.map((block) => block.text).join('');
  }

  private parseJsonResponse<T>(content: string): T {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const anthropicService = new AnthropicService();
```

---

## 9. GA4 Analytics Integration

### 9.1 Configuration

```typescript
// lib/api/services/analytics/config.ts

export interface GA4Config {
  measurementId: string;
  apiSecret?: string;
  debugMode: boolean;
  sendPageView: boolean;
  allowAdFeatures: boolean;
  allowAdPersonalizationSignals: boolean;
  cookieDomain: string;
  cookieExpires: number;
}

export const ga4Config: GA4Config = {
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
  apiSecret: import.meta.env.GA4_API_SECRET,
  debugMode: import.meta.env.DEV === true,
  sendPageView: true,
  allowAdFeatures: false,
  allowAdPersonalizationSignals: false,
  cookieDomain: 'auto',
  cookieExpires: 63072000, // 2 years
};
```

### 9.2 Type Definitions

```typescript
// lib/api/services/analytics/types.ts

export type GA4EventName =
  // E-commerce Events
  | 'add_payment_info'
  | 'add_shipping_info'
  | 'add_to_cart'
  | 'add_to_wishlist'
  | 'begin_checkout'
  | 'purchase'
  | 'refund'
  | 'remove_from_cart'
  | 'select_item'
  | 'select_promotion'
  | 'view_cart'
  | 'view_item'
  | 'view_item_list'
  | 'view_promotion'
  // Custom Events
  | 'search'
  | 'sign_up'
  | 'login'
  | 'share'
  | 'generate_lead'
  | 'custom_event';

export interface GA4Item {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

export interface GA4EcommerceEvent {
  currency?: string;
  value?: number;
  items: GA4Item[];
  transaction_id?: string;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
  payment_type?: string;
  shipping_tier?: string;
}

export interface GA4UserProperties {
  customer_id?: string;
  customer_tier?: string;
  loyalty_points_balance?: number;
  account_created_date?: string;
  lifetime_value?: number;
  preferred_category?: string;
}
```

### 9.3 Analytics Service Class

```typescript
// lib/api/services/analytics/index.ts

import { ga4Config } from './config';
import type { GA4EventName, GA4Item, GA4EcommerceEvent, GA4UserProperties } from './types';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'consent',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export class AnalyticsService {
  private isInitialized = false;

  /**
   * Initializes GA4
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Config.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date().toISOString());
    window.gtag('config', ga4Config.measurementId, {
      send_page_view: ga4Config.sendPageView,
      allow_google_signals: ga4Config.allowAdFeatures,
      allow_ad_personalization_signals: ga4Config.allowAdPersonalizationSignals,
      cookie_domain: ga4Config.cookieDomain,
      cookie_expires: ga4Config.cookieExpires,
      debug_mode: ga4Config.debugMode,
    });

    this.isInitialized = true;
  }

  /**
   * Tracks a page view
   */
  pageView(path: string, title?: string): void {
    if (!this.isInitialized) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }

  /**
   * Tracks a custom event
   */
  event(eventName: GA4EventName | string, params?: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, params);
  }

  /**
   * Tracks product view
   */
  viewItem(item: GA4Item, currency: string = 'USD'): void {
    this.event('view_item', {
      currency,
      value: item.price,
      items: [item],
    });
  }

  /**
   * Tracks product list view
   */
  viewItemList(items: GA4Item[], listName: string, currency: string = 'USD'): void {
    this.event('view_item_list', {
      item_list_name: listName,
      items: items.map((item, index) => ({ ...item, index })),
    });
  }

  /**
   * Tracks add to cart
   */
  addToCart(item: GA4Item, quantity: number, currency: string = 'USD'): void {
    this.event('add_to_cart', {
      currency,
      value: (item.price || 0) * quantity,
      items: [{ ...item, quantity }],
    });
  }

  /**
   * Tracks remove from cart
   */
  removeFromCart(item: GA4Item, quantity: number, currency: string = 'USD'): void {
    this.event('remove_from_cart', {
      currency,
      value: (item.price || 0) * quantity,
      items: [{ ...item, quantity }],
    });
  }

  /**
   * Tracks begin checkout
   */
  beginCheckout(params: GA4EcommerceEvent): void {
    this.event('begin_checkout', params);
  }

  /**
   * Tracks purchase
   */
  purchase(params: GA4EcommerceEvent): void {
    this.event('purchase', params);
  }

  /**
   * Sets user properties
   */
  setUserProperties(properties: GA4UserProperties): void {
    if (!this.isInitialized) return;

    window.gtag('set', 'user_properties', properties);
  }

  /**
   * Sets user ID
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', ga4Config.measurementId, {
      user_id: userId,
    });
  }

  /**
   * Tracks search
   */
  search(searchTerm: string, resultsCount?: number): void {
    this.event('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  /**
   * Tracks sign up
   */
  signUp(method: string): void {
    this.event('sign_up', {
      method,
    });
  }

  /**
   * Tracks login
   */
  login(method: string): void {
    this.event('login', {
      method,
    });
  }
}

export const analyticsService = new AnalyticsService();
```

---

## 10. Error Handling & Resilience

### 10.1 Circuit Breaker Pattern

```typescript
// lib/api/resilience/circuit-breaker.ts

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number;      // Failures before opening
  resetTimeoutMs: number;        // Time before half-open
  halfOpenMaxCalls: number;      // Test calls in half-open state
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private nextAttempt = Date.now();
  private halfOpenCalls = 0;

  constructor(private options: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
    halfOpenMaxCalls: 3,
  }) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
      this.halfOpenCalls = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.resetTimeoutMs;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 10.2 Retry Logic with Exponential Backoff

```typescript
// lib/api/resilience/retry.ts

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'],
  }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const shouldRetry = isRetryableError(error, options);
      if (!shouldRetry || attempt === options.maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1),
        options.maxDelayMs
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown, options: RetryOptions): boolean {
  if (error && typeof error === 'object') {
    const status = (error as { status?: number }).status;
    const code = (error as { code?: string }).code;

    if (status && options.retryableStatuses.includes(status)) {
      return true;
    }
    if (code && options.retryableErrors.includes(code)) {
      return true;
    }
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 10.3 Rate Limiter

```typescript
// lib/api/resilience/rate-limiter.ts

export interface RateLimiterOptions {
  requestsPerSecond: number;
  burstSize?: number;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.burstSize || options.requestsPerSecond;
    this.tokens = this.maxTokens;
    this.refillRate = options.requestsPerSecond;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens--;
      return;
    }

    const waitTime = Math.ceil((1 - this.tokens) * (1000 / this.refillRate));
    await sleep(waitTime);
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 11. Rate Limiting

### 11.1 Service Rate Limits

| Service | Rate Limit | Burst | Notes |
|---------|------------|-------|-------|
| **Shopify Storefront** | 40 req/s | 40 | Per app, per store |
| **Shopify Admin** | 40 req/s | 40 | Per app, per store |
| **Klaviyo** | 75 req/s | 75 | Private API |
| **Judge.me** | 100 req/min | 100 | Per shop |
| **Smile.io** | 60 req/min | 60 | Per shop |
| **Anthropic** | 4000 RPM | - | Organization limit |
| **GA4** | N/A | - | Client-side only |

### 11.2 Rate Limiter Configuration

```typescript
// lib/api/rate-limits.ts

import { RateLimiter } from './resilience/rate-limiter';

export const rateLimiters = {
  shopify: new RateLimiter({ requestsPerSecond: 35, burstSize: 40 }),
  klaviyo: new RateLimiter({ requestsPerSecond: 70, burstSize: 75 }),
  judgeme: new RateLimiter({ requestsPerSecond: 1.5, burstSize: 5 }),
  smile: new RateLimiter({ requestsPerSecond: 1, burstSize: 3 }),
  anthropic: new RateLimiter({ requestsPerSecond: 60, burstSize: 100 }),
};
```

---

## 12. Configuration & Environment

### 12.1 Environment Variables

```typescript
// lib/api/env.ts

export interface APIEnvironment {
  // Shopify
  VITE_SHOPIFY_STORE_DOMAIN: string;
  VITE_SHOPIFY_STOREFRONT_TOKEN: string;
  SHOPIFY_ADMIN_TOKEN: string;
  SHOPIFY_WEBHOOK_SECRET: string;

  // Klaviyo
  VITE_KLAVIYO_PUBLIC_API_KEY: string;
  KLAVIYO_PRIVATE_API_KEY: string;
  VITE_KLAVIYO_COMPANY_ID: string;

  // Judge.me
  VITE_JUDGEME_API_TOKEN: string;
  JUDGEME_API_KEY: string;

  // Smile.io
  VITE_SMILE_CHANNEL_KEY: string;
  SMILE_API_KEY: string;

  // Anthropic
  ANTHROPIC_API_KEY: string;

  // GA4
  VITE_GA4_MEASUREMENT_ID: string;
  GA4_API_SECRET: string;
}

// Type-safe environment access
export function getEnv<K extends keyof APIEnvironment>(key: K): APIEnvironment[K] {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value as APIEnvironment[K];
}
```

### 12.2 Environment Files

```bash
# .env.example

# Shopify
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
SHOPIFY_ADMIN_TOKEN=your_admin_token
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Klaviyo
VITE_KLAVIYO_PUBLIC_API_KEY=your_public_key
KLAVIYO_PRIVATE_API_KEY=your_private_key
VITE_KLAVIYO_COMPANY_ID=your_company_id

# Judge.me
VITE_JUDGEME_API_TOKEN=your_api_token
JUDGEME_API_KEY=your_api_key

# Smile.io
VITE_SMILE_CHANNEL_KEY=your_channel_key
SMILE_API_KEY=your_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# GA4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_api_secret
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

```typescript
// __tests__/services/shopify.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShopifyService } from '@/lib/api/services/shopify';

describe('ShopifyService', () => {
  let service: ShopifyService;

  beforeEach(() => {
    service = new ShopifyService();
  });

  it('should fetch a product by handle', async () => {
    const mockProduct = {
      id: 'gid://shopify/Product/123',
      handle: 'test-product',
      title: 'Test Product',
    };

    // Mock the API call
    vi.spyOn(service['client'], 'post').mockResolvedValue({
      data: { data: { product: mockProduct } },
    } as never);

    const product = await service.getProduct('test-product');
    expect(product.handle).toBe('test-product');
  });

  it('should create a cart', async () => {
    const mockCart = {
      id: 'gid://shopify/Cart/abc123',
      checkoutUrl: 'https://checkout.example.com',
      totalQuantity: 0,
    };

    vi.spyOn(service['client'], 'post').mockResolvedValue({
      data: {
        data: {
          cartCreate: { cart: mockCart, userErrors: [] },
        },
      },
    } as never);

    const cart = await service.createCart();
    expect(cart.id).toBe('gid://shopify/Cart/abc123');
  });
});
```

### 13.2 Integration Tests

```typescript
// __tests__/integration/api-flows.test.ts

import { describe, it, expect } from 'vitest';
import { ServiceFactory } from '@/lib/api/service-factory';

describe('API Integration Flows', () => {
  it('should complete a full customer journey', async () => {
    const shopify = ServiceFactory.getShopify();
    const klaviyo = ServiceFactory.getKlaviyo();
    const analytics = ServiceFactory.getAnalytics();

    // 1. Product view
    const product = await shopify.getProduct('sample-product');
    expect(product).toBeDefined();

    // 2. Track view in analytics
    analytics.viewItem({
      item_id: product.id,
      item_name: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
    });

    // 3. Add to cart
    const cart = await shopify.addToCart([
      {
        merchandiseId: product.variants[0].id,
        quantity: 1,
      },
    ]);
    expect(cart.totalQuantity).toBe(1);

    // 4. Track add to cart
    analytics.addToCart(
      {
        item_id: product.id,
        item_name: product.title,
        price: parseFloat(product.priceRange.minVariantPrice.amount),
      },
      1
    );
  });
});
```

### 13.3 Mock Providers

```typescript
// lib/api/testing/mocks.ts

export const mockShopifyProduct = {
  id: 'gid://shopify/Product/123456',
  handle: 'boys-cotton-t-shirt',
  title: "Boy's Cotton T-Shirt",
  description: 'A comfortable cotton t-shirt for boys',
  descriptionHtml: '<p>A comfortable cotton t-shirt for boys</p>',
  productType: 'T-Shirts',
  tags: ['cotton', 'casual', 'boys'],
  vendor: 'ParkerJoe',
  options: [
    { id: 'gid://shopify/ProductOption/1', name: 'Size', values: ['2T', '3T', '4T'] },
    { id: 'gid://shopify/ProductOption/2', name: 'Color', values: ['Blue', 'Red'] },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/1',
      title: '2T / Blue',
      sku: 'BJ-TSH-2T-BLU',
      price: { amount: '24.99', currencyCode: 'USD' },
      inventoryQuantity: 50,
      availableForSale: true,
    },
  ],
  images: [],
  priceRange: {
    minVariantPrice: { amount: '24.99', currencyCode: 'USD' },
    maxVariantPrice: { amount: '29.99', currencyCode: 'USD' },
  },
  availableForSale: true,
  seo: { title: "Boy's Cotton T-Shirt | ParkerJoe", description: 'Comfortable cotton t-shirt' },
};

export const mockKlaviyoProfile = {
  id: '01ABC123DEF',
  type: 'profile' as const,
  attributes: {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    properties: {},
  },
};
```

---

## Appendix A: Directory Structure

```
lib/
├── api/
│   ├── base-client.ts
│   ├── service-factory.ts
│   ├── env.ts
│   ├── types/
│   │   ├── common.ts
│   │   └── errors.ts
│   ├── services/
│   │   ├── shopify/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   ├── types.ts
│   │   │   └── queries.ts
│   │   ├── klaviyo/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── types.ts
│   │   ├── judgeme/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── types.ts
│   │   ├── smile/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── types.ts
│   │   ├── anthropic/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── types.ts
│   │   └── analytics/
│   │       ├── index.ts
│   │       ├── config.ts
│   │       └── types.ts
│   ├── resilience/
│   │   ├── circuit-breaker.ts
│   │   ├── retry.ts
│   │   └── rate-limiter.ts
│   ├── rate-limits.ts
│   └── testing/
│       └── mocks.ts
```

## Appendix B: Quick Reference

### Service Usage Examples

```typescript
// Product catalog
const product = await shopifyService.getProduct('product-handle');
const products = await shopifyService.getNewArrivals(8);

// Cart operations
const cart = await shopifyService.addToCart([{ merchandiseId: variantId, quantity: 1 }]);

// Marketing
await klaviyoService.trackViewedProduct(profile, productProps);
await klaviyoService.trackPlacedOrder(profile, orderProps);

// Reviews
const reviews = await judgemeService.getProductReviews('product-handle');
const stats = await judgemeService.getProductReviewStatistics('product-handle');

// Loyalty
const customer = await smileService.getOrCreateCustomer({ email: 'user@example.com' });
const rewards = await smileService.getAvailableRewards(customer.id);

// AI
const description = await anthropicService.generateProductDescription(input);

// Analytics
analyticsService.viewItem(item);
analyticsService.purchase(purchaseData);
```

---

*End of Technical PRD*
