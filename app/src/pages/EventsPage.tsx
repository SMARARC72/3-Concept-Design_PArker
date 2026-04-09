import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Clock, Users, ArrowRight, Mail, Check, Sparkles, Heart, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'Trunk Show' | 'Styling Session' | 'Seasonal Launch' | 'Charity Event';
  image: string;
  spots?: number;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Spring Collection Launch',
    date: 'March 15, 2024',
    time: '10:00 AM - 6:00 PM',
    location: 'Austin Store',
    description: 'Be the first to shop our new Spring collection! Enjoy complimentary refreshments, exclusive launch-day discounts, and styling consultations with our expert team.',
    type: 'Seasonal Launch',
    image: '/category-apparel.jpg',
    spots: 50,
  },
  {
    id: '2',
    title: 'Easter Styling Session',
    date: 'March 23, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'Virtual Event',
    description: 'Join us online for a fun Easter styling workshop! Learn how to create adorable holiday outfits for your little ones with mix-and-match pieces from our collection.',
    type: 'Styling Session',
    image: '/category-dresswear.jpg',
    spots: 100,
  },
  {
    id: '3',
    title: 'Dallas Trunk Show',
    date: 'April 6, 2024',
    time: '11:00 AM - 7:00 PM',
    location: 'Dallas Market Center',
    description: 'Our curated collection comes to Dallas! Shop the full ParkerJoe line, meet our founder, and enjoy special trunk show pricing on all purchases.',
    type: 'Trunk Show',
    image: '/category-western.jpg',
    spots: 75,
  },
  {
    id: '4',
    title: "Mother's Day Tea & Shopping",
    date: 'May 4, 2024',
    time: '1:00 PM - 5:00 PM',
    location: 'Austin Store',
    description: 'Celebrate Mom with an elegant afternoon tea while shopping our latest arrivals. Includes complimentary gift wrapping and a special gift with purchase.',
    type: 'Charity Event',
    image: '/category-gifts.jpg',
    spots: 30,
  },
];

const pastEvents = [
  {
    id: 'past-1',
    title: 'Holiday Pop-Up 2023',
    image: '/store-houston.jpg',
    attendees: 200,
  },
  {
    id: 'past-2',
    title: 'Back to School Bash',
    image: '/category-apparel.jpg',
    attendees: 150,
  },
  {
    id: 'past-3',
    title: 'Fall Collection Preview',
    image: '/category-dresswear.jpg',
    attendees: 120,
  },
  {
    id: 'past-4',
    title: 'Charity Gala Night',
    image: '/store-vegas.jpg',
    attendees: 250,
  },
  {
    id: 'past-5',
    title: 'Summer Styling Workshop',
    image: '/category-accessories.jpg',
    attendees: 80,
  },
  {
    id: 'past-6',
    title: 'Grand Opening Celebration',
    image: '/founder-story.jpg',
    attendees: 300,
  },
];

const eventTypeIcons = {
  'Trunk Show': Sparkles,
  'Styling Session': Users,
  'Seasonal Launch': PartyPopper,
  'Charity Event': Heart,
};

const eventTypeColors = {
  'Trunk Show': 'bg-pj-blue/20 text-pj-blue',
  'Styling Session': 'bg-pj-gold/20 text-pj-gold',
  'Seasonal Launch': 'bg-green-100 text-green-700',
  'Charity Event': 'bg-rose-100 text-rose-700',
};

