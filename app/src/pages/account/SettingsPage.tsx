import { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, Lock, Bell, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Preferences {
  marketingEmails: boolean;
  orderUpdates: boolean;
  shippingNotifications: boolean;
  smsNotifications: boolean;
}

export function SettingsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '(555) 123-4567',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState<Preferences>({
    marketingEmails: true,
    orderUpdates: true,
    shippingNotifications: true,
    smsNotifications: false,
  });

  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.settings-section',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSaveMessage({ type: 'success', text: 'Password changed successfully!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    setSaveMessage({ type: 'success', text: 'Preferences saved!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    logout();
    window.location.href = '/';
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Page Header */}
      <div className="settings-section bg-white rounded-xl p-6 shadow-sm">
        <h1 className="font-display text-2xl text-pj-navy">Account Settings</h1>
        <p className="text-sm text-pj-gray">Manage your profile, password, and preferences</p>
      </div>

      {/* Success/Error Message */}
      {saveMessage && (
        <div className={`settings-section p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}

      {/* Personal Information */}
      <div className="settings-section bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-pj-navy/10 flex items-center justify-center">
            <User className="w-5 h-5 text-pj-navy" />
          </div>
          <div>
            <h2 className="font-display text-xl text-pj-navy">Personal Information</h2>
            <p className="text-sm text-pj-gray">Update your personal details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="bg-pj-navy text-white px-6 py-2 rounded-lg hover:bg-pj-blue transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="settings-section bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-pj-navy/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-pj-navy" />
          </div>
          <div>
            <h2 className="font-display text-xl text-pj-navy">Change Password</h2>
            <p className="text-sm text-pj-gray">Update your password to keep your account secure</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pj-gray hover:text-pj-navy"
              >
                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pj-gray hover:text-pj-navy"
              >
                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-pj-charcoal mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pj-gray hover:text-pj-navy"
              >
                {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          className="bg-pj-navy text-white px-6 py-2 rounded-lg hover:bg-pj-blue transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Change Password'}
        </button>
      </div>

      {/* Email Preferences */}
      <div className="settings-section bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-pj-navy/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-pj-navy" />
          </div>
          <div>
            <h2 className="font-display text-xl text-pj-navy">Email Preferences</h2>
            <p className="text-sm text-pj-gray">Choose what notifications you receive</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketingEmails}
              onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
              className="w-5 h-5 text-pj-navy border-gray-300 rounded focus:ring-pj-blue mt-0.5"
            />
            <div>
              <p className="font-medium text-pj-charcoal">Marketing & Promotions</p>
              <p className="text-sm text-pj-gray">Receive emails about new arrivals, sales, and special offers</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.orderUpdates}
              onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
              className="w-5 h-5 text-pj-navy border-gray-300 rounded focus:ring-pj-blue mt-0.5"
            />
            <div>
              <p className="font-medium text-pj-charcoal">Order Updates</p>
              <p className="text-sm text-pj-gray">Receive confirmation and status updates for your orders</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.shippingNotifications}
              onChange={(e) => setPreferences({ ...preferences, shippingNotifications: e.target.checked })}
              className="w-5 h-5 text-pj-navy border-gray-300 rounded focus:ring-pj-blue mt-0.5"
            />
            <div>
              <p className="font-medium text-pj-charcoal">Shipping Notifications</p>
              <p className="text-sm text-pj-gray">Get notified when your order ships and delivery updates</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
              className="w-5 h-5 text-pj-navy border-gray-300 rounded focus:ring-pj-blue mt-0.5"
            />
            <div>
              <p className="font-medium text-pj-charcoal">SMS Notifications</p>
              <p className="text-sm text-pj-gray">Receive text messages for order updates and promotions</p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={isLoading}
          className="bg-pj-navy text-white px-6 py-2 rounded-lg hover:bg-pj-blue transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Delete Account */}
      <div className="settings-section bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-display text-xl text-red-700">Delete Account</h2>
            <p className="text-sm text-red-600">Permanently delete your account and all data</p>
          </div>
        </div>

        <p className="text-sm text-red-600 mb-4">
          This action cannot be undone. All your orders, addresses, and personal information will be permanently removed.
        </p>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-pj-gray">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <label className="block text-sm font-medium text-pj-charcoal mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SettingsPage;
