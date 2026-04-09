import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ShoppingBag,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';

const orderStatuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'Delivered',
    total: 156.00,
    items: [
      { name: 'Classic Polo Shirt', brand: 'Properly Tied', price: 48, quantity: 2, image: '/product-1.jpg' },
      { name: 'Chino Shorts', brand: 'ParkerJoe', price: 42, quantity: 1, image: '/product-2.jpg' },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'Shipped',
    total: 89.50,
    items: [
      { name: 'Button Down Shirt', brand: 'Southern Tide', price: 56, quantity: 1, image: '/product-3.jpg' },
      { name: 'Crew Socks (3-Pack)', brand: 'ParkerJoe', price: 18, quantity: 1, image: '/product-5.jpg' },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    trackingNumber: '1Z999AA10123456785',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-25',
    status: 'Processing',
    total: 234.00,
    items: [
      { name: 'Summer Blazer', brand: 'J.Bailey', price: 78, quantity: 1, image: '/product-4.jpg' },
      { name: 'Dress Pants', brand: 'Properly Tied', price: 65, quantity: 2, image: '/product-6.jpg' },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    trackingNumber: null,
  },
  {
    id: 'ORD-2023-089',
    date: '2023-12-10',
    status: 'Cancelled',
    total: 124.00,
    items: [
      { name: 'Winter Coat', brand: 'ParkerJoe', price: 124, quantity: 1, image: '/product-7.jpg' },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    trackingNumber: null,
  },
];

export function OrdersPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.orders-content',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-5 h-5" />;
      case 'Shipped': return <Truck className="w-5 h-5" />;
      case 'Processing': return <Package className="w-5 h-5" />;
      case 'Cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div ref={pageRef} className="orders-content">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h1 className="font-display text-2xl text-pj-navy mb-6">Order History</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-pj-gray" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none bg-white"
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pj-cream flex items-center justify-center">
                      <Package className="w-6 h-6 text-pj-navy" />
                    </div>
                    <div>
                      <p className="font-medium text-pj-navy">{order.id}</p>
                      <p className="text-sm text-pj-gray">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <p className="font-display text-xl text-pj-navy">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div 
                        key={index}
                        className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-lg border-2 border-white bg-pj-light-gray flex items-center justify-center text-sm text-pj-gray">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-pj-gray">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  <div className="ml-auto flex items-center gap-2 text-pj-blue">
                    <span className="text-sm font-medium">View Details</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-pj-light-gray flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-pj-gray" />
          </div>
          <h3 className="font-display text-xl text-pj-navy mb-2">No orders found</h3>
          <p className="text-pj-gray mb-6">You haven't placed any orders yet.</p>
          <a href="/shop" className="inline-flex items-center gap-2 bg-pj-navy text-white px-6 py-3 rounded-lg hover:bg-pj-blue transition-colors">
            Start Shopping
          </a>
        </div>
      )}

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl text-pj-navy">Order Details</SheetTitle>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Order Info */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-pj-navy">{selectedOrder.id}</p>
                  <p className="text-sm text-pj-gray">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-pj-navy mb-4">Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-pj-light-gray flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-pj-navy">{item.name}</p>
                        <p className="text-sm text-pj-gray">{item.brand}</p>
                        <p className="text-sm text-pj-gray">Qty: {item.quantity}</p>
                        <p className="font-medium text-pj-charcoal">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-medium text-pj-navy mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <div className="text-sm text-pj-gray">
                  <p className="font-medium text-pj-charcoal">{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-pj-navy mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Tracking Information
                  </h3>
                  <p className="text-sm text-pj-gray mb-2">UPS Tracking Number:</p>
                  <p className="font-mono text-sm bg-pj-cream px-3 py-2 rounded">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-pj-navy">Order Total</span>
                  <span className="font-display text-2xl text-pj-navy">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 flex items-center justify-center gap-2 bg-pj-navy text-white py-3 rounded-lg hover:bg-pj-blue transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Reorder
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default OrdersPage;
