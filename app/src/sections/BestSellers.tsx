import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

gsap.registerPlugin(ScrollTrigger);

const bestSellers = [
  {
    id: 'b1',
    name: 'Navy Polo Shirt',
    brand: 'ParkerJoe',
    price: 45,
    rating: 4.9,
    reviews: 128,
    image: '/product-1.jpg',
    badge: 'Best Seller',
  },
  {
    id: 'b2',
    name: 'Classic Chino Shorts',
    brand: 'Saltwater Boys',
    price: 38,
    rating: 4.8,
    reviews: 96,
    image: '/product-2.jpg',
    badge: null,
  },
  {
    id: 'b3',
    name: 'Oxford Dress Shirt',
    brand: 'Properly Tied',
    price: 52,
    rating: 4.7,
    reviews: 84,
    image: '/product-3.jpg',
    badge: 'Top Rated',
  },
  {
    id: 'b4',
    name: 'Western Outfit Set',
    brand: 'Fieldstone',
    price: 128,
    rating: 5.0,
    reviews: 42,
    image: '/category-western.jpg',
    badge: 'New',
  },
  {
    id: 'b5',
    name: 'Leather Dress Shoes',
    brand: 'NOLA Tawk',
    price: 78,
    rating: 4.6,
    reviews: 67,
    image: '/category-shoes.jpg',
    badge: null,
  },
  {
    id: 'b6',
    name: 'Formal Suit Set',
    brand: 'ParkerJoe',
    price: 198,
    rating: 4.9,
    reviews: 35,
    image: '/category-dresswear.jpg',
    badge: 'Premium',
  },
];

export default function BestSellers() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        heading,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation with stagger
      const cards = grid.querySelectorAll('.product-card');
      cards.forEach((card, index) => {
        const speed = index % 3 === 1 ? -100 : index % 3 === 2 ? 50 : 0;
        
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Parallax effect for middle column
        if (speed !== 0) {
          gsap.to(card, {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: grid,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleQuickAdd = (product: typeof bestSellers[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      size: '5T',
      color: 'Navy',
      image: product.image,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <div ref={headingRef} className="text-center mb-12 lg:mb-16">
          <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
            Customer Favorites
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy">
            Best Sellers
          </h2>
        </div>

        {/* Masonry Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {bestSellers.map((product, index) => (
            <div
              key={product.id}
              className={`product-card group ${
                index === 0 || index === 3 ? 'md:mt-0' : ''
              } ${index === 1 || index === 4 ? 'md:mt-12' : ''} ${
                index === 2 || index === 5 ? 'md:mt-6' : ''
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-md mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Badge */}
                {product.badge && (
                  <div
                    className={`absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full ${
                      product.badge === 'Best Seller'
                        ? 'bg-pj-gold text-white'
                        : product.badge === 'New'
                        ? 'bg-pj-blue text-white'
                        : product.badge === 'Premium'
                        ? 'bg-pj-navy text-white'
                        : 'bg-white text-pj-charcoal'
                    }`}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Quick Add */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="w-full bg-pj-navy text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-pj-blue transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-pj-gold text-pj-gold" />
                    <span className="text-sm text-pj-charcoal">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-pj-gray">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <p className="text-sm text-pj-gray mb-1">{product.brand}</p>
                <h3 className="font-medium text-pj-charcoal group-hover:text-pj-blue transition-colors mb-1">
                  {product.name}
                </h3>
                <p className="text-pj-navy font-medium">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/collections/best-sellers"
            className="inline-flex items-center gap-2 text-pj-navy hover:text-pj-blue transition-colors font-medium"
          >
            Shop All Best Sellers
            <span className="w-6 h-6 rounded-full bg-pj-navy text-white flex items-center justify-center text-xs group-hover:bg-pj-blue transition-colors">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
