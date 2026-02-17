import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CheckCircle2, CreditCard, Smartphone, Receipt, HandCoins, X, ChevronRight, LayoutGrid, LayoutList, Building2, ArrowLeftRight, User, Phone, Printer, Send, Copy, Calendar, ArrowLeft, HelpCircle } from 'lucide-react';
import { Product, CartItem, PaymentMethod } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface BillingProps {
    products: Product[];
    onSaleSuccess: (cart: CartItem[], total: number, gstAmount: number, customerName?: string, customerPhone?: string) => void;
}

const Billing: React.FC<BillingProps> = ({ products, onSaleSuccess }) => {
    const [gstConfig] = useLocalStorage('nx_gst_config', {
        defaultRate: '18',
        enableCGST: true,
        enableSGST: true,
        enableIGST: false,
        taxInclusive: false,
    });

    const [cart, setCart] = useState<CartItem[]>([]);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMode, setPaymentMode] = useState<PaymentMethod>('cash');
    const [isSuccess, setIsSuccess] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCart, setShowCart] = useState(false);
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [cashReceived, setCashReceived] = useState<number>(0);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [txnInfo, setTxnInfo] = useState<{ id: string; date: string; methodLabel: string } | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                if (exists.quantity >= product.stock) return prev;
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setShowCart(true);
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const nextQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: nextQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Dynamic GST Calculation based on config
    const getGSTRate = (rate?: number) => rate !== undefined ? rate : parseFloat(gstConfig.defaultRate);

    // For simplicity in this UI, we'll calculate based on the total cart and the default or items individual GST
    // In a real app, we'd sum up GST per line item
    const activeRate = parseFloat(gstConfig.defaultRate) || 0;
    const totalGSTAmount = subtotal * (activeRate / 100);

    const cgstValue = gstConfig.enableCGST ?? (gstConfig as any).cgstEnabled ?? true;
    const sgstValue = gstConfig.enableSGST ?? (gstConfig as any).sgstEnabled ?? true;
    const igstValue = gstConfig.enableIGST ?? (gstConfig as any).igstEnabled ?? false;

    const cgst = cgstValue ? totalGSTAmount / 2 : 0;
    const sgst = sgstValue ? totalGSTAmount / 2 : 0;
    const igst = igstValue ? totalGSTAmount : 0;

    const finalGST = igstValue ? igst : (cgst + sgst);
    const grandTotal = Math.max(0, subtotal + finalGST - couponDiscount);

    const applyCoupon = () => {
        const code = couponCode.toUpperCase().trim();
        if (code === 'WELCOME10') {
            setCouponDiscount(Math.round((subtotal + finalGST) * 0.1));
        } else if (code === 'SAVE100') {
            setCouponDiscount(100);
        } else if (code === '') {
            setCouponDiscount(0);
        } else {
            // If it's a number, apply as fixed coupon amount
            const val = parseFloat(code);
            if (!isNaN(val)) setCouponDiscount(val);
        }
    };

    const handleProceedToPayment = () => {
        setShowCustomerInfo(true);
    };

    const handleCustomerInfoSubmit = () => {
        setShowCustomerInfo(false);
        setShowPayment(true);
        setCashReceived(grandTotal);
    };

    const handleCheckout = () => {
        const now = new Date();
        const info = {
            id: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' | ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            methodLabel: paymentMode === 'cash' ? 'Cash' : paymentMode === 'upi' ? 'UPI' : paymentMode === 'card' ? 'Card' : paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Split'
        };
        setTxnInfo(info);
        setIsSuccess(true);
        onSaleSuccess(cart, grandTotal, finalGST, customerName, customerPhone);
    };

    const resetBilling = () => {
        setIsSuccess(false);
        setShowPayment(false);
        setCart([]);
        setShowCart(false);
        setCustomerName('');
        setCustomerPhone('');
        setCashReceived(0);
        setCouponCode('');
        setCouponDiscount(0);
        setTxnInfo(null);
    };

    return (
        <div className="flex h-full gap-4 lg:gap-6 relative">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Search & Actions */}
                <div className="bg-white p-3 lg:p-4 rounded border border-slate-100 shadow-sm flex items-center justify-between mb-4 lg:mb-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, SKU or barcode"
                            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 lg:space-x-3 ml-2 lg:ml-4">
                        <div className="flex bg-slate-100 p-1 rounded-sm">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><LayoutList className="w-4 h-4" /></button>
                        </div>
                        {/* Mobile cart toggle button */}
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="lg:hidden relative p-2 bg-blue-600 text-white rounded-sm"
                        >
                            <Receipt className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Product Display Area */}
                <div className="flex-1 overflow-y-auto pr-2 vyapar-scrollbar">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="bg-white p-3 lg:p-4 rounded border border-slate-100 shadow-sm relative group cursor-pointer hover:border-blue-500 transition-all">
                                    <div className="aspect-square bg-slate-50 rounded-sm mb-3 lg:mb-4 overflow-hidden relative">
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                        <span className={`absolute top-2 right-2 px-2 py-1 rounded-sm text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>{p.status}</span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm mb-1">{p.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-black text-slate-900">₹{p.price}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Stock: {p.stock}</p>
                                        </div>
                                        <button onClick={() => addToCart(p)} className="p-2 bg-blue-600 text-white rounded-sm shadow-lg shadow-blue-100"><Plus className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded border border-slate-100 overflow-hidden overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-4">Product</th>
                                        <th className="px-4 lg:px-6 py-4 hidden sm:table-cell">Category</th>
                                        <th className="px-4 lg:px-6 py-4">Price</th>
                                        <th className="px-4 lg:px-6 py-4 hidden md:table-cell">Status</th>
                                        <th className="px-4 lg:px-6 py-4">Stock</th>
                                        <th className="px-4 lg:px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 lg:px-6 py-4 flex items-center space-x-3">
                                                <img src={p.image} className="w-10 h-10 rounded-sm object-cover" alt={p.name} />
                                                <span className="font-black text-sm">{p.name}</span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-500 hidden sm:table-cell">{p.category}</td>
                                            <td className="px-4 lg:px-6 py-4 font-black">₹{p.price}</td>
                                            <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>{p.status}</span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 font-black">{p.stock}</td>
                                            <td className="px-4 lg:px-6 py-4">
                                                <button onClick={() => addToCart(p)} className="p-2 bg-blue-600 text-white rounded-sm"><Plus className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Summary Sidebar - responsive */}
            {/* Mobile overlay */}
            {showCart && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowCart(false)} />}
            <div className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-[320px] lg:w-[380px] xl:w-[400px] bg-white rounded-l-[32px] lg:rounded-[32px] border border-slate-100 shadow-xl flex flex-col shrink-0 overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${showCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">Bill Summary</h3>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
                        <button onClick={() => setShowCart(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Receipt className="w-16 h-16 mb-4" />
                            <p className="font-black text-sm">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-slate-50 p-3 lg:p-4 rounded border border-transparent hover:border-slate-200 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-black text-slate-900 text-sm">{item.name}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 bg-white border border-slate-100 rounded-sm p-1">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400"><Minus className="w-3 h-3" /></button>
                                        <span className="text-xs font-black">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <p className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 lg:p-8 bg-slate-50 border-t border-slate-100 space-y-4 lg:space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Coupon Code"
                                className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-slate-200 rounded-sm text-sm outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={applyCoupon}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-sm font-black text-sm transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                        <div className="space-y-2 border-t border-slate-200 pt-4 text-xs font-bold text-slate-500">
                            <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900">₹{subtotal.toLocaleString()}</span></div>
                            {cgstValue && (
                                <div className="flex justify-between"><span>CGST ({activeRate / 2}%)</span><span className="text-slate-900">₹{cgst.toLocaleString()}</span></div>
                            )}
                            {sgstValue && (
                                <div className="flex justify-between"><span>SGST ({activeRate / 2}%)</span><span className="text-slate-900">₹{sgst.toLocaleString()}</span></div>
                            )}
                            {igstValue && (
                                <div className="flex justify-between"><span>IGST ({activeRate}%)</span><span className="text-slate-900">₹{igst.toLocaleString()}</span></div>
                            )}
                            <div className="flex justify-between border-t border-slate-100 pt-1 text-slate-900"><span>Total Tax ({activeRate}%)</span><span>₹{finalGST.toLocaleString()}</span></div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Discount</span>
                                    <span>-₹{couponDiscount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg lg:text-xl font-black text-slate-900">Grand Total</span>
                            <span className="text-2xl lg:text-3xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={handleProceedToPayment}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-4 lg:py-5 rounded flex items-center justify-center space-x-3 shadow-xl transition-all disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-5 lg:w-6 h-5 lg:h-6" />
                        <span>Proceed to Payment</span>
                    </button>
                </div>
            </div>
            {/* Customer Info Modal */}
            {showCustomerInfo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
                    <div className="bg-white rounded w-full max-w-md shadow-2xl overflow-hidden relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowCustomerInfo(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-sm transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center mb-4">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white">Customer Details</h2>
                            <p className="text-blue-200 text-sm font-medium mt-1">Enter customer information</p>
                        </div>

                        {/* Form */}
                        <div className="p-6 lg:p-8 space-y-5">
                            {/* Customer Name */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Customer Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-sm text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-sm text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Bill Amount Preview */}
                            <div className="p-4 bg-green-50 rounded-sm border border-green-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-green-700">Bill Amount</span>
                                <span className="text-xl font-black text-green-700">₹{grandTotal.toLocaleString()}</span>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleCustomerInfoSubmit}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-sm flex items-center justify-center space-x-3 shadow-lg shadow-blue-200/50 transition-all text-sm"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Continue to Payment</span>
                            </button>

                            {/* Skip Option */}
                            <button
                                onClick={() => {
                                    setShowCustomerInfo(false);
                                    setShowPayment(true);
                                    setCashReceived(grandTotal);
                                }}
                                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-colors"
                            >
                                Skip — Continue without customer info
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
                    <div className="bg-white rounded lg:rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPayment(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-sm transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Sidebar for Payment Methods */}
                        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 lg:p-8 space-y-2 lg:space-y-4 flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
                            <h3 className="hidden lg:block text-lg font-black text-slate-900 mb-4 lg:mb-8">Select Payment</h3>
                            {[
                                { id: 'cash', label: 'Cash', icon: HandCoins },
                                { id: 'upi', label: 'UPI', icon: Smartphone },
                                { id: 'card', label: 'Card', icon: CreditCard },
                                { id: 'split', label: 'Split', icon: ArrowLeftRight },
                                { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMode(method.id as PaymentMethod)}
                                    className={`flex-shrink-0 lg:w-full flex items-center justify-between p-3 lg:p-5 rounded-sm lg:rounded border-2 transition-all ${paymentMode === method.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3 lg:space-x-4">
                                        <method.icon className="w-5 lg:w-6 h-5 lg:h-6" />
                                        <span className="font-black text-xs lg:text-sm">{method.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 hidden lg:block" />
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Content */}
                        <div className="flex-1 p-6 lg:p-12 bg-white flex flex-col overflow-y-auto">
                            <div className="flex-1">
                                {paymentMode === 'cash' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Cash Payment</h2>
                                        <div className="space-y-4">
                                            <label className="block text-sm font-black text-slate-500 uppercase tracking-widest">Cash Received</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl lg:text-2xl font-black text-slate-300">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={cashReceived || ''}
                                                    onChange={(e) => setCashReceived(Number(e.target.value))}
                                                    className="w-full pl-12 pr-6 py-4 lg:py-6 bg-slate-50 border-2 border-slate-100 rounded lg:rounded text-2xl lg:text-3xl font-black outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-sm border border-blue-100 flex justify-between items-center">
                                            <span className="text-sm font-bold text-blue-700">Bill Amount</span>
                                            <span className="text-xl font-black text-blue-700">₹{grandTotal.toLocaleString()}</span>
                                        </div>
                                        <div className={`p-6 lg:p-8 rounded lg:rounded-[32px] border ${cashReceived >= grandTotal ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <p className="text-slate-500 text-sm font-bold uppercase mb-2">Change to Return</p>
                                            <p className={`text-3xl lg:text-4xl font-black ${cashReceived >= grandTotal ? 'text-green-600' : 'text-slate-900'}`}>
                                                ₹ {cashReceived >= grandTotal ? (cashReceived - grandTotal).toLocaleString() : '0'}
                                            </p>
                                            {cashReceived > 0 && cashReceived < grandTotal && (
                                                <p className="text-sm font-bold text-red-500 mt-2">₹{(grandTotal - cashReceived).toLocaleString()} more needed</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'upi' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">UPI Payment</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                                                <div key={app} className="p-4 lg:p-5 border-2 border-slate-100 rounded flex items-center space-x-3 lg:space-x-4 cursor-pointer hover:border-blue-600 transition-all">
                                                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-slate-50 rounded-sm"></div>
                                                    <span className="font-bold text-slate-900 text-sm">{app}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <input type="text" placeholder="user@upi or 9876543210" className="w-full px-6 py-4 lg:py-5 bg-slate-50 border-2 border-slate-100 rounded lg:rounded text-base lg:text-lg font-bold outline-none" />
                                    </div>
                                )}

                                {paymentMode === 'card' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Card Payment</h2>
                                        <div className="space-y-4">
                                            <input placeholder="1234 5678 9012 3456" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="Card Holder Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input placeholder="MM/YY" className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                                <input placeholder="CVV" className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'split' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Split Payment</h2>
                                        <p className="text-sm text-slate-400 font-bold">Split the total amount across multiple payment methods</p>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cash Amount</label>
                                                <input type="number" placeholder="0" className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-sm text-lg font-black outline-none" />
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">UPI / Card Amount</label>
                                                <input type="number" placeholder="0" className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-sm text-lg font-black outline-none" />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded border border-blue-100">
                                            <p className="text-sm font-bold text-blue-600">Total: ₹{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'bank_transfer' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Bank Transfer</h2>
                                        <div className="space-y-4">
                                            <input placeholder="Account Number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="IFSC Code" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="Account Holder Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded text-base lg:text-lg font-bold outline-none" />
                                        </div>
                                        <div className="p-4 bg-green-50 rounded border border-green-100">
                                            <p className="text-sm font-bold text-green-600">Amount: ₹{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 lg:mt-8">
                                <button onClick={handleCheckout} className="w-full bg-[#10B981] text-white py-4 lg:py-6 rounded lg:rounded-[32px] text-lg lg:text-2xl font-black shadow-xl hover:bg-[#059669] transition-all">
                                    {isSuccess ? '✅ Payment Successful!' : `Confirm ${paymentMode.replace('_', ' ')} Payment`}
                                </button>
                                <p className="text-center text-xs text-slate-400 font-bold mt-4 uppercase tracking-[0.2em]">Secured by 256-bit SSL Encryption</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Payment Success Screen */}
            {isSuccess && txnInfo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Green Header */}
                        <div className="bg-[#10B981] p-10 flex flex-col items-center text-white text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 border-4 border-white/20">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Payment Successful</h2>
                            <p className="text-white/80 font-bold opacity-90">Your transaction has been completed successfully</p>
                        </div>

                        {/* Amount Display */}
                        <div className="p-8 lg:p-10 flex flex-col items-center border-b border-slate-50">
                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Amount Paid</p>
                            <h1 className="text-5xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</h1>
                        </div>

                        {/* Transaction Details */}
                        <div className="p-8 lg:p-10 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-50 rounded flex items-center justify-center">
                                    <Receipt className="w-6 h-6 text-[#10B981]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                    <p className="font-black text-slate-900">{txnInfo.methodLabel}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center">
                                    <span className="text-blue-600 font-black text-xs">#</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                                    <p className="font-black text-slate-900">{txnInfo.id}</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-sm transition-colors">
                                    <Copy className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-50 rounded flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                                    <p className="font-black text-slate-900">{txnInfo.date}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 space-y-4">
                                <button
                                    onClick={resetBilling}
                                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 rounded font-black flex items-center justify-center space-x-3 shadow-lg shadow-green-100 transition-all active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Back to Billing Dashboard</span>
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center space-x-2 py-4 px-4 bg-white border-2 border-slate-100 rounded font-black text-slate-600 hover:bg-slate-50 transition-all text-sm">
                                        <Printer className="w-4 h-4" />
                                        <span>Print Invoice</span>
                                    </button>
                                    <button className="flex items-center justify-center space-x-2 py-4 px-4 bg-white border-2 border-slate-100 rounded font-black text-slate-600 hover:bg-slate-50 transition-all text-sm">
                                        <div className="-rotate-45"><Send className="w-4 h-4" /></div>
                                        <span>Send Receipt</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Help Link */}
                        <div className="p-8 pt-0 flex flex-col items-center">
                            <p className="text-xs font-bold text-slate-400 mb-2">Need help with this transaction?</p>
                            <button className="flex items-center space-x-2 text-[#10B981] font-black text-sm hover:underline">
                                <HelpCircle className="w-4 h-4" />
                                <span>Contact Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;


