import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Filter, ChevronDown } from 'lucide-react';

// Mock product data - replace with actual Shopify API call
const mockProducts = [
  { id: 1, title: 'Navy Button-Down Shirt', brand: 'Properly Tied', price: 34.99, image: '/product-1.jpg', sizes: ['2T', '3T', '4T', '5T'] },
  { id: 2, title: 'Classic Polo Set', brand: 'James & Lottie', price: 45.99, image: '/product-2.jpg', sizes: ['2T', '3T', '4T', '5T', '6'] },
  { id: 3, title: 'Western Boots', brand: 'Shadow Play', price: 59.99, image: '/product-3.jpg', sizes: ['5', '6', '7', '8'] },
  { id: 4, title: 'Striped Oxford Shirt', brand: 'Properly Tied', price: 38.99, image: '/product-1.jpg', sizes: ['3T', '4T', '5T'] },
  { id: 5, title: 'Casual Shorts Set', brand: 'James & Lottie', price: 42.99, image: '/product-2.jpg', sizes: ['2T', '3T', '4T', '5T', '6', '7'] },
  { id: 6, title: 'Leather Loafers', brand: 'Shadow Play', price: 49.99, image: '/product-3.jpg', sizes: ['6', '7', '8', '9'] },
];

const collectionData: Record<string, { name: string; description: string; image: string }> = {
  apparel: { name: 'Apparel', description: 'Everyday essentials and stylish clothing pieces', image: '/category-apparel.jpg' },
  shoes: { name: 'Shoes', description: 'Comfortable footwear for every occasion', image: '/category-shoes.jpg' },
  accessories: { name: 'Accessories', description: 'Bows, ties, socks and more', image: '/category-accessories.jpg' },
  dresswear: { name: 'Dresswear', description: 'Special occasion outfits', image: '/category-dresswear.jpg' },
  western: { name: 'Western', description: 'Rodeo-ready styles', image: '/category-western.jpg' },
  'toys-books': { name: 'Toys & Books', description: 'Fun and educational gifts', image: '/category-gifts.jpg' },
};

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [products] = useState(mockProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const collection = handle ? collectionData[handle] : null;

  useEffect(() => {
    if (!collection) {
      navigate('/shop');
      return;
    }

    // Entrance animation
    gsap.fromTo(
      '.collection-hero',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.product-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
    );
  }, [collection, navigate]);

  if (!collection) return null;

  return (
    <div className="pt-24 pb-16">
      {/* Hero Banner */}
      <section className="collection-hero relative h-[40vh] min-h-[300px]">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-pj-navy/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="font-display text-4xl lg:text-6xl font-semibold mb-4">
              {collection.name}
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl">
              {collection.description}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12 lg:py-16">
        <div className="w-full px-6 lg:px-12">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <p className="text-pj-gray">{products.length} products</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-pj-gold transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 hover:border-pj-gold transition-colors cursor-pointer">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-medium text-pj-navy mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {['2T', '3T', '4T', '5T', '6', '7', '8'].map(size => (
                      <button key={size} className="px-3 py-1 border border-gray-200 rounded hover:border-pj-gold hover:bg-pj-gold/5 transition-colors text-sm">
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-pj-navy mb-3">Brand</h4>
                  <div className="space-y-2">
                    {['Properly Tied', 'James & Lottie', 'Shadow Play'].map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-pj-navy mb-3">Price</h4>
                  <div className="space-y-2">
                    {['Under $25', '$25 - $50', '$50 - $100', 'Over $100'].map(price => (
                      <label key={price} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card group cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Quick Add Button */}
                  <button className="absolute bottom-4 left-4 right-4 py-3 bg-white text-pj-navy font-medium rounded-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-pj-gold hover:text-white">
                    Quick Add
                  </button>
                </div>
                <p className="text-sm text-pj-gray mb-1">{product.brand}</p>
                <h3 className="font-medium text-pj-navy mb-2 group-hover:text-pj-blue transition-colors">
                  {product.title}
                </h3>
                <p className="font-semibold text-pj-navy">${product.price.toFixed(2)}</p>
                
                {/* Size Quick Select */}
                <div className="flex gap-1 mt-2">
                  {product.sizes.slice(0, 4).map(size => (
                    <span key={size} className="text-xs px-2 py-1 border border-gray-200 rounded hover:border-pj-gold hover:bg-pj-gold/5 cursor-pointer transition-colors">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
