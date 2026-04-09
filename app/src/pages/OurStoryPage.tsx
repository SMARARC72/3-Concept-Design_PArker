import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Heart,
  Award,
  Leaf,
  Users,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  ArrowRight,
  Star,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

// Team members data
const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    image: '/founder-story.jpg',
    bio: 'Former retail executive and mom of two boys, Sarah founded ParkerJoe to fill a gap in the market for quality boys clothing.',
  },
  {
    name: 'Michael Chen',
    role: 'Creative Director',
    image: '/product-1.jpg',
    bio: 'With 15 years in fashion design, Michael brings timeless style and modern sensibility to every collection.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Operations',
    image: '/product-2.jpg',
    bio: 'Emily ensures every order is perfect, from warehouse to doorstep, with her meticulous attention to detail.',
  },
  {
    name: 'David Thompson',
    role: 'Sustainability Lead',
    image: '/product-3.jpg',
    bio: 'David drives our eco-friendly initiatives, sourcing sustainable materials and ethical manufacturing partners.',
  },
];

// Store locations data
const storeLocations = [
  {
    name: 'Austin Flagship',
    location: 'Downtown Austin',
    address: '1200 Congress Ave, Austin, TX 78701',
    phone: '(512) 555-0198',
    hours: 'Mon-Sat: 10am-8pm, Sun: 11am-6pm',
    image: '/store-houston.jpg',
    mapLink: 'https://maps.google.com/?q=Congress+Avenue+Austin',
  },
  {
    name: 'Houston',
    location: 'Rice Village',
    address: '2400 University Blvd, Houston, TX 77005',
    phone: '(713) 555-0123',
    hours: 'Mon-Sat: 10am-7pm, Sun: 12pm-6pm',
    image: '/store-vegas.jpg',
    mapLink: 'https://maps.google.com/?q=Rice+Village+Houston',
  },
];

// Press logos (using text placeholders for publications)
const pressFeatures = [
  { name: 'Vogue', subtitle: 'Best Kids Brands 2023' },
  { name: 'Parents Magazine', subtitle: 'Editor\'s Choice Award' },
  { name: 'Texas Monthly', subtitle: 'Top Local Business' },
  { name: 'Southern Living', subtitle: 'Style Spotlight' },
  { name: 'The Austin Chronicle', subtitle: 'Reader\'s Favorite' },
  { name: 'Dallas Morning News', subtitle: 'Fashion Forward' },
];

// Open positions
const openPositions = [
  {
    title: 'Store Associate - Austin',
    type: 'Part-time',
    location: 'Austin, TX',
  },
  {
    title: 'Visual Merchandiser',
    type: 'Full-time',
    location: 'Houston, TX',
  },
  {
    title: 'Customer Experience Specialist',
    type: 'Remote',
    location: 'Anywhere',
  },
  {
    title: 'Junior Buyer',
    type: 'Full-time',
    location: 'Austin, TX',
  },
];

// Difference points
const differencePoints = [
  {
    icon: Heart,
    title: 'Boys-First Approach',
    description:
      "We're the only boutique exclusively focused on boys fashion, because we believe they deserve clothing that's made with them in mind.",
  },
  {
    icon: Award,
    title: 'Curated Quality',
    description:
      'Every item is hand-selected for durability, comfort, and style. We test everything on our own kids first.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    description:
      'From organic cotton to eco-friendly packaging, were committed to reducing our environmental footprint.',
  },
  {
    icon: Users,
    title: 'Community Focused',
    description:
      'We partner with local schools, support youth programs, and build lasting relationships with families.',
  },
];

// Mission values
const missionValues = [
  {
    title: 'Quality Craftsmanship',
    description:
      'We source only the finest materials and partner with skilled artisans who share our commitment to excellence. Every stitch matters.',
  },
  {
    title: 'Timeless Style',
    description:
      'Trends come and go, but classic style endures. Our pieces are designed to look great today and become treasured hand-me-downs tomorrow.',
  },
  {
    title: 'Childhood Comfort',
    description:
      'Active boys need clothes that move with them. We prioritize comfort without compromising on style.',
  },
  {
    title: 'Sustainability Commitment',
    description:
      'From organic fabrics to recyclable packaging, were dedicated to protecting the planet for the next generation.',
  },
];

