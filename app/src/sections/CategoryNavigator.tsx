import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: 'Apparel', image: '/category-apparel.jpg', href: '/collections/apparel' },
  { name: 'Shoes', image: '/category-shoes.jpg', href: '/collections/shoes' },
  { name: 'Accessories', image: '/category-accessories.jpg', href: '/collections/accessories' },
  { name: 'Dresswear', image: '/category-dresswear.jpg', href: '/collections/dresswear' },
  { name: 'Western', image: '/category-western.jpg', href: '/collections/western' },
  { name: 'Toys & Books', image: '/category-gifts.jpg', href: '/collections/toys-books' },
  { name: 'Gifts', image: '/category-gifts.jpg', href: '/collections/gifts' },
  { name: 'New Arrivals', image: '/product-1.jpg', href: '/collections/new-arrivals' },
];

export default function CategoryNavigator() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const container = containerRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !container || !cards) return;

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

      // Cards stagger animation
      const cardElements = cards.querySelectorAll('.category-card');
      gsap.fromTo(
        cardElements,
        { y: 60, opacity: 0, rotateY: 15 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="shop"
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <h2
          ref={headingRef}
          className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy text-center mb-12 lg:mb-16"
        >
          Shop by Category
        </h2>

        <div
          ref={containerRef}
          className="relative"
          style={{ perspective: '1000px' }}
        >
          <div
            ref={cardsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="category-card group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  {/* Image Container */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-pj-navy/0 group-hover:bg-pj-navy/10 transition-colors duration-300" />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <span className="text-sm lg:text-base font-medium text-pj-charcoal group-hover:text-pj-blue transition-colors duration-300">
                      {category.name}
                    </span>
                  </div>

                  {/* Decorative dot on hover */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-pj-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
