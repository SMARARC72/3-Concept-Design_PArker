import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  CreditCard,
  Award,
  Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/account/addresses', label: 'Addresses', icon: MapPin },
  { path: '/account/payment-methods', label: 'Payment', icon: CreditCard },
  { path: '/account/points-rewards', label: 'Points & Rewards', icon: Award },
  { path: '/account/gift-cards', label: 'Gift Cards', icon: Gift },
  { path: '/account/settings', label: 'Settings', icon: Settings },
];

export function AccountLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pj-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pj-navy flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-pj-navy">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-pj-gray">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-pj-light-gray rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="mt-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/account'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-pj-navy/5 text-pj-navy font-medium'
                        : 'text-pj-charcoal hover:bg-pj-light-gray'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* User Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-pj-navy flex items-center justify-center">
                    <span className="text-xl font-display text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-lg text-pj-navy">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-pj-gray">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/account'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-6 py-4 transition-colors ${
                        isActive
                          ? 'bg-pj-navy text-white'
                          : 'text-pj-charcoal hover:bg-pj-light-gray'
                      } ${index !== navItems.length - 1 ? 'border-b border-gray-100' : ''}`
                    }
                  >
                    <item.icon className={`w-5 h-5 ${item.path === '/account' ? '' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
