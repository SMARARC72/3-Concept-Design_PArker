import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const brands = [
  { name: 'NOLA Tawk', initials: 'NT' },
  { name: 'Saltwater Boys', initials: 'SB' },
  { name: 'Properly Tied', initials: 'PT' },
  { name: 'Fieldstone', initials: 'FS' },
  { name: 'Prodoh', initials: 'PD' },
  { name: 'Little English', initials: 'LE' },
  { name: 'Bailey Boys', initials: 'BB' },
  { name: 'J. Bailey', initials: 'JB' },
];

export default function FeaturedBrands() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const marquee = marqueeRef.current;

    if (!section || !heading || !marquee) return;

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

      // Marquee animation
      const marqueeContent = marquee.querySelector('.marquee-content');
      if (marqueeContent) {
        gsap.to(marqueeContent, {
          xPercent: -50,
          duration: 30,
          ease: 'none',
          repeat: -1,
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // Pause marquee on hover
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const marqueeContent = marquee.querySelector('.marquee-content');
    if (marqueeContent) {
      if (isPaused) {
        gsap.to(marqueeContent, { timeScale: 0, duration: 0.5 });
      } else {
        gsap.to(marqueeContent, { timeScale: 1, duration: 0.5 });
      }
    }
  }, [isPaused]);

  return (
    <section
      ref={sectionRef}
      id="brands"
      className="py-20 lg:py-32 bg-pj-cream overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        <div ref={headingRef} className="text-center mb-12 lg:mb-16">
          <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
            Trusted Partners
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy">
            Featured Brands
          </h2>
          <p className="text-pj-gray mt-4 max-w-2xl mx-auto">
            We partner with the finest children's clothing brands to bring you
            curated collections of quality, style, and comfort.
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div
        ref={marqueeRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="marquee-content flex gap-12 items-center">
          {/* Duplicate brands for seamless loop */}
          {[...brands, ...brands].map((brand, index) => (
            <a
              key={`${brand.name}-${index}`}
              href={`/collections/${brand.name.toLowerCase().replace(/ /g, '-')}`}
              className="flex-shrink-0 group"
            >
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                <div className="text-center">
                  <span className="font-display text-2xl lg:text-3xl text-pj-navy/40 group-hover:text-pj-blue transition-colors">
                    {brand.initials}
                  </span>
                  <p className="text-xs text-pj-gray mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {brand.name}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* View All Brands */}
      <div className="text-center mt-12">
        <a
          href="/collections/brands"
          className="inline-flex items-center gap-2 bg-pj-navy text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-pj-blue transition-colors"
        >
          Shop All Brands
        </a>
      </div>
    </section>
  );
}
