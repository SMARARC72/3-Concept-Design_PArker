import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, LogOut, Crown, Gift, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';


interface NavigationProps {
  onCartClick?: () => void;
}

const navLinks = [
  { name: 'Shop', href: '/shop', hasDropdown: true },
  { name: 'Brands', href: '/collections/brands', hasDropdown: true },
  { name: 'Occasions', href: '/collections/occasions', hasDropdown: true },
  { name: 'Gifts', href: '/collections/gifts', hasDropdown: false },
  { name: 'Sale', href: '/collections/sale', hasDropdown: false, isHighlight: true },
  { name: 'Events', href: '/events', hasDropdown: false },
  { name: 'PJ Style Lounge', href: '/style-lounge', hasDropdown: false, isSpecial: true },
  { name: 'Members', href: '/members', hasDropdown: false, isSpecial: true },
  { name: 'Our Story', href: '/our-story', hasDropdown: false },
];

const shopDropdownItems = [
  { name: 'Apparel', handle: 'apparel', image: '/category-apparel.jpg' },
  { name: 'Shoes', handle: 'shoes', image: '/category-shoes.jpg' },
  { name: 'Accessories', handle: 'accessories', image: '/category-accessories.jpg' },
  { name: 'Dresswear', handle: 'dresswear', image: '/category-dresswear.jpg' },
  { name: 'Western', handle: 'western', image: '/category-western.jpg' },
  { name: 'Toys & Books', handle: 'toys-books', image: '/category-gifts.jpg' },
];

const brandsDropdownItems = [
  { name: 'Properly Tied', handle: 'properly-tied', image: '/brand-1.jpg' },
  { name: 'J.Bailey', handle: 'jbailey', image: '/brand-2.jpg' },
  { name: 'Southern Tide', handle: 'southern-tide', image: '/brand-3.jpg' },
  { name: 'ParkerJoe', handle: 'parkerjoe', image: '/brand-4.jpg' },
  { name: 'Little English', handle: 'little-english', image: '/brand-5.jpg' },
  { name: 'Bailey Boys', handle: 'bailey-boys', image: '/brand-6.jpg' },
];

const occasionsDropdownItems = [
  { name: 'Easter', handle: 'easter', image: '/occasion-easter.jpg' },
  { name: 'Spring', handle: 'spring', image: '/occasion-spring.jpg' },
  { name: 'Birthday', handle: 'birthday', image: '/occasion-birthday.jpg' },
  { name: 'Wedding', handle: 'wedding', image: '/occasion-wedding.jpg' },
  { name: 'Back to School', handle: 'back-to-school', image: '/occasion-school.jpg' },
  { name: 'Holiday', handle: 'holiday', image: '/occasion-holiday.jpg' },
];

export default function Navigation({ onCartClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsAccountDropdownOpen(false);
  };

  const getDropdownItems = () => {
    switch (activeDropdown) {
      case 'Shop': return shopDropdownItems;
      case 'Brands': return brandsDropdownItems;
      case 'Occasions': return occasionsDropdownItems;
      default: return [];
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
              <Link to="/" className="flex items-center">
                <span className={`font-display text-2xl lg:text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                  isScrolled ? 'text-pj-navy' : 'text-pj-navy'
                }`}>
                  ParkerJoe
                </span>
              </Link>
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
                  <button
                    onClick={() => handleNavClick(link.href)}
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
                  </button>

                  {/* Mega Menu Dropdown */}
                  {activeDropdown === link.name && link.hasDropdown && (
                    <div className="absolute top-full left-0 mt-4 w-[600px] bg-white rounded-lg shadow-xl p-6 animate-fade-in">
                      <div className="grid grid-cols-3 gap-4">
                        {getDropdownItems().map((item) => (
                          <Link
                            key={item.name}
                            to={`/collections/${item.handle}`}
                            className="group"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-pj-light-gray">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-pj-charcoal group-hover:text-pj-blue">
                              {item.name}
                            </span>
                          </Link>
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
              
              {/* Account Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <button
                  onClick={() => isAuthenticated ? navigate('/account') : navigate('/auth/login')}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isScrolled
                      ? 'hover:bg-pj-light-gray text-pj-charcoal'
                      : 'hover:bg-white/20 text-pj-charcoal'
                  }`}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Account Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 animate-fade-in">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-pj-navy">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm text-pj-gray truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/account/orders"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/account/wishlist"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <Link
                          to="/members"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors flex items-center gap-2"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <Crown className="w-4 h-4 text-pj-gold" />
                          Members Only
                        </Link>
                        <Link
                          to="/account/points-rewards"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors flex items-center gap-2"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <Award className="w-4 h-4" />
                          Points & Rewards
                        </Link>
                        <Link
                          to="/account/gift-cards"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors flex items-center gap-2"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <Gift className="w-4 h-4" />
                          Gift Cards
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth/login"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/auth/signup"
                          className="block px-4 py-2 text-sm text-pj-charcoal hover:bg-pj-cream transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

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
            {/* Mobile User Section */}
            {isAuthenticated ? (
              <div className="mb-6 p-4 bg-pj-cream rounded-lg">
                <p className="font-medium text-pj-navy">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-pj-gray">{user?.email}</p>
              </div>
            ) : (
              <div className="mb-6 space-y-2">
                <Link
                  to="/auth/login"
                  className="block w-full text-center bg-pj-navy text-white py-3 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="block w-full text-center border border-pj-navy text-pj-navy py-3 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <Link
                to="/shop"
                className="block text-lg font-medium py-2 text-pj-charcoal"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop All
              </Link>
              {shopDropdownItems.map((item) => (
                <Link
                  key={item.name}
                  to={`/collections/${item.handle}`}
                  className="block text-base py-2 pl-4 text-pj-gray hover:text-pj-blue"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {navLinks.slice(1).map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className={`block w-full text-left text-lg font-medium py-2 ${
                      link.isHighlight
                        ? 'text-red-500'
                        : link.isSpecial
                        ? 'text-pj-gold'
                        : 'text-pj-charcoal'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              {/* Mobile Account Links */}
              {isAuthenticated && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-sm font-medium text-pj-gray mb-2">My Account</p>
                  <Link
                    to="/account"
                    className="block text-base py-2 text-pj-charcoal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/account/orders"
                    className="block text-base py-2 text-pj-charcoal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/account/wishlist"
                    className="block text-base py-2 text-pj-charcoal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-base py-2 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
