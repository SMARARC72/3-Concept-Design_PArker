import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, ArrowRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function EmailCapture() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 bg-pj-navy relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pj-blue rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pj-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full px-6 lg:px-12 relative z-10">
        <div ref={contentRef} className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-pj-gold" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Join the ParkerJoe Family
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Subscribe for early access to new arrivals, exclusive offers, and
            styling tips for your little one.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:border-pj-gold transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-pj-gold text-white rounded-full font-medium hover:bg-pj-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/50 text-sm mt-4">
                By subscribing, you agree to receive marketing emails from ParkerJoe.
              </p>
            </form>
          ) : (
            <div className="bg-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-pj-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-pj-gold" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2">
                Welcome to the Family!
              </h3>
              <p className="text-white/70">
                Check your inbox for a special welcome offer.
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: '10%', label: 'Off your first order' },
              { value: 'Early', label: 'Access to sales' },
              { value: 'Free', label: 'Styling tips' },
            ].map((benefit) => (
              <div key={benefit.label} className="text-center">
                <p className="font-display text-2xl lg:text-3xl text-pj-gold mb-1">
                  {benefit.value}
                </p>
                <p className="text-sm text-white/60">{benefit.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