export default function OurStoryPage() {
  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef<HTMLElement>(null);
  const founderImageRef = useRef<HTMLDivElement>(null);
  const founderContentRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const missionCardsRef = useRef<HTMLDivElement>(null);
  const differenceRef = useRef<HTMLElement>(null);
  const differenceListRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLElement>(null);
  const teamCardsRef = useRef<HTMLDivElement>(null);
  const storesRef = useRef<HTMLElement>(null);
  const storesCardsRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<HTMLElement>(null);
  const careersRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const heroContent = heroContentRef.current;
      if (heroContent) {
        const elements = heroContent.querySelectorAll('.hero-animate');
        gsap.fromTo(
          elements,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.3,
          }
        );
      }

      // Founder section animations
      if (founderRef.current && founderImageRef.current && founderContentRef.current) {
        gsap.fromTo(
          founderImageRef.current,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: founderRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        const founderElements = founderContentRef.current.querySelectorAll('.founder-animate');
        gsap.fromTo(
          founderElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: founderContentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Mission section animations
      if (missionRef.current && missionCardsRef.current) {
        const missionHeading = missionRef.current.querySelector('.mission-heading');
        if (missionHeading) {
          gsap.fromTo(
            missionHeading,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: missionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        const missionCards = missionCardsRef.current.querySelectorAll('.mission-card');
        gsap.fromTo(
          missionCards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: missionCardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Difference section animations
      if (differenceRef.current && differenceListRef.current) {
        const diffHeading = differenceRef.current.querySelector('.difference-heading');
        if (diffHeading) {
          gsap.fromTo(
            diffHeading,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: differenceRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        const diffItems = differenceListRef.current.querySelectorAll('.difference-item');
        gsap.fromTo(
          diffItems,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: differenceListRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Team section animations
      if (teamRef.current && teamCardsRef.current) {
        const teamHeading = teamRef.current.querySelector('.team-heading');
        if (teamHeading) {
          gsap.fromTo(
            teamHeading,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: teamRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        const teamCards = teamCardsRef.current.querySelectorAll('.team-card');
        gsap.fromTo(
          teamCards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamCardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Stores section animations
      if (storesRef.current && storesCardsRef.current) {
        const storesHeading = storesRef.current.querySelector('.stores-heading');
        if (storesHeading) {
          gsap.fromTo(
            storesHeading,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: storesRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        const storeCards = storesCardsRef.current.querySelectorAll('.store-card');
        gsap.fromTo(
          storeCards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storesCardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Press section animations
      if (pressRef.current) {
        const pressItems = pressRef.current.querySelectorAll('.press-item');
        gsap.fromTo(
          pressItems,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: pressRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Careers section animations
      if (careersRef.current) {
        const careersElements = careersRef.current.querySelectorAll('.careers-animate');
        gsap.fromTo(
          careersElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: careersRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-pj-cream">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] w-full overflow-hidden bg-pj-navy"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hero-main.jpg"
            alt="ParkerJoe Story"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pj-navy/60 via-pj-navy/40 to-pj-navy/80" />
        </div>

        {/* Content */}
        <div
          ref={heroContentRef}
          className="relative z-10 w-full min-h-[70vh] flex items-center justify-center text-center px-6"
        >
          <div className="max-w-4xl">
            <span className="hero-animate inline-block text-pj-gold text-sm font-medium tracking-widest uppercase mb-4">
              Since 2019
            </span>
            <h1 className="hero-animate font-display text-4xl md:text-5xl lg:text-7xl text-white mb-6 leading-tight">
              Our <span className="italic text-pj-blue">Story</span>
            </h1>
            <p className="hero-animate text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Born from a mothers love for her two sons, ParkerJoe celebrates
              boys with clothing that honors their spirit, energy, and unique
              sense of style.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/60 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section
        ref={founderRef}
        className="py-20 lg:py-32 bg-pj-cream"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
            {/* Image */}
            <div ref={founderImageRef} className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/founder-story.jpg"
                  alt="Sarah Johnson, Founder of ParkerJoe"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pj-gold/20 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pj-gold" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-pj-navy">Parker & Joe</p>
                    <p className="text-sm text-pj-gray">Our Inspiration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div ref={founderContentRef}>
              <span className="founder-animate text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                Meet the Founder
              </span>
              <h2 className="founder-animate font-display text-4xl md:text-5xl text-pj-navy mb-6">
                It Started with a{' '}
                <span className="italic text-pj-blue">Simple Problem</span>
              </h2>
              <div className="founder-animate space-y-4 text-pj-gray leading-relaxed mb-8">
                <p>
                  In 2019, Sarah Johnson found herself frustrated. As a mother of
                  two active boys, Parker and Joe, she couldnt find clothing that
                  matched her standards—pieces that were durable enough for
                  playground adventures yet stylish enough for family photos.
                </p>
                <p>
                  Everything was either cheaply made or overly formal. The boys
                  clothing market seemed to offer only two extremes: fast fashion
                  that fell apart after one wash, or uncomfortable dress clothes
                  that kids hated wearing.
                </p>
                <p>
                  So Sarah did what any determined mother would do—she created the
                  solution herself. Named after her sons, ParkerJoe was born in a
                  small studio in Austin, Texas, with a mission to provide classic,
                  durable clothing for active boys.
                </p>
              </div>

              {/* Signature */}
              <div className="founder-animate border-t border-pj-navy/10 pt-6">
                <p className="font-display text-2xl text-pj-navy italic mb-1">
                  Sarah Johnson
                </p>
                <p className="text-pj-gray">Founder & CEO, ParkerJoe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section
        ref={missionRef}
        className="py-20 lg:py-32 bg-white"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="mission-heading text-center mb-16">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                What Drives Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-pj-navy mb-4">
                Mission & <span className="italic text-pj-blue">Values</span>
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Every decision we make is guided by our commitment to quality,
                style, comfort, and sustainability.
              </p>
            </div>

            {/* Values Grid */}
            <div
              ref={missionCardsRef}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            >
              {missionValues.map((value, index) => (
                <Card
                  key={value.title}
                  className="mission-card bg-pj-cream border-0 shadow-none hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="w-12 h-12 bg-pj-navy rounded-full flex items-center justify-center mb-6">
                      <span className="text-white font-display text-xl">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-pj-navy mb-3">
                      {value.title}
                    </h3>
                    <p className="text-pj-gray text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The ParkerJoe Difference Section */}
      <section
        ref={differenceRef}
        className="py-20 lg:py-32 bg-pj-navy"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="difference-heading text-center mb-16">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                Why Choose Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
                The ParkerJoe{' '}
                <span className="italic text-pj-blue">Difference</span>
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Were not just another childrens clothing brand. Heres what sets
                us apart.
              </p>
            </div>

            {/* Difference Points */}
            <div
              ref={differenceListRef}
              className="grid md:grid-cols-2 gap-8"
            >
              {differencePoints.map((point) => (
                <div
                  key={point.title}
                  className="difference-item flex gap-6 p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-14 h-14 bg-pj-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-6 h-6 text-pj-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-white mb-2">
                      {point.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section
        ref={teamRef}
        className="py-20 lg:py-32 bg-pj-cream"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="team-heading text-center mb-16">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                The People Behind ParkerJoe
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-pj-navy mb-4">
                Meet the <span className="italic text-pj-blue">Team</span>
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Were a passionate group of parents, designers, and retail
                professionals united by our love for boys fashion.
              </p>
            </div>

            {/* Team Grid */}
            <div
              ref={teamCardsRef}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            >
              {teamMembers.map((member) => (
                <Card
                  key={member.name}
                  className="team-card bg-white border-0 shadow-lg overflow-hidden group"
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl text-pj-navy mb-1">
                      {member.name}
                    </h3>
                    <p className="text-pj-gold text-sm font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-pj-gray text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations Section */}
      <section
        ref={storesRef}
        className="py-20 lg:py-32 bg-white"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="stores-heading text-center mb-16">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                Visit Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-pj-navy mb-4">
                Store <span className="italic text-pj-blue">Locations</span>
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Experience ParkerJoe in person. Visit our boutiques for
                personalized styling and exclusive in-store offerings.
              </p>
            </div>

            {/* Map Placeholder */}
            <div className="mb-12 rounded-2xl overflow-hidden bg-pj-cream h-[300px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-pj-blue mx-auto mb-4" />
                <p className="text-pj-navy font-medium mb-1">Interactive Map</p>
                <p className="text-pj-gray text-sm">
                  Austin, TX and Houston, TX locations
                </p>
              </div>
            </div>

            {/* Store Cards */}
            <div
              ref={storesCardsRef}
              className="grid md:grid-cols-2 gap-8"
            >
              {storeLocations.map((store) => (
                <Card
                  key={store.name}
                  className="store-card border-0 shadow-lg overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={store.image}
                      alt={`${store.name} Store`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-pj-navy text-sm font-medium px-4 py-2 rounded-full">
                        {store.location}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl text-pj-navy mb-4">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press & Recognition Section */}
      <section
        ref={pressRef}
        className="py-20 lg:py-24 bg-pj-cream"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                As Featured In
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-pj-navy">
                Press & <span className="italic text-pj-blue">Recognition</span>
              </h2>
            </div>

            {/* Press Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pressFeatures.map((press) => (
                <div
                  key={press.name}
                  className="press-item bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Star className="w-6 h-6 text-pj-gold mx-auto mb-3" />
                  <p className="font-display text-sm text-pj-navy mb-1">
                    {press.name}
                  </p>
                  <p className="text-xs text-pj-gray">{press.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join the Family / Careers Section */}
      <section
        ref={careersRef}
        className="py-20 lg:py-32 bg-pj-navy"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Content */}
              <div>
                <span className="careers-animate text-sm text-pj-gold font-medium tracking-widest uppercase mb-4 block">
                  Join the Family
                </span>
                <h2 className="careers-animate font-display text-4xl md:text-5xl text-white mb-6">
                  Careers at{' '}
                  <span className="italic text-pj-blue">ParkerJoe</span>
                </h2>
                <p className="careers-animate text-white/70 leading-relaxed mb-8">
                  Were always looking for passionate individuals who share our
                  love for boys fashion and exceptional customer service. Join a
                  growing team thats making a difference in how boys dress and
                  feel.
                </p>

                {/* Benefits */}
                <div className="careers-animate space-y-4">
                  {[
                    'Competitive salary and benefits',
                    'Employee discount on all merchandise',
                    'Flexible scheduling options',
                    'Growth and development opportunities',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-pj-gold flex-shrink-0" />
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Job Listings */}
              <div>
                <h3 className="careers-animate font-display text-2xl text-white mb-6">
                  Open Positions
                </h3>
                <div className="space-y-4">
                  {openPositions.map((position) => (
                    <Card
                      key={position.title}
                      className="careers-animate bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-pj-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-pj-gold" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white mb-1">
                                {position.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-white/60">
                                <span>{position.type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {position.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-pj-gold hover:bg-pj-gold/90 text-pj-navy flex-shrink-0"
                          >
                            Apply
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <p className="careers-animate text-white/50 text-sm mt-6">
                  Dont see the right fit? Send your resume to{' '}
                  <a
                    href="mailto:careers@parkerjoe.com"
                    className="text-pj-gold hover:underline"
                  >
                    careers@parkerjoe.com
                  </a>{' '}
                  and well keep you in mind for future opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
