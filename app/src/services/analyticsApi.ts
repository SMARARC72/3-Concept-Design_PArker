const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const analyticsApi = {
  init() {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  },

  trackPageView(page: string) {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'page_view', { page_path: page });
  },

  trackEvent(eventName: string, parameters?: any) {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', eventName, parameters);
  }
};

export default analyticsApi;
