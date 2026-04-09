import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Gift,
  CreditCard,
  Wallet,
  Plus,
  Check,
  AlertCircle,
  Mail,
  Truck,
  Copy,
  ExternalLink,
  Calendar,
  DollarSign,
  ShoppingCart,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Preset gift card amounts
const presetAmounts = [25, 50, 100, 250, 500];

// Mock gift cards data
const myGiftCards = [
  {
    id: 'GC-2024-001',
    code: '1234567890123456',
    balance: 75.0,
    initialAmount: 100.0,
    expiryDate: '2025-12-31',
    type: 'digital',
    status: 'active',
    received: false,
  },
  {
    id: 'GC-2024-002',
    code: '9876543210987654',
    balance: 25.0,
    initialAmount: 50.0,
    expiryDate: '2025-06-30',
    type: 'digital',
    status: 'active',
    received: true,
    from: 'Sarah Johnson',
    message: 'Happy Birthday! Hope you find something you love!',
  },
  {
    id: 'GC-2023-089',
    code: '4567890123456789',
    balance: 0,
    initialAmount: 150.0,
    expiryDate: '2024-12-31',
    type: 'physical',
    status: 'used',
    received: false,
  },
];

// Transaction history
const giftCardTransactions = [
  { id: 1, cardId: 'GC-2024-001', type: 'purchase', amount: 100.0, date: '2024-01-15', description: 'Gift Card Purchase' },
  { id: 2, cardId: 'GC-2024-001', type: 'use', amount: -25.0, date: '2024-01-20', description: 'Order #ORD-2024-002' },
  { id: 3, cardId: 'GC-2024-002', type: 'receive', amount: 50.0, date: '2024-01-10', description: 'Gift from Sarah Johnson' },
  { id: 4, cardId: 'GC-2024-002', type: 'use', amount: -25.0, date: '2024-01-18', description: 'Order #ORD-2024-001' },
];

