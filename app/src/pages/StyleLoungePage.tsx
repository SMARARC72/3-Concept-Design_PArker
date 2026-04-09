import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Ruler,
  Shirt,
  Crown,
  GraduationCap,
  Heart,
  Camera,
  Sun,
  Leaf,
  Snowflake,
  CloudSun,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { useChat } from '../context/ChatContext';
import { useCart } from '../context/CartContext';

gsap.registerPlugin(ScrollTrigger);

// Mock data for lookbook items
const lookbookItems = [
  {
    id: 'lb1',
    title: 'Easter Sunday Best',
    season: 'Spring',
    image: '/category-dresswear.jpg',
    description: 'Polished outfits for Easter celebrations',
  },
  {
    id: 'lb2',
    title: 'Spring Playdate',
    season: 'Spring',
    image: '/category-apparel.jpg',
    description: 'Casual comfort for outdoor adventures',
  },
  {
    id: 'lb3',
    title: 'Summer Wedding',
    season: 'Summer',
    image: '/product-3.jpg',
    description: 'Dapper looks for warm-weather nuptials',
  },
  {
    id: 'lb4',
    title: 'Back to School',
    season: 'Fall',
    image: '/category-western.jpg',
    description: 'Smart casual for the first day back',
  },
  {
    id: 'lb5',
    title: 'Fall Family Photos',
    season: 'Fall',
    image: '/category-outerwear.jpg',
    description: 'Picture-perfect autumn outfits',
  },
  {
    id: 'lb6',
    title: 'Winter Wonderland',
    season: 'Winter',
    image: '/category-shoes.jpg',
    description: 'Cozy layers for holiday celebrations',
  },
];

// Mock data for outfit ideas
const outfitIdeas = [
  {
    id: 'outfit1',
    name: 'Sunday School Classic',
    items: ['Navy Blazer', 'White Oxford Shirt', 'Khaki Chinos'],
    price: 145,
    image: '/product-1.jpg',
    category: 'Church',
  },
  {
    id: 'outfit2',
    name: 'Birthday Party Ready',
    items: ['Graphic Tee', 'Denim Shorts', 'Sneakers'],
    price: 89,
    image: '/product-2.jpg',
    category: 'Party',
  },
  {
    id: 'outfit3',
    name: 'Wedding Guest',
    items: ['Vest Set', 'Dress Shirt', 'Dress Pants', 'Bow Tie'],
    price: 198,
    image: '/category-dresswear.jpg',
    category: 'Wedding',
  },
  {
    id: 'outfit4',
    name: 'Picture Day Perfect',
    items: ['Polo Shirt', 'Corduroy Pants', 'Loafers'],
    price: 125,
    image: '/category-apparel.jpg',
    category: 'School',
  },
  {
    id: 'outfit5',
    name: 'Outdoor Explorer',
    items: ['Henley Shirt', 'Cargo Shorts', 'Sandals'],
    price: 78,
    image: '/category-western.jpg',
    category: 'Playdate',
  },
  {
    id: 'outfit6',
    name: 'Holiday Dress Up',
    items: ['Velvet Blazer', 'Dress Shirt', 'Dress Pants'],
    price: 165,
    image: '/category-outerwear.jpg',
    category: 'Holiday',
  },
];

// Style guides data
const styleGuides = [
  {
    id: 'sg1',
    title: 'How to Dress for Church',
    icon: Heart,
    description: 'Respectful and stylish Sunday best options for boys of all ages.',
    tips: ['Choose modest cuts', 'Stick to classic colors', 'Comfortable for sitting'],
  },
  {
    id: 'sg2',
    title: 'Wedding Guest Style',
    icon: Crown,
    description: 'From ring bearer to guest, dress codes decoded for little gentlemen.',
    tips: ['Match the formality', 'Consider the venue', 'Comfort is key'],
  },
  {
    id: 'sg3',
    title: 'Back to School Looks',
    icon: GraduationCap,
    description: 'Smart casual outfits that transition from classroom to playground.',
    tips: ['Durable fabrics', 'Easy to clean', 'Mix and match'],
  },
  {
    id: 'sg4',
    title: 'Photo Shoot Styling',
    icon: Camera,
    description: 'Coordinate without matching for timeless family photos.',
    tips: ['Complement colors', 'Avoid logos', 'Layer for interest'],
  },
];

