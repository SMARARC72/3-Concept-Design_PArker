import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Award, 
  ChevronRight,
  Package,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const mockOrders = [
  { id: 'ORD-2024-001', date: '2024-01-15', status: 'Delivered', total: 156.00, items: 3 },
  { id: 'ORD-2024-002', date: '2024-01-20', status: 'Shipped', total: 89.50, items: 2 },
  { id: 'ORD-2024-003', date: '2024-01-25', status: 'Processing', total: 234.00, items: 5 },
];

const mockRecommendations = [
  { id: '1', name: 'Classic Polo Shirt', brand: 'Properly Tied', price: 48, image: '/product-1.jpg' },
  { id: '2', name: 'Chino Shorts', brand: 'ParkerJoe', price: 42, image: '/product-2.jpg' },
  { id: '3', name: 'Button Down Shirt', brand: 'Southern Tide', price: 56, image: '/product-3.jpg' },
  { id: '4', name: 'Summer Blazer', brand: 'J.Bailey', price: 78, image: '/product-4.jpg' },
];

export function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dashboard-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Welcome Section */}
      <div className="dashboard-card bg-gradient-to-r from-pj-navy to-pj-blue rounded-xl p-6 text-white">
        <h1 className="font-display text-3xl mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-white/80">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pj-gray mb-1">Total Orders</p>
              <p className="font-display text-3xl text-pj-navy">12</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-pj-navy/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-pj-navy" />
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pj-gray mb-1">Wishlist Items</p>
              <p className="font-display text-3xl text-pj-navy">8</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pj-gray mb-1">Loyalty Points</p>
              <p className="font-display text-3xl text-pj-navy">450</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-pj-gold/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-pj-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-card bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display text-xl text-pj-navy">Recent Orders</h2>
          <Link 
            to="/account/orders" 
            className="text-sm text-pj-blue hover:text-pj-navy flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {mockOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-pj-cream flex items-center justify-center">
                    <Package className="w-6 h-6 text-pj-navy" />
                  </div>
                  <div>
                    <p className="font-medium text-pj-navy">{order.id}</p>
                    <p className="text-sm text-pj-gray">{order.items} items • ${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-sm text-pj-gray flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-display text-xl text-pj-navy mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link 
            to="/shop" 
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pj-cream hover:bg-pj-navy/5 transition-colors text-center"
          >
            <ShoppingBag className="w-6 h-6 text-pj-navy" />
            <span className="text-sm font-medium text-pj-charcoal">Continue Shopping</span>
          </Link>
          <Link 
            to="/account/wishlist" 
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pj-cream hover:bg-pj-navy/5 transition-colors text-center"
          >
            <Heart className="w-6 h-6 text-pj-navy" />
            <span className="text-sm font-medium text-pj-charcoal">View Wishlist</span>
          </Link>
          <Link 
            to="/account/addresses" 
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pj-cream hover:bg-pj-navy/5 transition-colors text-center"
          >
            <Package className="w-6 h-6 text-pj-navy" />
            <span className="text-sm font-medium text-pj-charcoal">Manage Addresses</span>
          </Link>
          <Link 
            to="/account/settings" 
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pj-cream hover:bg-pj-navy/5 transition-colors text-center"
          >
            <Award className="w-6 h-6 text-pj-navy" />
            <span className="text-sm font-medium text-pj-charcoal">Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Recommended For You */}
      <div className="dashboard-card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-display text-xl text-pj-navy mb-4">Recommended For You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockRecommendations.map((product) => (
            <Link 
              key={product.id} 
              to={`/products/${product.id}`}
              className="group"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-pj-light-gray mb-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-pj-gray">{product.brand}</p>
              <p className="font-medium text-pj-navy text-sm group-hover:text-pj-blue transition-colors truncate">
                {product.name}
              </p>
              <p className="text-sm text-pj-charcoal">${product.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
