# ParkerJoe Website - Agent Documentation

## Project Overview

This is **ParkerJoe**, a premium e-commerce website for a boys-only retail clothing brand. The project is a single-page React application with rich animations and a shopping cart feature.

The website showcases:
- Product categories (Apparel, Shoes, Accessories, Dresswear, Western, Toys & Books)
- New arrivals and best sellers
- Seasonal campaigns and gift guides
- Store locations
- Founder story and brand narrative
- Shopping cart with free shipping progress indicator

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Build Tool | Vite | 7.2.4 |
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Library | shadcn/ui | New York style |
| Animation | GSAP | 3.14.2 |
| Icons | Lucide React | 0.562.0 |
| Forms | React Hook Form | 7.70.0 |
| Validation | Zod | 4.3.5 |

### Additional Key Dependencies
- `@studio-freight/lenis` - Smooth scrolling
- `embla-carousel-react` - Carousel component
- `recharts` - Data visualization
- `sonner` - Toast notifications
- `date-fns` - Date utilities

## Project Structure

```
app/
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # TypeScript app config
├── tsconfig.node.json      # TypeScript node config
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── components.json         # shadcn/ui configuration
├── public/                 # Static assets (images)
│   ├── hero-main.jpg
│   ├── category-*.jpg
│   ├── product-*.jpg
│   └── store-*.jpg
├── src/
│   ├── main.tsx            # Application entry point
│   ├── App.tsx             # Root component
│   ├── index.css           # Global styles with CSS variables
│   ├── App.css             # Component-specific styles
│   ├── sections/           # Page section components (12 files)
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── CategoryNavigator.tsx
│   │   ├── NewArrivals.tsx
│   │   ├── SeasonalCampaign.tsx
│   │   ├── BestSellers.tsx
│   │   ├── FeaturedBrands.tsx
│   │   ├── GiftGuide.tsx
│   │   ├── FounderStory.tsx
│   │   ├── StoreLocations.tsx
│   │   ├── EmailCapture.tsx
│   │   └── Footer.tsx
│   ├── components/
│   │   ├── CartDrawer.tsx  # Shopping cart slide-out drawer
│   │   └── ui/             # 40+ shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   ├── context/
│   │   └── CartContext.tsx # Shopping cart state management
│   ├── hooks/
│   │   └── use-mobile.ts   # Mobile breakpoint detection
│   └── lib/
│       └── utils.ts        # Utility functions (cn helper)
└── dist/                   # Build output directory
```

## Build and Development Commands

All commands should be run from the `app/` directory:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

The dev server runs on Vite's default port (usually 5173).

## Code Style Guidelines

### TypeScript Configuration
- Strict mode is **enabled**
- Target: ES2022
- Module: ESNext with bundler resolution
- Path alias: `@/` maps to `./src/`
- No unused locals or parameters allowed
- Enforces explicit side effect imports

### Component Patterns

1. **Section Components** (`src/sections/*.tsx`):
   - Default exports
   - Use functional components with hooks
   - GSAP animations wrapped in `useEffect` with context cleanup
   - Use `useRef` for DOM element references

   Example:
   ```tsx
   import { useEffect, useRef } from 'react';
   import { gsap } from 'gsap';
   
   export default function SectionName() {
     const sectionRef = useRef<HTMLElement>(null);
     
     useEffect(() => {
       const ctx = gsap.context(() => {
         // Animation logic
       }, sectionRef);
       
       return () => ctx.revert();
     }, []);
     
     return <section ref={sectionRef}>...</section>;
   }
   ```

2. **shadcn/ui Components** (`src/components/ui/*.tsx`):
   - Use `class-variance-authority` (CVA) for variant management
   - Import `cn` utility from `@/lib/utils` for class merging
   - Follow the pattern: `ComponentProps<"element"> & VariantProps<typeof variants>`
   - Support `asChild` prop using Radix Slot

3. **Custom Hooks** (`src/hooks/*.ts`):
   - Named exports with `use` prefix
   - Include proper cleanup in useEffect

### Styling Conventions