export default function EventsPage() {
  const heroRef = useRef<HTMLElement>(null);
  const upcomingRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLElement>(null);
  const calendarRef = useRef<HTMLElement>(null);
  const newsletterRef = useRef<HTMLElement>(null);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const heroTl = gsap.timeline({ delay: 0.3 });
      heroTl
        .fromTo(
          '.events-hero-title',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        )
        .fromTo(
          '.events-hero-subtitle',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        )
        .fromTo(
          '.events-hero-cta',
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        );

      // Upcoming events section
      gsap.fromTo(
        '.upcoming-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: upcomingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.event-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: upcomingRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Past events gallery
      gsap.fromTo(
        '.gallery-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.gallery-item',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: galleryRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Host section
      gsap.fromTo(
        '.host-content',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: hostRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Calendar section
      gsap.fromTo(
        '.calendar-content',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: calendarRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Newsletter section
      gsap.fromTo(
        '.newsletter-content',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: newsletterRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleRSVP = (eventId: string) => {
    // Simulate RSVP action
    alert(`Thank you for your interest! RSVP functionality for event ${eventId} would open a registration modal.`);
  };

  return (
    <main className="min-h-screen bg-pj-cream">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] w-full overflow-hidden bg-pj-navy"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pj-blue rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pj-gold rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 w-full px-6 lg:px-12 py-32 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="events-hero-title font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight mb-6">
              Events & <span className="italic text-pj-gold">Experiences</span>
            </h1>
            <p className="events-hero-subtitle text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join us for trunk shows, styling sessions, and special events. Connect with the ParkerJoe community and create lasting memories with your little ones.
            </p>
            <div className="events-hero-cta flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-pj-gold hover:bg-pj-gold/90 text-white px-8 py-6 rounded-full font-medium text-base"
              >
                View Upcoming Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => hostRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-full font-medium text-base"
              >
                Host an Event
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-pj-cream to-transparent" />
      </section>

      {/* Upcoming Events Section */}
      <section ref={upcomingRef} className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="upcoming-header text-center mb-16">
            <span className="inline-block px-4 py-2 bg-pj-blue/10 rounded-full text-pj-blue text-sm font-medium mb-4">
              Mark Your Calendar
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
              Upcoming Events
            </h2>
            <p className="text-pj-gray max-w-2xl mx-auto text-lg">
              From exclusive collection launches to interactive styling sessions, there's something for every ParkerJoe family.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => {
              const TypeIcon = eventTypeIcons[event.type];
              return (
                <Card
                  key={event.id}
                  className="event-card overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-2 ${eventTypeColors[event.type]}`}>
                      <TypeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{event.type}</span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-2xl text-pj-navy">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-pj-gray text-base mt-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-pj-gray">
                        <Calendar className="w-4 h-4 text-pj-gold flex-shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-pj-gray">
                        <Clock className="w-4 h-4 text-pj-gold flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-pj-gray">
                        <MapPin className="w-4 h-4 text-pj-gold flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      {event.spots && (
                        <div className="flex items-center gap-3 text-sm text-pj-gray">
                          <Users className="w-4 h-4 text-pj-gold flex-shrink-0" />
                          <span>{event.spots} spots available</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRSVP(event.id)}
                      className="w-full bg-pj-navy hover:bg-pj-blue text-white rounded-full py-5"
                    >
                      RSVP Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Past Events Gallery */}
      <section ref={galleryRef} className="py-20 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="gallery-header text-center mb-16">
            <span className="inline-block px-4 py-2 bg-pj-gold/10 rounded-full text-pj-gold text-sm font-medium mb-4">
              Memories
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
              Past Events Gallery
            </h2>
            <p className="text-pj-gray max-w-2xl mx-auto text-lg">
              Relive the magical moments from our previous events and get a glimpse of what awaits you.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {pastEvents.map((event, index) => (
              <div
                key={event.id}
                className={`gallery-item group relative overflow-hidden rounded-2xl ${
                  index === 0 || index === 3 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`relative overflow-hidden ${
                  index === 0 || index === 3 ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'
                }`}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/80 via-pj-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-display text-xl lg:text-2xl text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.attendees} attendees
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host an Event Section */}
      <section ref={hostRef} className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="host-content grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <img
                  src="/category-gifts.jpg"
                  alt="Private styling party"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-pj-navy/30 to-transparent" />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 lg:bottom-8 lg:-right-8 bg-white rounded-2xl shadow-xl p-6 max-w-[280px]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-pj-gold/20 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pj-gold" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-pj-navy">500+</p>
                    <p className="text-sm text-pj-gray">Parties Hosted</p>
                  </div>
                </div>
                <p className="text-sm text-pj-gray">
                  "The best shopping experience I've ever had!" - Sarah M.
                </p>
              </div>
            </div>

            <div>
              <span className="inline-block px-4 py-2 bg-pj-blue/10 rounded-full text-pj-blue text-sm font-medium mb-4">
                Private Events
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-6">
                Host a Styling <span className="italic text-pj-gold">Party</span>
              </h2>
              <p className="text-pj-gray text-lg mb-8 leading-relaxed">
                Gather your friends and enjoy a personalized shopping experience in the comfort of your own home or at our Austin flagship store. Our expert stylists will help you find the perfect looks for your little ones while you enjoy refreshments and exclusive perks.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Complimentary styling consultations',
                  'Exclusive host rewards and discounts',
                  'Personalized outfit recommendations',
                  'Fun activities for the kids',
                  'Flexible scheduling - daytime or evening',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pj-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-pj-gold" />
                    </div>
                    <span className="text-pj-charcoal">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button className="bg-pj-navy hover:bg-pj-blue text-white px-8 py-6 rounded-full font-medium text-base">
                Learn More About Hosting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Calendar Section */}
      <section ref={calendarRef} className="py-20 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="calendar-content">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-pj-blue/10 rounded-full text-pj-blue text-sm font-medium mb-4">
                Plan Ahead
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
                Event Calendar
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto text-lg">
                View all our upcoming events at a glance and plan your ParkerJoe experiences.
              </p>
            </div>

            {/* Calendar Placeholder */}
            <div className="bg-pj-cream rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-7 gap-4 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-pj-gray py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 4; // Offset for month start
                  const hasEvent = [10, 15, 23, 28].includes(day);
                  const isToday = day === 15;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl flex items-center justify-center relative ${
                        day < 1 || day > 31
                          ? 'opacity-30'
                          : isToday
                          ? 'bg-pj-navy text-white'
                          : 'bg-white hover:bg-pj-blue/5 transition-colors cursor-pointer'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-pj-charcoal'}`}>
                        {day > 0 && day <= 31 ? day : ''}
                      </span>
                      {hasEvent && day > 0 && day <= 31 && (
                        <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-pj-gold' : 'bg-pj-gold'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pj-navy" />
                  <span className="text-sm text-pj-gray">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pj-gold" />
                  <span className="text-sm text-pj-gray">Event Day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        ref={newsletterRef}
        className="py-20 lg:py-32 px-6 lg:px-12 bg-pj-navy relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-pj-blue rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pj-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="newsletter-content text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-pj-gold" />
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              Never Miss an Event
            </h2>
            <p className="text-white/70 mb-8 text-lg max-w-2xl mx-auto">
              Subscribe to our events newsletter and be the first to know about upcoming trunk shows, styling sessions, and exclusive experiences.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
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
                  By subscribing, you agree to receive event notifications from ParkerJoe.
                </p>
              </form>
            ) : (
              <div className="bg-white/10 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-pj-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-pj-gold" />
                </div>
                <h3 className="font-display text-2xl text-white mb-2">
                  You're on the List!
                </h3>
                <p className="text-white/70">
                  We'll keep you updated on all our upcoming events.
                </p>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl mx-auto">
              {[
                { value: 'Early', label: 'Event Access' },
                { value: 'VIP', label: 'Invitations' },
                { value: 'Special', label: 'Perks' },
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
    </main>
  );
}