export function GiftCardsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [cardType, setCardType] = useState<'digital' | 'physical'>('digital');
  const [isGift, setIsGift] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  [recipientEmail];
  const [personalMessage, setPersonalMessage] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalBalance = myGiftCards
    .filter((card) => card.status === 'active')
    .reduce((sum, card) => sum + card.balance, 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gift-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.balance-display',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleAmountSelect = (amount: number | 'custom') => {
    setSelectedAmount(amount);
    if (amount !== 'custom') {
      setCustomAmount('');
    }
  };

  const getFinalAmount = () => {
    if (selectedAmount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount;
  };

  const handleRedeem = () => {
    if (redeemCode.length >= 8) {
      // Simulate redemption
      setRedeemStatus('success');
      setTimeout(() => {
        setRedeemStatus('idle');
        setRedeemCode('');
      }, 3000);
    } else {
      setRedeemStatus('error');
      setTimeout(() => setRedeemStatus('idle'), 3000);
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskCardCode = (code: string) => {
    return '•••• •••• •••• ' + code.slice(-4);
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="gift-card">
        <h1 className="font-display text-2xl text-pj-navy">Gift Cards</h1>
        <p className="text-pj-gray mt-1">Buy, redeem, and manage your ParkerJoe gift cards</p>
      </div>

      {/* Balance Display */}
      <Card className="gift-card bg-gradient-to-r from-pj-navy to-pj-blue border-0">
        <CardContent className="p-8">
          <div className="balance-display flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <p className="text-white/80 mb-1">Total Gift Card Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-white">${totalBalance.toFixed(2)}</span>
                <span className="text-white/60 text-lg">USD</span>
              </div>
              <p className="text-sm text-white/70 mt-2">
                {myGiftCards.filter((c) => c.status === 'active').length} active card
                {myGiftCards.filter((c) => c.status === 'active').length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-pj-gold" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy Gift Card Section */}
        <Card className="gift-card">
          <CardHeader>
            <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
              <Plus className="w-5 h-5 text-pj-blue" />
              Buy a Gift Card
            </CardTitle>
            <CardDescription>Send the perfect gift to someone special</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="text-sm font-medium text-pj-navy mb-3 block">Select Amount</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedAmount === amount
                        ? 'bg-pj-navy text-white'
                        : 'bg-pj-cream text-pj-navy hover:bg-pj-navy/10'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={() => handleAmountSelect('custom')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedAmount === 'custom'
                      ? 'bg-pj-navy text-white'
                      : 'bg-pj-cream text-pj-navy hover:bg-pj-navy/10'
                  }`}
                >
                  Custom
                </button>
              </div>
              {selectedAmount === 'custom' && (
                <div className="mt-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pj-gray" />
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-9"
                      min="5"
                      max="1000"
                    />
                  </div>
                  <p className="text-xs text-pj-gray mt-1">Minimum $5, maximum $1,000</p>
                </div>
              )}
            </div>

            {/* Card Type */}
            <div>
              <label className="text-sm font-medium text-pj-navy mb-3 block">Card Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCardType('digital')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    cardType === 'digital'
                      ? 'border-pj-navy bg-pj-navy/5'
                      : 'border-gray-200 hover:border-pj-navy/30'
                  }`}
                >
                  <Mail className={`w-6 h-6 ${cardType === 'digital' ? 'text-pj-navy' : 'text-pj-gray'}`} />
                  <span className={`font-medium ${cardType === 'digital' ? 'text-pj-navy' : 'text-pj-gray'}`}>
                    Digital
                  </span>
                  <span className="text-xs text-pj-gray">Delivered by email</span>
                </button>
                <button
                  onClick={() => setCardType('physical')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    cardType === 'physical'
                      ? 'border-pj-navy bg-pj-navy/5'
                      : 'border-gray-200 hover:border-pj-navy/30'
                  }`}
                >
                  <Truck className={`w-6 h-6 ${cardType === 'physical' ? 'text-pj-navy' : 'text-pj-gray'}`} />
                  <span className={`font-medium ${cardType === 'physical' ? 'text-pj-navy' : 'text-pj-gray'}`}>
                    Physical
                  </span>
                  <span className="text-xs text-pj-gray">Shipped to address</span>
                </button>
              </div>
            </div>

            {/* Gift Option */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-pj-navy focus:ring-pj-navy"
                />
                <span className="text-sm font-medium text-pj-navy">This is a gift</span>
                <Gift className="w-4 h-4 text-pj-gold" />
              </label>
            </div>

            {/* Gift Details */}
            {isGift && (
              <div className="space-y-4 p-4 bg-pj-cream rounded-xl">
                <div>
                  <label className="text-sm font-medium text-pj-navy mb-2 block">Recipient Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pj-gray" />
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-pj-navy mb-2 block">Personal Message (Optional)</label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a heartfelt message..."
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pj-blue focus:border-transparent outline-none resize-none h-24"
                  />
                  <p className="text-xs text-pj-gray mt-1 text-right">{personalMessage.length}/200</p>
                </div>
              </div>
            )}

            {/* Summary & CTA */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-pj-gray">Card Value</span>
                <span className="font-display text-xl text-pj-navy">${getFinalAmount().toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-pj-navy hover:bg-pj-blue text-white"
                size="lg"
                disabled={getFinalAmount() < 5}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Redeem Gift Card */}
        <Card className="gift-card">
          <CardHeader>
            <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pj-gold" />
              Redeem Gift Card
            </CardTitle>
            <CardDescription>Enter your gift card code to add it to your balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-pj-navy mb-3 block">Gift Card Code</label>
              <div className="flex gap-3">
                <Input
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  className="flex-1 font-mono uppercase"
                  maxLength={19}
                />
                <Button
                  onClick={handleRedeem}
                  disabled={redeemCode.length < 8}
                  className="bg-pj-gold hover:bg-pj-gold/90 text-white"
                >
                  Redeem
                </Button>
              </div>
              <p className="text-xs text-pj-gray mt-2">Enter the 16-digit code from your gift card</p>
            </div>

            {/* Status Messages */}
            {redeemStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Gift Card Redeemed!</p>
                  <p className="text-sm text-green-600">$100.00 has been added to your balance.</p>
                </div>
              </div>
            )}

            {redeemStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-800">Invalid Code</p>
                  <p className="text-sm text-red-600">Please check your code and try again.</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-pj-cream rounded-xl">
              <h4 className="font-medium text-pj-navy mb-2">How to redeem:</h4>
              <ol className="text-sm text-pj-gray space-y-2 list-decimal list-inside">
                <li>Find the 16-digit code on your gift card</li>
                <li>Enter the code in the field above</li>
                <li>Click &quot;Redeem&quot; to add to your balance</li>
                <li>Use your balance at checkout</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Gift Cards */}
      <Card className="gift-card">
        <CardHeader>
          <CardTitle className="font-display text-xl text-pj-navy flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-pj-navy" />
            My Gift Cards
          </CardTitle>
          <CardDescription>Manage your gift cards and check balances</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-pj-cream mb-6">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All Cards</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {myGiftCards
                .filter((card) => card.status === 'active')
                .map((card) => (
                  <div
                    key={card.id}
                    className="p-5 rounded-xl border border-gray-100 hover:border-pj-blue/30 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            card.type === 'digital' ? 'bg-pj-blue/10' : 'bg-pj-gold/10'
                          }`}
                        >
                          {card.type === 'digital' ? (
                            <Mail className="w-7 h-7 text-pj-blue" />
                          ) : (
                            <CreditCard className="w-7 h-7 text-pj-gold" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-pj-navy">{maskCardCode(card.code)}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                card.type === 'digital'
                                  ? 'bg-pj-blue/10 text-pj-blue'
                                  : 'bg-pj-gold/10 text-pj-gold'
                              }`}
                            >
                              {card.type === 'digital' ? 'Digital' : 'Physical'}
                            </span>
                          </div>
                          {card.received && card.from && (
                            <p className="text-sm text-pj-gray mt-1">Gift from {card.from}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-pj-gray">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Expires {new Date(card.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-display text-2xl text-pj-navy">${card.balance.toFixed(2)}</p>
                          <p className="text-xs text-pj-gray">of ${card.initialAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(card.code, card.id)}
                        className="text-xs"
                      >
                        {copiedId === card.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      {card.type === 'digital' && (
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View Card
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-xs ml-auto">
                        <Wallet className="w-3.5 h-3.5 mr-1" />
                        Add to Apple Wallet
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {myGiftCards.map((card) => (
                <div
                  key={card.id}
                  className={`p-5 rounded-xl border transition-all ${
                    card.status === 'used'
                      ? 'border-gray-100 bg-gray-50'
                      : 'border-gray-100 hover:border-pj-blue/30 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          card.status === 'used' ? 'bg-gray-200' : card.type === 'digital' ? 'bg-pj-blue/10' : 'bg-pj-gold/10'
                        }`}
                      >
                        {card.type === 'digital' ? (
                          <Mail className={`w-7 h-7 ${card.status === 'used' ? 'text-gray-400' : 'text-pj-blue'}`} />
                        ) : (
                          <CreditCard className={`w-7 h-7 ${card.status === 'used' ? 'text-gray-400' : 'text-pj-gold'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${card.status === 'used' ? 'text-pj-gray' : 'text-pj-navy'}`}>
                            {maskCardCode(card.code)}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              card.status === 'used'
                                ? 'bg-gray-200 text-gray-500'
                                : card.type === 'digital'
                                  ? 'bg-pj-blue/10 text-pj-blue'
                                  : 'bg-pj-gold/10 text-pj-gold'
                            }`}
                          >
                            {card.type === 'digital' ? 'Digital' : 'Physical'}
                          </span>
                          {card.status === 'used' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Used</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-pj-gray">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Expired {new Date(card.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-2xl ${card.status === 'used' ? 'text-pj-gray' : 'text-pj-navy'}`}>
                        ${card.balance.toFixed(2)}
                      </p>
                      <p className="text-xs text-pj-gray">of ${card.initialAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {giftCardTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-pj-cream transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'purchase'
                          ? 'bg-pj-navy/10'
                          : transaction.type === 'receive'
                            ? 'bg-green-100'
                            : 'bg-pj-blue/10'
                      }`}
                    >
                      {transaction.type === 'purchase' ? (
                        <ShoppingCart className="w-5 h-5 text-pj-navy" />
                      ) : transaction.type === 'receive' ? (
                        <Gift className="w-5 h-5 text-green-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-pj-blue" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-pj-navy text-sm">{transaction.description}</p>
                      <p className="text-xs text-pj-gray flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(transaction.date).toLocaleDateString()} • Card {maskCardCode(transaction.cardId)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-pj-blue'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default GiftCardsPage;