// Size chart data
const sizeChart = [
  { size: '2T', age: '2 years', height: '33-36"', weight: '29-31 lbs', chest: '20.5"', waist: '19.5"' },
  { size: '3T', age: '3 years', height: '36-39"', weight: '31-34 lbs', chest: '21"', waist: '20"' },
  { size: '4T', age: '4 years', height: '39-42"', weight: '34-38 lbs', chest: '22"', waist: '20.5"' },
  { size: '5', age: '5 years', height: '42-45"', weight: '38-43 lbs', chest: '23"', waist: '21"' },
  { size: '6', age: '6 years', height: '45-48"', weight: '43-48 lbs', chest: '24"', waist: '21.5"' },
  { size: '7', age: '7 years', height: '48-50"', weight: '48-53 lbs', chest: '25"', waist: '22"' },
  { size: '8', age: '8 years', height: '50-53"', weight: '53-58 lbs', chest: '26"', waist: '23"' },
  { size: '10', age: '9-10 years', height: '53-57"', weight: '58-70 lbs', chest: '28"', waist: '24"' },
  { size: '12', age: '11-12 years', height: '57-60"', weight: '70-80 lbs', chest: '30"', waist: '25"' },
  { size: '14', age: '13-14 years', height: '60-63"', weight: '80-95 lbs', chest: '32"', waist: '26"' },
  { size: '16', age: '15-16 years', height: '63-65"', weight: '95-110 lbs', chest: '34"', waist: '28"' },
];

// Style tips blog posts
const styleTips = [
  {
    id: 'tip1',
    title: '5 Ways to Mix & Match Basics',
    excerpt: 'Build a versatile wardrobe with pieces that work together seamlessly.',
    date: 'March 15, 2026',
    readTime: '3 min read',
    category: 'Styling Tips',
  },
  {
    id: 'tip2',
    title: 'Seasonal Color Palettes for Boys',
    excerpt: 'Discover the perfect colors for every season that flatter every skin tone.',
    date: 'March 10, 2026',
    readTime: '4 min read',
    category: 'Color Guide',
  },
  {
    id: 'tip3',
    title: 'Accessorizing Made Simple',
    excerpt: 'From bow ties to belts, learn how to add personality to any outfit.',
    date: 'March 5, 2026',
    readTime: '5 min read',
    category: 'Accessories',
  },
];

// Trending items
const trendingItems = [
  { id: 't1', name: 'Navy Seersucker Suit', price: 145, image: '/category-dresswear.jpg', trend: '+120%' },
  { id: 't2', name: 'Linen Button-Down', price: 48, image: '/product-1.jpg', trend: '+85%' },
  { id: 't3', name: 'Belted Chino Shorts', price: 42, image: '/product-2.jpg', trend: '+65%' },
  { id: 't4', name: 'Leather Boat Shoes', price: 68, image: '/category-shoes.jpg', trend: '+92%' },
];

