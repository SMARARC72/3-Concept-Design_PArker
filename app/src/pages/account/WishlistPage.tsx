import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Share2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const mockWishlistItems = [
  { id: '1', name: 'Classic Polo Shirt', brand: 'Properly Tied', price: 48, image: '/product-1.jpg', sizes: ['2T', '3T', '4T', '5T'], inStock: true },
  { id: '2', name: 'Chino Shorts', brand: 'ParkerJoe', price: 42, image: '/product-2.jpg', sizes: ['2T', '3T', '4T'], inStock: true },
  { id: '3', name: 'Button Down Shirt', brand: 'Southern Tide', price: 56, image: '/product-3.jpg', sizes: ['4T', '5T', '6', '7'], inStock: false },
  { id: '4', name: 'Summer Blazer', brand: 'J.Bailey', price: 78, image: '/product-4.jpg', sizes: ['6', '7', '8'], inStock: true },
  { id: '5', name: 'Crew Socks (3-Pack)', brand: 'ParkerJoe', price: 18, image: '/product-5.jpg', sizes: ['One Size'], inStock: true },
  { id: '6', name: 'Dress Pants', brand: 'Properly Tied', price: 65, image: '/product-6.jpg', sizes: ['3T', '4T', '5T'], inStock: true },
];

export function WishlistPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [selectedItem, setSelectedItem] = useState<typeof mockWishlistItems[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.wishlist-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleRemoveItem = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (item: typeof mockWishlistItems[0]) => {
    if (!selectedSize) return;
    addItem({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      size: selectedSize,
      color: 'Default',
      image: item.image,
    });
    setSelectedItem(null);
    setSelectedSize('');
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  if (wishlistItems.length === 0) {
    return (
      <div ref={pageRef} className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-pj-light-gray flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-pj-gray" />
        </div>
        <h2 className="font-display text-2xl text-pj-navy mb-2">Your Wishlist is Empty</h2>
        <p className="text-pj-gray mb-6">Save your favorite items to find them quickly later.</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-pj-navy text-white px-6 py-3 rounded-lg hover:bg-pj-blue transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-pj-navy">My Wishlist</h1>
            <p className="text-sm text-pj-gray">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Wishlist
          </button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlistItems.map((item) => (
          <div key={item.id} className="wishlist-item bg-white rounded-xl shadow-sm overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square bg-pj-light-gray">
              <Link to={`/products/${item.id}`}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              {!item.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                </div>
              )}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-xs text-pj-gray mb-1">{item.brand}</p>
              <Link to={`/products/${item.id}`}>
                <h3 className="font-medium text-pj-navy hover:text-pj-blue transition-colors mb-2">
                  {item.name}
                </h3>
              </Link>
              <p className="font-display text-lg text-pj-charcoal mb-3">${item.price}</p>

              {item.inStock ? (
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full flex items-center justify-center gap-2 bg-pj-navy text-white py-2 rounded-lg hover:bg-pj-blue transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Size Selection Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setSelectedSize(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-pj-navy">Select Size</DialogTitle>
            <DialogDescription className="text-pj-gray">
              Choose a size for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-pj-light-gray">
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-pj-navy">{selectedItem.name}</p>
                  <p className="text-pj-gray">{selectedItem.brand}</p>
                  <p className="font-display text-lg text-pj-charcoal">${selectedItem.price}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-pj-charcoal mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size
                          ? 'bg-pj-navy text-white border-pj-navy'
                          : 'border-gray-200 hover:border-pj-blue'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(selectedItem)}
                disabled={!selectedSize}
                className="w-full flex items-center justify-center gap-2 bg-pj-navy text-white py-3 rounded-lg hover:bg-pj-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-pj-navy">Share Your Wishlist</DialogTitle>
            <DialogDescription className="text-pj-gray">
              Send your wishlist to friends and family
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-pj-charcoal mb-2">Wishlist Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://parkerjoe.com/wishlist/u/sarah-johnson"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText('https://parkerjoe.com/wishlist/u/sarah-johnson')}
                  className="px-4 py-2 bg-pj-navy text-white rounded-lg hover:bg-pj-blue transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-pj-charcoal mb-3">Share via</p>
              <div className="flex gap-3">
                <button className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Email
                </button>
                <button className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  SMS
                </button>
                <button className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WishlistPage;