1. **Tailwind CSS Classes**:
   - Use custom ParkerJoe brand colors with `pj-` prefix:
     - `pj-navy` (#0F1F3C) - Primary brand color
     - `pj-blue` (#84A7D5) - Secondary accent
     - `pj-gold` (#C8A464) - Highlight/accent
     - `pj-cream` (#FAFAF8) - Background
     - `pj-charcoal` (#1A1A1A) - Text
     - `pj-gray` (#737373) - Muted text
     - `pj-light-gray` (#F2F2F2) - Borders/subtle backgrounds

2. **Typography**:
   - Headings: `'Cormorant Garamond', serif`
   - Body: `'Inter', sans-serif`
   - Use `.font-display` and `.font-body` utility classes

3. **Custom CSS Classes** (in `index.css`):
   - `.hover-lift` - Transform on hover
   - `.glass` - Backdrop blur effect
   - `.gradient-overlay` - Gradient backgrounds
   - Animation utilities: `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in`
   - Delay utilities: `.animation-delay-100` through `.animation-delay-500`

### Import Organization
1. React imports first
2. Third-party libraries (GSAP, Lucide icons)
3. Local components with `@/` aliases
4. Relative imports for closely related files

Example:
```tsx
import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
```

## Key Architectural Patterns

### State Management
- **Cart State**: React Context API with `CartProvider`
- **Cart Interface**: `CartItem` with id, name, brand, price, size, color, image, quantity
- **Cart Operations**: addItem, removeItem, updateQuantity, clearCart
- **Derived State**: totalItems, subtotal computed from items array

### Animation Strategy
- **GSAP + ScrollTrigger**: Used for scroll-based animations and entrance effects
- **Context Pattern**: Always wrap GSAP animations in `gsap.context()` for proper cleanup
- **ScrollTrigger Defaults**: Set in `App.tsx` with `toggleActions: 'play none none reverse'`
- **Cleanup**: Kill all ScrollTriggers on component unmount

### Responsive Design
- Mobile breakpoint: 768px (defined in `use-mobile.ts`)
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach
- Mobile menu handled in Navigation component

### Accessibility
- ARIA labels on icon buttons
- Semantic HTML structure
- Proper heading hierarchy
- Focus states styled with `focus-visible:`

## Testing

Currently, this project does **not** have automated tests configured. The testing strategy relies on:
- TypeScript for compile-time type checking
- ESLint for code quality
- Manual testing during development

To add testing, consider:
- Vitest (aligned with Vite)
- React Testing Library
- Playwright for E2E testing

## Build Output

The production build outputs to `app/dist/`:
- `index.html` - Main HTML entry
- `assets/` - Bundled JS and CSS with hashed filenames
- Static images copied from `public/`

Vite config uses `base: './'` for relative path resolution.

## Important Implementation Notes

1. **Image Assets**: All product and category images are in `/public/` and referenced with root-relative paths (e.g., `/hero-main.jpg`)

2. **Cart Drawer**: Uses GSAP for slide-in animation rather than CSS transitions for smoother performance

3. **Navigation**: 
   - Sticky with glass morphism effect on scroll
   - Mega menu dropdown for Shop category
   - Mobile hamburger menu with slide-out panel

4. **Free Shipping**: Threshold set at $100, progress bar shown in cart drawer

5. **No Backend**: This is a static frontend demo. Cart state persists only during session.

## Security Considerations

- No sensitive data or API keys in client-side code
- All user inputs (if any) should be validated with Zod
- ESLint configured to catch common security issues

## shadcn/ui Components Available

The following shadcn/ui components are pre-installed and ready to use:
- Layout: card, separator, scroll-area, resizable, sidebar
- Forms: button, input, textarea, checkbox, radio-group, select, switch, slider, calendar, form
- Overlays: dialog, drawer, sheet, alert-dialog, popover, tooltip, hover-card
- Navigation: navigation-menu, tabs, breadcrumb, pagination, command
- Feedback: alert, progress, skeleton, sonner, spinner
- Data Display: table, badge, avatar, chart, carousel
- And more...

Import pattern: `import { Button } from '@/components/ui/button'`