export default function StyleLoungePage() {
  const { openChat } = useChat();
  const { addItem } = useCart();
  const [activeSeason, setActiveSeason] = useState('All');
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const aiStylistRef = useRef<HTMLElement>(null);
  const lookbookRef = useRef<HTMLElement>(null);
  const outfitsRef = useRef<HTMLElement>(null);
  const guidesRef = useRef<HTMLElement>(null);
  const sizeGuideRef = useRef<HTMLElement>(null);
  const tipsRef = useRef<HTMLElement>(null);
  const trendingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        '.hero-content',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15,
        }
      );

      // AI Stylist section
      gsap.fromTo(
        '.ai-content',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: aiStylistRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Lookbook cards
      const lookbookCards = document.querySelectorAll('.lookbook-card');
      lookbookCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: lookbookRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Outfit cards
      const outfitCards = document.querySelectorAll('.outfit-card');
      outfitCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: index * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: outfitsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Style guides
      gsap.fromTo(
        '.guide-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: guidesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Size guide
      gsap.fromTo(
        '.size-guide-content',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sizeGuideRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Tips cards
      gsap.fromTo(
        '.tip-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: tipsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Trending items
      gsap.fromTo(
        '.trending-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: trendingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const filteredLookbook =
    activeSeason === 'All'
      ? lookbookItems
      : lookbookItems.filter((item) => item.season === activeSeason);

  const handleShopOutfit = (outfit: (typeof outfitIdeas)[0]) => {
    addItem({
      id: outfit.id,
      name: outfit.name,
      brand: 'ParkerJoe',
      price: outfit.price,
      size: '5T',
      color: 'Multi',
      image: outfit.image,
    });
  };

  return (
    <main className="bg-pj-cream min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pj-blue/10 via-transparent to-pj-gold/10" />
        <div className="relative w-full px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="hero-content inline-block text-sm text-pj-gold font-medium tracking-widest uppercase mb-4">
              Your Personal Fashion Destination
            </span>
            <h1 className="hero-content font-display text-5xl md:text-6xl lg:text-7xl text-pj-navy mb-6">
              PJ <span className="italic text-pj-blue">Style Lounge</span>
            </h1>
            <p className="hero-content text-lg md:text-xl text-pj-gray max-w-2xl mx-auto mb-8">
              Discover curated looks, expert styling tips, and personalized outfit ideas
              designed to help your little gentleman look his best for every occasion.
            </p>
            <div className="hero-content flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => {
                  const el = document.getElementById('lookbook');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-pj-navy hover:bg-pj-blue text-white px-8 py-6 rounded-full font-medium"
              >
                Explore Lookbook
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  const el = document.getElementById('outfits');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline"
                className="border-pj-navy text-pj-navy hover:bg-pj-navy hover:text-white px-8 py-6 rounded-full font-medium"
              >
                Shop Outfits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Stylist Section */}
      <section ref={aiStylistRef} className="py-16 lg:py-24 bg-pj-navy">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="ai-content">
                <div className="inline-flex items-center gap-2 bg-pj-gold/20 text-pj-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Styling
                </div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                  Meet Your Personal <span className="italic text-pj-blue">AI Stylist</span>
                </h2>
                <p className="text-white/70 text-lg mb-8">
                  Not sure what to choose? Our AI stylist learns your preferences and suggests
                  perfect outfits for any occasion. Get personalized recommendations in seconds.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={openChat}
                    className="bg-pj-gold hover:bg-pj-gold/90 text-white px-8 py-6 rounded-full font-medium"
                  >
                    <Sparkles className="mr-2 w-4 h-4" />
                    Chat with AI Stylist
                  </Button>
                </div>
                <div className="mt-8 flex items-center gap-6 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pj-gold rounded-full" />
                    <span>Instant recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pj-blue rounded-full" />
                    <span>Size guidance</span>
                  </div>
                </div>
              </div>
              <div className="ai-content relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-pj-blue/30 to-pj-gold/30 rounded-3xl transform rotate-6" />
                  <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-pj-gold/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-pj-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-pj-navy">PJ Style Assistant</p>
                        <p className="text-xs text-pj-gray">Online</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-pj-cream rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm text-pj-charcoal">
                          Hi! I&apos;m looking for an outfit for my son&apos;s first communion.
                        </p>
                      </div>
                      <div className="bg-pj-navy rounded-2xl rounded-tr-none p-4 ml-8">
                        <p className="text-sm text-white">
                          How exciting! I&apos;d recommend our Classic White Suit with a subtle
                          blue tie. Would you like me to show you some options?
                        </p>
                      </div>
                      <div className="bg-pj-cream rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm text-pj-charcoal">Yes, please! He&apos;s 6 years old.</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-pj-gray text-center">
                        Click to start your own styling session
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook Section */}
      <section ref={lookbookRef} id="lookbook" className="py-20 lg:py-32">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Seasonal Collections
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-6">
                The Lookbook
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {['All', 'Spring', 'Summer', 'Fall', 'Winter'].map((season) => (
                  <button
                    key={season}
                    onClick={() => setActiveSeason(season)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      activeSeason === season
                        ? 'bg-pj-navy text-white'
                        : 'bg-white text-pj-gray hover:bg-pj-light-gray'
                    }`}
                  >
                    {season === 'Spring' && <Leaf className="inline w-4 h-4 mr-1" />}
                    {season === 'Summer' && <Sun className="inline w-4 h-4 mr-1" />}
                    {season === 'Fall' && <CloudSun className="inline w-4 h-4 mr-1" />}
                    {season === 'Winter' && <Snowflake className="inline w-4 h-4 mr-1" />}
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLookbook.map((item) => (
                <div
                  key={item.id}
                  className="lookbook-card group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pj-navy/80 via-pj-navy/20 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <span className="text-xs text-pj-gold uppercase tracking-wider mb-2">
                      {item.season} Collection
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.description}</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-2 text-sm font-medium">
                        View Collection
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outfit Ideas Section */}
      <section ref={outfitsRef} id="outfits" className="py-20 lg:py-32 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Complete Looks
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
                Outfit Ideas
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Curated ensembles for every occasion. Each outfit is thoughtfully paired
                to create a polished, coordinated look.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfitIdeas.map((outfit) => (
                <Card key={outfit.id} className="outfit-card group border-0 shadow-lg overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={outfit.image}
                      alt={outfit.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-pj-navy text-xs font-medium px-3 py-1 rounded-full">
                        {outfit.category}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-xl text-pj-navy">
                      {outfit.name}
                    </CardTitle>
                    <CardDescription className="text-pj-gray">
                      {outfit.items.join(' • ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-pj-navy font-medium text-lg">${outfit.price}</p>
                      <Button
                        onClick={() => handleShopOutfit(outfit)}
                        size="sm"
                        className="bg-pj-navy hover:bg-pj-blue text-white rounded-full"
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Shop This Look
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Style Guides Section */}
      <section ref={guidesRef} className="py-20 lg:py-32">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Expert Advice
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
                Style Guides
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Navigate any dress code with confidence. Our comprehensive guides help
                you dress your boy appropriately for every occasion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {styleGuides.map((guide) => {
                const Icon = guide.icon;
                const isActive = activeGuide === guide.id;
                return (
                  <Card
                    key={guide.id}
                    className={`guide-card cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-xl ${
                      isActive ? 'ring-2 ring-pj-gold' : ''
                    }`}
                    onClick={() => setActiveGuide(isActive ? null : guide.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-pj-blue/10 rounded-xl flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-pj-blue" />
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-pj-gray transition-transform ${
                            isActive ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                      <CardTitle className="font-display text-xl text-pj-navy">
                        {guide.title}
                      </CardTitle>
                      <CardDescription className="text-pj-gray">
                        {guide.description}
                      </CardDescription>
                    </CardHeader>
                    {isActive && (
                      <CardContent className="pt-0">
                        <div className="border-t border-gray-100 pt-4 mt-2">
                          <p className="text-sm font-medium text-pj-navy mb-2">Quick Tips:</p>
                          <ul className="space-y-2">
                            {guide.tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-pj-gray">
                                <div className="w-1.5 h-1.5 bg-pj-gold rounded-full" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant="link"
                            className="text-pj-blue p-0 h-auto mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            Read full guide
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Section */}
      <section ref={sizeGuideRef} className="py-20 lg:py-32 bg-pj-navy">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 size-guide-content">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Find the Perfect Fit
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Size Guide
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Use our comprehensive size chart to find the perfect fit for your boy.
                Measurements are in inches.
              </p>
            </div>

            <div className="size-guide-content bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-pj-light-gray">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4" />
                          Size
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">Age</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4" />
                          Height
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">Weight</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">Chest</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-pj-navy">Waist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((row, index) => (
                      <tr
                        key={row.size}
                        className={`border-t border-gray-100 hover:bg-pj-cream transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-pj-cream/50'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-pj-navy">{row.size}</td>
                        <td className="px-4 py-3 text-pj-gray">{row.age}</td>
                        <td className="px-4 py-3 text-pj-gray">{row.height}</td>
                        <td className="px-4 py-3 text-pj-gray">{row.weight}</td>
                        <td className="px-4 py-3 text-pj-gray">{row.chest}</td>
                        <td className="px-4 py-3 text-pj-gray">{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-pj-light-gray border-t border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-pj-gray">
                    Not sure about sizing? Our AI stylist can help!
                  </p>
                  <Button
                    onClick={openChat}
                    variant="outline"
                    className="border-pj-navy text-pj-navy hover:bg-pj-navy hover:text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Size Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style Tips Blog Section */}
      <section ref={tipsRef} className="py-20 lg:py-32">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Style Insights
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
                Style Tips & Advice
              </h2>
              <p className="text-pj-gray max-w-2xl mx-auto">
                Expert advice on building a versatile wardrobe, seasonal trends, and
                styling tricks for your little gentleman.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {styleTips.map((tip) => (
                <Card
                  key={tip.id}
                  className="tip-card group border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-pj-blue to-pj-gold" />
                  <CardHeader>
                    <div className="flex items-center gap-2 text-xs text-pj-gray mb-2">
                      <span className="text-pj-gold font-medium">{tip.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tip.readTime}
                      </span>
                    </div>
                    <CardTitle className="font-display text-lg text-pj-navy group-hover:text-pj-blue transition-colors">
                      {tip.title}
                    </CardTitle>
                    <CardDescription className="text-pj-gray line-clamp-2">
                      {tip.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-pj-gray">{tip.date}</p>
                    <Button
                      variant="ghost"
                      className="text-pj-blue hover:text-pj-navy p-0 h-auto mt-4 font-medium"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section ref={trendingRef} className="py-20 lg:py-32 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm text-pj-gold font-medium tracking-widest uppercase mb-2 block">
                Popular Right Now
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pj-navy mb-4">
                Trending Now
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {trendingItems.map((item) => (
                <Card
                  key={item.id}
                  className="trending-card group border-0 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-pj-gold text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {item.trend}
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          brand: 'ParkerJoe',
                          price: item.price,
                          size: '5T',
                          color: 'Navy',
                          image: item.image,
                        })
                      }
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pj-navy hover:text-white"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-pj-charcoal text-sm mb-1 group-hover:text-pj-blue transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-pj-navy font-semibold">${item.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
