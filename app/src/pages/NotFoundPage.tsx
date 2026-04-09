import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      '.not-found-content',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="not-found-content text-center px-6 max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <span className="font-display text-8xl lg:text-9xl font-bold text-pj-gold/20">
            404
          </span>
        </div>

        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-pj-navy mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-pj-gray mb-8">
          Oops! The page you're looking for seems to have wandered off. 
          Let's help you find your way back to something wonderful.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:border-pj-gold hover:bg-pj-gold/5 transition-colors group"
          >
            <Home className="w-8 h-8 text-pj-gold" />
            <span className="font-medium text-pj-navy group-hover:text-pj-gold">Go Home</span>
          </button>
          
          <button
            onClick={() => navigate('/shop')}
            className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:border-pj-gold hover:bg-pj-gold/5 transition-colors group"
          >
            <ShoppingBag className="w-8 h-8 text-pj-gold" />
            <span className="font-medium text-pj-navy group-hover:text-pj-gold">Browse Shop</span>
          </button>
          
          <button
            onClick={() => navigate('/collections/apparel')}
            className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:border-pj-gold hover:bg-pj-gold/5 transition-colors group"
          >
            <Search className="w-8 h-8 text-pj-gold" />
            <span className="font-medium text-pj-navy group-hover:text-pj-gold">Explore Apparel</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto">
          <p className="text-sm text-pj-gray mb-3">Looking for something specific?</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pj-gold"
            />
            <button className="px-6 py-3 bg-pj-gold text-white font-medium rounded-lg hover:bg-pj-gold/90 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-12 text-sm text-pj-gray">
          Need assistance?{' '}
          <button 
            onClick={() => navigate('/')} 
            className="text-pj-blue hover:underline"
          >
            Chat with PJ Stylist
          </button>{' '}
          or{' '}
          <a href="mailto:hello@parkerjoe.com" className="text-pj-blue hover:underline">
            contact us
          </a>
        </p>
      </div>
    </div>
  );
}
