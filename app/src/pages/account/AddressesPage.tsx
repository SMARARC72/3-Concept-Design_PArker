import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Plus, MapPin, Home, Briefcase, Star, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  type: 'home' | 'work';
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    street: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'United States',
    phone: '(555) 123-4567',
    type: 'home',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    street: '456 Office Blvd, Suite 200',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    country: 'United States',
    phone: '(555) 987-6543',
    type: 'work',
    isDefault: false,
  },
];

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

export function AddressesPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    isDefault: false,
    country: 'United States',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.address-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [addresses]);

  const handleSaveAddress = () => {
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zip) {
      return;
    }

    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData } as Address
          : addr
      ));
    } else {
      // If setting as default, remove default from others
      if (formData.isDefault) {
        setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      }
      
      const { id: _, ...formDataWithoutId } = formData as Address;
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formDataWithoutId,
      };
      
      setAddresses(prev => [...prev, newAddress]);
    }

    setIsAddDialogOpen(false);
    setEditingAddress(null);
    setFormData({ type: 'home', isDefault: false, country: 'United States' });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setDeleteConfirmId(null);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({ type: 'home', isDefault: false, country: 'United States' });
  };

  return (
    <div ref={pageRef}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-pj-navy">Saved Addresses</h1>
            <p className="text-sm text-pj-gray">Manage your shipping and billing addresses</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
            className="flex items-center gap-2 bg-pj-navy text-white px-4 py-2 rounded-lg hover:bg-pj-blue transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      </div>

      {/* Addresses Grid */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`address-card bg-white rounded-xl p-6 shadow-sm ${address.isDefault ? 'ring-2 ring-pj-navy' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pj-cream flex items-center justify-center">
                    {address.type === 'home' ? (
                      <Home className="w-5 h-5 text-pj-navy" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-pj-navy" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-pj-navy capitalize">{address.type}</p>
                    {address.isDefault && (
                      <span className="text-xs text-pj-blue flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-pj-gray" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(address.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-medium text-pj-charcoal">{address.name}</p>
                <p className="text-pj-gray">{address.street}</p>
                <p className="text-pj-gray">{address.city}, {address.state} {address.zip}</p>
                <p className="text-pj-gray">{address.country}</p>
                <p className="text-pj-gray">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-4 text-sm text-pj-blue hover:text-pj-navy transition-colors"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-pj-light-gray flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-pj-gray" />
          </div>
          <h2 className="font-display text-xl text-pj-navy mb-2">No addresses saved</h2>
          <p className="text-pj-gray mb-6">Add an address for faster checkout.</p>
          <button
            onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
            className="inline-flex items-center gap-2 bg-pj-navy text-white px-6 py-3 rounded-lg hover:bg-pj-blue transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsAddDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-pj-navy">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription className="text-pj-gray">
              {editingAddress ? 'Update your address details' : 'Enter your address information'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-pj-charcoal mb-2">Address Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'home' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
                    formData.type === 'home' ? 'bg-pj-navy text-white border-pj-navy' : 'border-gray-200 hover:border-pj-blue'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'work' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
                    formData.type === 'work' ? 'bg-pj-navy text-white border-pj-navy' : 'border-gray-200 hover:border-pj-blue'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Work
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-pj-charcoal mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-pj-charcoal mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street || ''}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-pj-charcoal mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Austin"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pj-charcoal mb-1">State</label>
                <select
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
                >
                  <option value="">Select</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pj-charcoal mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.zip || ''}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="78701"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-pj-charcoal mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
              />
            </div>

            {/* Default Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault || false}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-pj-navy border-gray-300 rounded focus:ring-pj-blue"
              />
              <span className="text-sm text-pj-charcoal">Set as default address</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setIsAddDialogOpen(false); resetForm(); }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="flex-1 px-4 py-3 bg-pj-navy text-white rounded-lg hover:bg-pj-blue transition-colors"
              >
                {editingAddress ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-pj-navy">Delete Address?</DialogTitle>
            <DialogDescription className="text-pj-gray">
              This action cannot be undone. This address will be permanently removed from your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddressesPage;
