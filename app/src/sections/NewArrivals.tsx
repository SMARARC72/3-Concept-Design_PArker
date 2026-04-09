import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

gsap.registerPlugin(ScrollTrigger);

const newArrivals = [
  {
    id: '1',
    name: 'Classic Polo Shirt',
    brand: 'ParkerJoe',
    price: 45,
    image: '/product-1.jpg',
    isNew: true,
  },
  {
    id: '2',
    name: 'Chino Shorts',
    brand: 'Saltwater Boys',
    price: 38,
    image: '/product-2.jpg',
    isNew: true,
  },
  {
    id: '3',
    name: 'Oxford Button Down',
    brand: 'Properly Tied',
    price: 52,
    image: '/product-3.jpg',
    isNew: true,
  },
  {
    id: '4',
    name: 'Navy Blazer',
    brand: 'ParkerJoe',
    price: 128,
    image: '/category-apparel.jpg',
    isNew: true,
  },
  {
    id: '5',
    name: 'Leather Loafers',
    brand: 'NOLA Tawk',
    price: 78,
    image: '/category-shoes.jpg',
    isNew: true,
  },
  {
    id: '6',
    name: 'Western Plaid Shirt',
    brand: 'Fieldstone',
    price: 48,
    image: '/category-western.jpg',
    isNew: true,
  },
];

export default function NewArrivals() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!section || !heading || !scrollContainer) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        heading,
        { x: -50, opacity: 0 },
        {
          x: 0,
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

      // Horizontal scroll effect
      const scrollWidth = scrollContainer.scrollWidth - window.innerWidth + 100;

      gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 20%',
          end: `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleQuickAdd = (product: typeof newArrivals[0]) => {
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
      id="new-arrivals"
      className="py-20 lg:py-32 bg-pj-cream overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12 mb-12">
        <div ref={headingRef} className="flex items-end justify-between">
          <div>
            <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
              Just Dropped
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy">
              New Arrivals
            </h2>
          </div>
          <a
            href="/collections/new-arrivals"
            className="hidden md:flex items-center gap-2 text-pj-navy hover:text-pj-blue transition-colors group"
          >
            <span className="text-sm font-medium">View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 px-6 lg:px-12"
        style={{ width: 'fit-content' }}
      >
        {newArrivals.map((product) => (
          <div
            key={product.id}
            className="w-[280px] md:w-[320px] lg:w-[380px] flex-shrink-0 group"
          >
            {/* Product Image */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-md mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badges */}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-pj-gold text-white text-xs font-medium px-3 py-1 rounded-full">
                  New
                </div>
              )}

              {/* Quick Add Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="w-full bg-pj-navy text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-pj-blue transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Quick Add
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-pj-gray mb-1">{product.brand}</p>
              <h3 className="font-medium text-pj-charcoal mb-2 group-hover:text-pj-blue transition-colors">
                {product.name}
              </h3>
              <p className="text-pj-navy font-medium">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      <div className="md:hidden px-6 mt-8">
        <a
          href="/collections/new-arrivals"
          className="flex items-center justify-center gap-2 w-full py-3 border border-pj-navy text-pj-navy rounded-lg font-medium"
        >
          View All New Arrivals
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
