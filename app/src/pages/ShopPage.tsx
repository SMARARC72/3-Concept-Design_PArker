import { useEffect } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Apparel', handle: 'apparel', image: '/category-apparel.jpg', description: 'Everyday essentials and stylish pieces' },
  { name: 'Shoes', handle: 'shoes', image: '/category-shoes.jpg', description: 'Comfortable footwear for every occasion' },
  { name: 'Accessories', handle: 'accessories', image: '/category-accessories.jpg', description: 'Bows, ties, socks and more' },
  { name: 'Dresswear', handle: 'dresswear', image: '/category-dresswear.jpg', description: 'Special occasion outfits' },
  { name: 'Western', handle: 'western', image: '/category-western.jpg', description: 'Rodeo-ready styles' },
  { name: 'Toys & Books', handle: 'toys-books', image: '/category-gifts.jpg', description: 'Fun and educational gifts' },
];

export default function ShopPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      '.shop-hero-content',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.category-card',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
  }, []);

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative bg-pj-navy py-20 lg:py-32">
        <div className="w-full px-6 lg:px-12 shop-hero-content">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl lg:text-6xl font-semibold text-white mb-6">
              Shop All Collections
            </h1>
            <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
              Discover premium boys' clothing from newborn to size 16. 
              Quality brands, timeless styles, and perfect fits for every occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 lg:py-24">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.handle}
                className="category-card group cursor-pointer"
                onClick={() => navigate(`/collections/${category.handle}`)}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-pj-navy mb-2 group-hover:text-pj-blue transition-colors">
                  {category.name}
                </h3>
                <p className="text-pj-gray">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-pj-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pj-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-pj-navy mb-2">Premium Quality</h3>
              <p className="text-pj-gray">Carefully curated brands known for durability and comfort</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-pj-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pj-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-pj-navy mb-2">Fast Shipping</h3>
              <p className="text-pj-gray">Free shipping on orders over $100</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-pj-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pj-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-pj-navy mb-2">Personal Service</h3>
              <p className="text-pj-gray">Chat with PJ Stylist for personalized recommendations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
