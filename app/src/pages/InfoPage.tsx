import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';

interface InfoContent {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  ctaHref: string;
  ctaLabel: string;
}

const infoPages: Record<string, InfoContent> = {
  contact: {
    eyebrow: 'Customer Care',
    title: 'Contact ParkerJoe',
    intro:
      'Reach our boutique team for sizing help, styling guidance, order questions, or store support.',
    bullets: [
      'Email hello@parkerjoe.com for general support and styling assistance.',
      'Call (713) 555-0123 during boutique hours for immediate help.',
      'Visit our Houston flagship for in-person fittings and gift recommendations.',
    ],
    ctaHref: '/our-story',
    ctaLabel: 'Meet the brand',
  },
  faqs: {
    eyebrow: 'Support',
    title: 'Frequently Asked Questions',
    intro:
      'Everything shoppers typically need before ordering, gifting, or visiting ParkerJoe in person.',
    bullets: [
      'Most online orders ship within two business days.',
      'Free shipping applies automatically on orders over $100.',
      'Need sizing guidance? Use the size guide or contact the store team before checkout.',
    ],
    ctaHref: '/size-guide',
    ctaLabel: 'View size guide',
  },
  shipping: {
    eyebrow: 'Shipping',
    title: 'Shipping Information',
    intro:
      'ParkerJoe ships premium boyswear nationwide with boutique-level service and order support.',
    bullets: [
      'Orders over $100 qualify for complimentary standard shipping.',
      'Tracking details are shared as soon as a shipment leaves the boutique.',
      'Rush delivery can be arranged for time-sensitive events when inventory is available.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Ask about rush shipping',
  },
  returns: {
    eyebrow: 'Returns',
    title: 'Returns and Exchanges',
    intro:
      'We keep exchanges simple so families can buy confidently for fast-growing boys and event dressing.',
    bullets: [
      'Returns are accepted within 30 days on unworn merchandise.',
      'Eventwear and personalized items may have special return conditions.',
      'Our team can help swap sizes quickly when inventory is in stock.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Start a return conversation',
  },
  'size-guide': {
    eyebrow: 'Fit Help',
    title: 'Sizing Guide',
    intro:
      'Use this page as a starting point, then contact ParkerJoe for personalized fit help when you need a second opinion.',
    bullets: [
      'Measure chest, waist, height, and shoe size before ordering.',
      'If a child is between sizes, we typically recommend sizing up for longevity.',
      'Formalwear and western styles may fit differently across brands.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Get personalized sizing help',
  },
  'gift-cards': {
    eyebrow: 'Gifting',
    title: 'Gift Cards',
    intro:
      'Share ParkerJoe with families who want boutique styling, occasionwear, and thoughtful gifting options.',
    bullets: [
      'Gift cards can be used on core collection purchases and seasonal drops.',
      'Boutique staff can recommend an amount based on age, season, or event needs.',
      'Members can also manage promotional gift balances inside their account.',
    ],
    ctaHref: '/shop',
    ctaLabel: 'Browse gift-worthy picks',
  },
  stores: {
    eyebrow: 'Boutique',
    title: 'Store Locations',
    intro:
      'Visit ParkerJoe for personal styling, event-ready outfits, and a curated in-store experience.',
    bullets: [
      'Houston flagship: 2400 University Blvd, Houston, TX 77005.',
      'Las Vegas seasonal concept events are announced on the Events page.',
      'Appointments can be arranged for occasionwear and gifting support.',
    ],
    ctaHref: '/events',
    ctaLabel: 'See upcoming events',
  },
  careers: {
    eyebrow: 'Company',
    title: 'Careers at ParkerJoe',
    intro:
      'We are building a boutique retail experience centered on premium service, styling confidence, and memorable family moments.',
    bullets: [
      'Retail and styling candidates should be confident working one-on-one with families.',
      'Event support and community activation experience are valued for seasonal launches.',
      'Send interest and resumes to hello@parkerjoe.com.',
    ],
    ctaHref: '/our-story',
    ctaLabel: 'See the brand story',
  },
  press: {
    eyebrow: 'Press',
    title: 'Press and Media',
    intro:
      'Media inquiries, collaboration opportunities, and brand background are available through ParkerJoe customer care.',
    bullets: [
      'Request brand information, founder background, and store imagery through customer care.',
      'We can coordinate interviews tied to launches, events, or seasonal campaigns.',
      'Press kits are provided on request for approved opportunities.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Contact media relations',
  },
  wholesale: {
    eyebrow: 'Partnerships',
    title: 'Wholesale and Brand Partnerships',
    intro:
      'ParkerJoe curates premium assortments with a strong point of view around occasion, gifting, and everyday luxury.',
    bullets: [
      'We evaluate product quality, fit reliability, and brand alignment first.',
      'Seasonal exclusives and capsule collaborations can be reviewed with the buying team.',
      'Partnership inquiries should include line sheets and fulfillment details.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Introduce your brand',
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'ParkerJoe is committed to handling customer information responsibly and with clear notice around how it is used.',
    bullets: [
      'Only the information needed to support orders, accounts, and communications should be collected.',
      'Marketing subscriptions must remain optional and easy to manage.',
      'Children-facing experiences require special care when any data is involved.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Ask a privacy question',
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro:
      'Order, payment, promotional, and account behavior expectations should be clearly communicated before launch.',
    bullets: [
      'Merchandise availability and pricing can change without notice.',
      'Return rules and promotional exclusions should be visible before checkout.',
      'Account access and rewards participation may be limited if misuse is detected.',
    ],
    ctaHref: '/returns',
    ctaLabel: 'Review returns policy',
  },
  accessibility: {
    eyebrow: 'Accessibility',
    title: 'Accessibility Commitment',
    intro:
      'ParkerJoe aims to provide a browsing and shopping experience that remains clear, navigable, and inclusive.',
    bullets: [
      'Color contrast, keyboard support, semantic structure, and clear error messaging should be maintained.',
      'Shoppers who need assistance should be able to contact the boutique directly.',
      'Accessibility improvements should be incorporated as part of routine release work.',
    ],
    ctaHref: '/contact',
    ctaLabel: 'Request accessibility support',
  },
};

export default function InfoPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+/, '');
  const content = infoPages[slug] ?? infoPages.contact;

  return (
    <div className="pt-24 pb-20">
      <section className="bg-pj-navy text-white">
        <div className="w-full px-6 lg:px-12 py-20 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.35em] text-pj-gold mb-5">
              {content.eyebrow}
            </p>
            <h1 className="font-display text-4xl lg:text-6xl font-semibold mb-6">
              {content.title}
            </h1>
            <p className="max-w-2xl text-lg text-white/75">{content.intro}</p>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="w-full px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="rounded-[2rem] bg-white p-8 lg:p-10 shadow-sm">
              <h2 className="font-display text-3xl text-pj-navy mb-6">
                What shoppers should know
              </h2>
              <div className="space-y-4">
                {content.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-start gap-4 rounded-2xl border border-pj-light-gray bg-pj-cream/40 p-5"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-pj-gold shrink-0" />
                    <p className="text-pj-charcoal leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>

              <Link
                to={content.ctaHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-pj-gold px-6 py-3 font-medium text-white transition-colors hover:bg-pj-gold/90"
              >
                {content.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <h2 className="font-display text-2xl text-pj-navy mb-5">
                  Boutique Support
                </h2>
                <div className="space-y-4 text-pj-charcoal">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-pj-gold shrink-0" />
                    <p>
                      2400 University Blvd
                      <br />
                      Houston, TX 77005
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-pj-gold shrink-0" />
                    <a href="tel:+17135550123" className="hover:text-pj-blue transition-colors">
                      (713) 555-0123
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-pj-gold shrink-0" />
                    <a href="mailto:hello@parkerjoe.com" className="hover:text-pj-blue transition-colors">
                      hello@parkerjoe.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-pj-gold shrink-0" />
                    <p>Monday through Saturday, 10 AM to 6 PM</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-pj-navy/10 bg-pj-cream p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-pj-gold mb-3">
                  Need a faster answer?
                </p>
                <h2 className="font-display text-2xl text-pj-navy mb-3">
                  Let our team guide the next step.
                </h2>
                <p className="text-pj-gray mb-5">
                  For eventwear, sizing, or gifting help, contact the store and we
                  will point you to the right product or page.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 font-medium text-pj-navy hover:text-pj-blue transition-colors"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
