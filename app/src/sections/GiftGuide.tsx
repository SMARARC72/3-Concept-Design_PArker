import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gift, Calendar, Heart, Baby } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const giftCategories = [
  {
    name: 'Birthday',
    description: 'Make their special day unforgettable',
    icon: Gift,
    image: '/category-gifts.jpg',
    href: '/collections/gifts/birthday',
    color: 'from-pj-blue/80 to-pj-navy/80',
  },
  {
    name: 'Holiday',
    description: 'Festive finds for the season',
    icon: Calendar,
    image: '/category-apparel.jpg',
    href: '/collections/gifts/holiday',
    color: 'from-pj-gold/80 to-pj-navy/80',
  },
  {
    name: 'Baby Shower',
    description: 'Welcome the newest little one',
    icon: Baby,
    image: '/product-1.jpg',
    href: '/collections/gifts/baby-shower',
    color: 'from-pj-blue/60 to-pj-gold/60',
  },
  {
    name: 'Just Because',
    description: 'Surprise them with something special',
    icon: Heart,
    image: '/category-shoes.jpg',
    href: '/collections/gifts/just-because',
    color: 'from-pj-navy/80 to-pj-blue/80',
  },
];

export default function GiftGuide() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

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

      // Cards animation
      const cardElements = cards.querySelectorAll('.gift-card');
      cardElements.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cards,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gifts"
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <div ref={headingRef} className="text-center mb-12 lg:mb-16">
          <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
            Perfect Presents
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
            Find the Perfect Gift
          </h2>
          <p className="text-pj-gray max-w-2xl mx-auto">
            From birthdays to baby showers, discover thoughtfully curated gifts
            for every occasion and every boy.
          </p>
        </div>

        {/* Gift Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {giftCategories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.name}
                href={category.href}
                className="gift-card group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity`}
                />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <div className="mb-auto">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-display text-2xl lg:text-3xl mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                    Shop Now
                    <span>→</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Gift Card CTA */}
        <div className="mt-12 bg-pj-navy rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="font-display text-2xl lg:text-3xl text-white mb-2">
              Not sure what to choose?
            </h3>
            <p className="text-white/70">
              Give the gift of choice with a ParkerJoe gift card.
            </p>
          </div>
          <a
            href="/gift-cards"
            className="inline-flex items-center gap-2 bg-white text-pj-navy px-6 py-3 rounded-full font-medium hover:bg-pj-gold hover:text-white transition-colors"
          >
            Shop Gift Cards
          </a>
        </div>
      </div>
    </section>
  );
}
