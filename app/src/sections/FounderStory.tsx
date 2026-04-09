import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FounderStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;

    if (!section || !image || !content) return;

    const ctx = gsap.context(() => {
      // Image reveal animation
      gsap.fromTo(
        image,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content animation
      const contentElements = content.querySelectorAll('.animate-item');
      gsap.fromTo(
        contentElements,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
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
      id="story"
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/founder-story.jpg"
                alt="Founder with family"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quote Card */}
            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white rounded-xl shadow-xl p-6 max-w-xs">
              <Quote className="w-8 h-8 text-pj-gold mb-3" />
              <p className="text-pj-charcoal font-medium italic mb-3">
                "We created ParkerJoe because boys deserve clothing that makes
                them feel confident and celebrated."
              </p>
              <p className="text-sm text-pj-gray">— Lisa, Founder</p>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <span className="animate-item text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
              Our Story
            </span>
            <h2 className="animate-item font-display text-4xl md:text-5xl lg:text-6xl text-pj-navy mb-6">
              Family-Owned,{' '}
              <span className="italic text-pj-blue">Heart-Driven</span>
            </h2>
            <div className="animate-item space-y-4 text-pj-gray leading-relaxed mb-8">
              <p>
                ParkerJoe was born from a simple frustration: shopping for our
                son Parker felt like an afterthought in a world of children's
                fashion dominated by pink and princesses. We couldn't find a
                store that truly celebrated boys—one that understood they deserve
                clothing that is stylish, high-quality, and fun.
              </p>
              <p>
                So we created it ourselves. What started as a small boutique in
                Houston's Rice Village has grown into a community of families who
                believe that boys deserve to feel seen, styled, and celebrated.
              </p>
              <p>
                Every brand we carry is carefully curated. Every piece is chosen
                with intention. Because we believe that when boys look their best,
                they feel their best—and that's when the magic happens.
              </p>
            </div>

            {/* Stats */}
            <div className="animate-item grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-pj-navy mb-1">
                  2018
                </p>
                <p className="text-sm text-pj-gray">Founded</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-pj-navy mb-1">
                  2
                </p>
                <p className="text-sm text-pj-gray">Store Locations</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-pj-navy mb-1">
                  40+
                </p>
                <p className="text-sm text-pj-gray">Premium Brands</p>
              </div>
            </div>

            <a
              href="/our-story"
              className="animate-item inline-flex items-center gap-3 text-pj-navy font-medium hover:text-pj-blue transition-colors group"
            >
              Read Our Full Story
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
