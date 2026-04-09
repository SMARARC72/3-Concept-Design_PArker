import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavigationProps {
  onCartClick: () => void;
}

const navLinks = [
  { name: 'Shop', href: '#shop', hasDropdown: true },
  { name: 'Brands', href: '#brands', hasDropdown: true },
  { name: 'Occasions', href: '#occasions', hasDropdown: true },
  { name: 'Gifts', href: '#gifts', hasDropdown: false },
  { name: 'Sale', href: '#sale', hasDropdown: false, isHighlight: true },
  { name: 'Events', href: '#events', hasDropdown: false },
  { name: 'PJ Style Lounge', href: '#style-lounge', hasDropdown: false, isSpecial: true },
  { name: 'Our Story', href: '#story', hasDropdown: false },
];

const shopDropdownItems = [
  { name: 'Apparel', image: '/category-apparel.jpg' },
  { name: 'Shoes', image: '/category-shoes.jpg' },
  { name: 'Accessories', image: '/category-accessories.jpg' },
  { name: 'Dresswear', image: '/category-dresswear.jpg' },
  { name: 'Western', image: '/category-western.jpg' },
  { name: 'Toys & Books', image: '/category-gifts.jpg' },
];

export default function Navigation({ onCartClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Entrance animation
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.fromTo(
      logoRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(
      linksRef.current?.children || [],
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(
      iconsRef.current?.children || [],
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.3'
    );
  }, []);

  const handleLinkHover = (name: string) => {
    if (name === 'Shop' || name === 'Brands' || name === 'Occasions') {
      setActiveDropdown(name);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 glass shadow-lg'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div ref={logoRef} className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <span className={`font-display text-2xl lg:text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                  isScrolled ? 'text-pj-navy' : 'text-pj-navy'
                }`}>
                  ParkerJoe
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div
              ref={linksRef}
              className="hidden lg:flex items-center space-x-8"
            >
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => handleLinkHover(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={link.href}
                    className={`flex items-center text-sm font-medium tracking-wide transition-colors duration-300 ${
                      link.isHighlight
                        ? 'text-red-500 hover:text-red-600'
                        : link.isSpecial
                        ? 'text-pj-gold hover:text-pj-navy'
                        : isScrolled
                        ? 'text-pj-charcoal hover:text-pj-blue'
                        : 'text-pj-charcoal hover:text-pj-blue'
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </a>

                  {/* Mega Menu Dropdown */}
                  {link.name === 'Shop' && activeDropdown === 'Shop' && (
                    <div className="absolute top-full left-0 mt-4 w-[600px] bg-white rounded-lg shadow-xl p-6 animate-fade-in">
                      <div className="grid grid-cols-3 gap-4">
                        {shopDropdownItems.map((item) => (
                          <a
                            key={item.name}
                            href={`/collections/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                            className="group"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <span className="text-sm font-medium text-pj-charcoal group-hover:text-pj-blue">
                              {item.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Icons */}
            <div ref={iconsRef} className="flex items-center space-x-4">
              <button
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isScrolled
                    ? 'hover:bg-pj-light-gray text-pj-charcoal'
                    : 'hover:bg-white/20 text-pj-charcoal'
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isScrolled
                    ? 'hover:bg-pj-light-gray text-pj-charcoal'
                    : 'hover:bg-white/20 text-pj-charcoal'
                }`}
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={onCartClick}
                className={`p-2 rounded-full transition-colors duration-300 relative ${
                  isScrolled
                    ? 'hover:bg-pj-light-gray text-pj-charcoal'
                    : 'hover:bg-white/20 text-pj-charcoal'
                }`}
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pj-gold text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-pj-light-gray transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`block text-lg font-medium py-2 ${
                    link.isHighlight
                      ? 'text-red-500'
                      : link.isSpecial
                      ? 'text-pj-gold'
                      : 'text-pj-charcoal'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
