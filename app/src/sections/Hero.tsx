import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const blueShapeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const blueShape = blueShapeRef.current;
    const image = imageRef.current;
    const heading = headingRef.current;
    const subheading = subheadingRef.current;
    const cta = ctaRef.current;

    if (!section || !blueShape || !image || !heading || !subheading || !cta) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(blueShape, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(image, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(heading, { y: 60, opacity: 0 });
      gsap.set(subheading, { y: 40, opacity: 0 });
      gsap.set(cta, { scale: 0.8, opacity: 0 });

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.5 });

      tl.to(blueShape, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.out',
      })
        .to(
          image,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.4,
            ease: 'power3.out',
          },
          '-=0.9'
        )
        .to(
          heading,
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.8'
        )
        .to(
          subheading,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6'
        )
        .to(
          cta,
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          '-=0.4'
        );

      // Scroll parallax
      gsap.to(image, {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(heading, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-pj-cream"
    >
      {/* Blue Background Shape */}
      <div
        ref={blueShapeRef}
        className="absolute top-0 left-0 w-[55%] h-full bg-pj-blue/20"
        style={{ borderRadius: '0 0 200px 0' }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-6 lg:px-12 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="max-w-xl">
              <h1
                ref={headingRef}
                className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-pj-navy leading-tight mb-6"
              >
                Boys deserve clothing that is{' '}
                <span className="italic text-pj-blue">stylish</span>,{' '}
                <span className="italic text-pj-blue">high-quality</span>, and{' '}
                <span className="italic text-pj-blue">fun</span>.
              </h1>
              <p
                ref={subheadingRef}
                className="text-lg md:text-xl text-pj-gray mb-8 leading-relaxed"
              >
                ParkerJoe is a premium, curated boys-only retail concept built to
                make boys feel seen, styled, and celebrated.
              </p>
              <a
                ref={ctaRef}
                href="#new-arrivals"
                className="inline-flex items-center gap-3 bg-pj-navy text-white px-8 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-pj-blue transition-colors duration-300 group"
              >
                Shop New Arrivals
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Hero Image */}
            <div ref={imageRef} className="relative pb-8 pr-8">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/hero-main.jpg"
                  alt="Two boys walking on a dock"
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/20 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute bottom-0 left-0 bg-white rounded-xl shadow-xl p-4 animate-fade-in animation-delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pj-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-pj-gold font-display text-xl">P</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-pj-charcoal whitespace-nowrap">
                      The Posse
                    </p>
                    <p className="text-xs text-pj-gray whitespace-nowrap">
                      Join our membership
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-pj-gray tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-6 h-10 border-2 border-pj-gray/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-pj-gray/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
