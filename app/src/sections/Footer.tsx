import { Instagram, Facebook, MapPin, Mail, Phone } from 'lucide-react';

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/collections/new-arrivals' },
    { name: 'Best Sellers', href: '/collections/best-sellers' },
    { name: 'Apparel', href: '/collections/apparel' },
    { name: 'Shoes', href: '/collections/shoes' },
    { name: 'Accessories', href: '/collections/accessories' },
    { name: 'Sale', href: '/collections/sale' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Gift Cards', href: '/gift-cards' },
  ],
  company: [
    { name: 'Our Story', href: '/our-story' },
    { name: 'Stores', href: '/stores' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Wholesale', href: '/wholesale' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/parkerjoe' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/parkerjoe' },
];

export default function Footer() {
  return (
    <footer className="bg-pj-navy text-white">
      {/* Main Footer */}
      <div className="w-full px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a href="/" className="inline-block mb-6">
              <span className="font-display text-3xl font-semibold">
                ParkerJoe
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              A premium, curated boys-only retail concept built to make boys feel
              seen, styled, and celebrated.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pj-gold transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-medium text-sm tracking-widest uppercase mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-medium text-sm tracking-widest uppercase mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-medium text-sm tracking-widest uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium text-sm tracking-widest uppercase mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-pj-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  2400 University Blvd<br />
                  Houston, TX 77005
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-pj-gold flex-shrink-0" />
                <a
                  href="tel:+17135550123"
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  (713) 555-0123
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-pj-gold flex-shrink-0" />
                <a
                  href="mailto:hello@parkerjoe.com"
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  hello@parkerjoe.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} ParkerJoe. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="/privacy"
                className="text-white/50 text-sm hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-white/50 text-sm hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/accessibility"
                className="text-white/50 text-sm hover:text-white transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
