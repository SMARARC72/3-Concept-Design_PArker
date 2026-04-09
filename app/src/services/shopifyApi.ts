import type { ShopifyProduct, ShopifyCart, ProductFilters } from '../types/shopify';

const STOREFRONT_API_URL = `https://${import.meta.env.VITE_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const shopifyApi = {
  async getProduct(handle: string): Promise<ShopifyProduct | null> {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          description
          vendor
          productType
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 10) {
            edges { node { url altText width height } }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
    `;
    
    try {
      const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({ query, variables: { handle } })
      });
      
      const data = await response.json();
      return data.data?.product || null;
    } catch (error) {
      return null;
    }
  },

  async getProducts(filters: ProductFilters = {}, first: number = 20) {
    const queryParts: string[] = [];
    if (filters.query) queryParts.push(filters.query);
    if (filters.category) queryParts.push(`product_type:${filters.category}`);
    if (filters.brand?.length) queryParts.push(`vendor:${filters.brand.join(' OR vendor:')}`);
    
    const searchQuery = queryParts.join(' AND ');
    
    const query = `
      query GetProducts($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges { node { id handle title vendor priceRange { minVariantPrice { amount } } images(first: 1) { edges { node { url } } } } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    
    try {
      const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({ query, variables: { first, query: searchQuery } })
      });
      
      const data = await response.json();
      return {
        products: data.data?.products?.edges.map((e: any) => e.node) || [],
        hasNextPage: data.data?.products?.pageInfo?.hasNextPage || false
      };
    } catch (error) {
      return { products: [], hasNextPage: false };
    }
  },

  async createCart(): Promise<ShopifyCart | null> {
    const query = `
      mutation CreateCart {
        cartCreate {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      product { title handle }
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
        }
      }
    `;
    
    try {
      const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      return data.data?.cartCreate?.cart || null;
    } catch (error) {
      return null;
    }
  }
};

export default shopifyApi;
