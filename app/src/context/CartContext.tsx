import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
        item => item.id === newItem.id && item.size === newItem.size
      );
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { ...newItem, quantity: 1 }];
    });
    // Open cart when item is added
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string | number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
