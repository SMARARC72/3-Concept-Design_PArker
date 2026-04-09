import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;

    if (!drawer || !overlay) return;

    if (isOpen) {
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(drawer, {
        x: 0,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(drawer, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 z-50 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-pj-navy" />
            <h2 className="font-display text-xl text-pj-navy">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-pj-light-gray flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-6 py-4 bg-pj-cream border-b">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-pj-blue" />
              <p className="text-sm text-pj-charcoal">
                {amountToFreeShipping > 0 ? (
                  <>
                    Add{' '}
                    <span className="font-medium text-pj-navy">
                      ${amountToFreeShipping.toFixed(2)}
                    </span>{' '}
                    more for free shipping
                  </>
                ) : (
                  <span className="text-pj-gold font-medium">
                    You've earned free shipping!
                  </span>
                )}
              </p>
            </div>
            <div className="h-2 bg-pj-light-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-pj-blue rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-pj-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-pj-gray" />
              </div>
              <h3 className="font-display text-xl text-pj-navy mb-2">
                Your cart is empty
              </h3>
              <p className="text-pj-gray mb-6">
                Discover our latest collections and find something special.
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-pj-navy text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-pj-blue transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 pb-6 border-b"
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-pj-light-gray flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm text-pj-gray">{item.brand}</p>
                        <h4 className="font-medium text-pj-charcoal">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-pj-gray hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-pj-gray mb-3">
                      {item.color} / Size {item.size}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full border border-pj-light-gray flex items-center justify-center hover:bg-pj-light-gray transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full border border-pj-light-gray flex items-center justify-center hover:bg-pj-light-gray transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-medium text-pj-navy">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-pj-cream">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-pj-gray">Subtotal</span>
              <span className="font-display text-xl text-pj-navy">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-pj-gray mb-4">
              Shipping and taxes calculated at checkout.
            </p>

            {/* Checkout Button */}
            <button className="w-full bg-pj-navy text-white py-4 rounded-full font-medium hover:bg-pj-blue transition-colors mb-3">
              Proceed to Checkout
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full text-pj-navy py-3 font-medium hover:text-pj-blue transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
