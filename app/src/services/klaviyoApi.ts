const KLAVIYO_PUBLIC_API_KEY = import.meta.env.VITE_KLAVIYO_PUBLIC_API_KEY;

export const klaviyoApi = {
  async trackEvent(event: string, customerProperties: any, eventProperties?: any) {
    const payload = {
      token: KLAVIYO_PUBLIC_API_KEY,
      event,
      customer_properties: customerProperties,
      properties: eventProperties,
      time: new Date().toISOString()
    };

    try {
      await fetch('https://a.klaviyo.com/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      // Silently fail - analytics should not break user experience
    }
  },

  trackViewedProduct(product: any, customerEmail?: string) {
    return this.trackEvent('Viewed Product', { $email: customerEmail }, {
      ProductName: product.title,
      ProductID: product.id,
      Price: product.priceRange?.minVariantPrice?.amount
    });
  },

  trackAddedToCart(product: any, variant: any, quantity: number, customerEmail?: string) {
    return this.trackEvent('Added to Cart', { $email: customerEmail }, {
      ProductName: product.title,
      Quantity: quantity,
      Price: variant.price?.amount
    });
  }
};

export default klaviyoApi;
