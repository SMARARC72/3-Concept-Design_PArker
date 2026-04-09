import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stores = [
  {
    name: 'Houston',
    location: 'Rice Village',
    address: '2400 University Blvd, Houston, TX 77005',
    phone: '(713) 555-0123',
    hours: 'Mon-Sat: 10am-7pm, Sun: 12pm-6pm',
    image: '/store-houston.jpg',
    mapLink: 'https://maps.google.com/?q=Rice+Village+Houston',
  },
  {
    name: 'Las Vegas',
    location: 'Forum Shops',
    address: '3500 Las Vegas Blvd S, Las Vegas, NV 89109',
    phone: '(702) 555-0456',
    hours: 'Mon-Sun: 10am-9pm',
    image: '/store-vegas.jpg',
    mapLink: 'https://maps.google.com/?q=Forum+Shops+Las+Vegas',
  },
];

export default function StoreLocations() {
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
      const cardElements = cards.querySelectorAll('.store-card');
      gsap.fromTo(
        cardElements,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards,
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
      id="stores"
      className="py-20 lg:py-32 bg-pj-cream"
    >
      <div className="w-full px-6 lg:px-12">
        <div ref={headingRef} className="text-center mb-12 lg:mb-16">
          <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
            Visit Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
            Our Stores
          </h2>
          <p className="text-pj-gray max-w-2xl mx-auto">
            Experience ParkerJoe in person. Visit one of our boutique locations
            for personalized styling and exclusive in-store offerings.
          </p>
        </div>

        {/* Store Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 lg:gap-12"
        >
          {stores.map((store) => (
            <div
              key={store.name}
              className="store-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={store.image}
                  alt={`${store.name} Store`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/60 to-transparent" />
                
                {/* Location Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-pj-navy text-sm font-medium px-4 py-2 rounded-full">
                    {store.location}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <h3 className="font-display text-2xl lg:text-3xl text-pj-navy mb-4">
                  {store.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-pj-blue mt-0.5 flex-shrink-0" />
                    <p className="text-pj-gray">{store.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-pj-blue mt-0.5 flex-shrink-0" />
                    <p className="text-pj-gray">{store.hours}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-pj-blue mt-0.5 flex-shrink-0" />
                    <p className="text-pj-gray">{store.phone}</p>
                  </div>
                </div>

                <a
                  href={store.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-pj-navy font-medium hover:text-pj-blue transition-colors"
                >
                  Get Directions
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* In-Store Services */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: 'Personal Styling', desc: 'Free consultations' },
            { title: 'Gift Wrapping', desc: 'Complimentary service' },
            { title: 'Size Exchanges', desc: 'Hassle-free returns' },
            { title: 'Private Events', desc: 'Book your party' },
          ].map((service) => (
            <div
              key={service.title}
              className="text-center p-6 bg-white rounded-xl"
            >
              <h4 className="font-medium text-pj-navy mb-1">{service.title}</h4>
              <p className="text-sm text-pj-gray">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
