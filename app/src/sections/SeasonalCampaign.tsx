import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SeasonalCampaign() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;

    if (!section || !image || !content) return;

    const ctx = gsap.context(() => {
      // Image scale on scroll
      gsap.fromTo(
        image.querySelector('img'),
        { scale: 1 },
        {
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Content fade in
      const contentElements = content.querySelectorAll('.animate-item');
      gsap.fromTo(
        contentElements,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: content,
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
      id="occasions"
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image - Sticky on desktop */}
          <div
            ref={imageRef}
            className="relative aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl lg:sticky lg:top-32"
          >
            <img
              src="/seasonal-rodeo.jpg"
              alt="Rodeo Ready Collection"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/40 via-transparent to-transparent" />
            
            {/* Seasonal badge */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-medium text-pj-navy">
                This Season
              </span>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:py-12">
            <span className="animate-item text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
              Featured Collection
            </span>
            <h2 className="animate-item font-display text-4xl md:text-5xl lg:text-6xl text-pj-navy mb-6">
              Rodeo Ready
            </h2>
            <p className="animate-item text-lg text-pj-gray mb-8 leading-relaxed">
              From boots to bow ties, find everything for the little cowboy. Our
              curated western collection brings authentic style to every rodeo,
              ranch visit, or country celebration. Premium quality denim, classic
              plaid shirts, and handcrafted leather boots.
            </p>

            {/* Features */}
            <div className="animate-item grid grid-cols-2 gap-6 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pj-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pj-blue font-medium">01</span>
                </div>
                <div>
                  <h4 className="font-medium text-pj-charcoal mb-1">
                    Premium Denim
                  </h4>
                  <p className="text-sm text-pj-gray">
                    Durable, comfortable fits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pj-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pj-blue font-medium">02</span>
                </div>
                <div>
                  <h4 className="font-medium text-pj-charcoal mb-1">
                    Handcrafted Boots
                  </h4>
                  <p className="text-sm text-pj-gray">
                    Authentic western style
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pj-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pj-blue font-medium">03</span>
                </div>
                <div>
                  <h4 className="font-medium text-pj-charcoal mb-1">
                    Classic Plaids
                  </h4>
                  <p className="text-sm text-pj-gray">
                    Timeless patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pj-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pj-blue font-medium">04</span>
                </div>
                <div>
                  <h4 className="font-medium text-pj-charcoal mb-1">
                    Accessories
                  </h4>
                  <p className="text-sm text-pj-gray">
                    Hats, belts & more
                  </p>
                </div>
              </div>
            </div>

            <a
              href="/collections/rodeo"
              className="animate-item inline-flex items-center gap-3 bg-pj-navy text-white px-8 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-pj-blue transition-colors duration-300 group"
            >
              Shop the Collection
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
