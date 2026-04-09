import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Heart, Share2, Truck, RotateCcw, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Mock product data - replace with Shopify API
const mockProduct = {
  id: 1,
  title: 'Navy Button-Down Shirt',
  brand: 'Properly Tied',
  price: 34.99,
  compareAtPrice: 42.99,
  description: 'A classic navy button-down shirt perfect for any occasion. Made from premium cotton for all-day comfort. Features mother-of-pearl buttons and a tailored fit that looks sharp whether paired with dress pants or casual shorts.',
  images: ['/product-1.jpg', '/product-2.jpg', '/product-3.jpg'],
  sizes: ['2T', '3T', '4T', '5T', '6', '7', '8'],
  colors: ['Navy', 'White', 'Light Blue'],
  features: [
    '100% Premium Cotton',
    'Mother-of-pearl buttons',
    'Machine washable',
    'Wrinkle-resistant finish'
  ],
  shipping: 'Free shipping on orders over $100',
  returns: 'Easy 30-day returns'
};

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Entrance animation
    gsap.fromTo(
      '.product-image-main',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.product-details',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
    );
  }, [handle]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    // Add item multiple times if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: mockProduct.id,
        name: mockProduct.title,
        brand: mockProduct.brand,
        price: mockProduct.price,
        size: selectedSize,
        color: selectedColor,
        image: mockProduct.images[0],
      });
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="w-full px-6 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="py-4 text-sm text-pj-gray">
          <span className="cursor-pointer hover:text-pj-blue" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-pj-blue" onClick={() => navigate('/shop')}>Shop</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-pj-blue" onClick={() => navigate('/collections/apparel')}>Apparel</span>
          <span className="mx-2">/</span>
          <span className="text-pj-navy">{mockProduct.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="product-image-main">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4">
              {mockProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? 'border-pj-gold' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <p className="text-pj-gray mb-2">{mockProduct.brand}</p>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-pj-navy mb-4">
              {mockProduct.title}
            </h1>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-pj-navy">
                ${mockProduct.price.toFixed(2)}
              </span>
              {mockProduct.compareAtPrice && (
                <span className="text-lg text-pj-gray line-through">
                  ${mockProduct.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-pj-charcoal mb-8 leading-relaxed">
              {mockProduct.description}
            </p>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block font-medium text-pj-navy mb-3">
                Color: <span className="font-normal">{selectedColor}</span>
              </label>
              <div className="flex gap-3">
                {mockProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedColor === color
                        ? 'border-pj-gold bg-pj-gold/5'
                        : 'border-gray-200 hover:border-pj-gold'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block font-medium text-pj-navy mb-3">
                Size: {selectedSize && <span className="font-normal text-pj-blue">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {mockProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border rounded-lg transition-colors ${
                      selectedSize === size
                        ? 'border-pj-gold bg-pj-gold text-white'
                        : 'border-gray-200 hover:border-pj-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button className="text-sm text-pj-blue hover:underline mt-2">
                Size Guide
              </button>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-medium text-pj-navy mb-3">Quantity</label>
              <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-pj-gold text-white font-semibold rounded-lg hover:bg-pj-gold/90 transition-colors"
              >
                Add to Cart
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-pj-gold transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-pj-gold transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-pj-gray">
                <Truck className="w-5 h-5" />
                <span>{mockProduct.shipping}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-pj-gray">
                <RotateCcw className="w-5 h-5" />
                <span>{mockProduct.returns}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-pj-gray">
                <Shield className="w-5 h-5" />
                <span>Secure checkout</span>
              </div>
            </div>

            {/* Product Features */}
            <div className="py-6 border-t border-gray-100">
              <h3 className="font-medium text-pj-navy mb-3">Features</h3>
              <ul className="space-y-2">
                {mockProduct.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-pj-gray">
                    <span className="w-1.5 h-1.5 bg-pj-gold rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
