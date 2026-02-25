import React, { useState, useMemo } from 'react';
import {
    ShoppingCart, Search, Filter, ShoppingBag, ChevronRight,
    Star, Timer, ShieldCheck, Truck, Plus, Minus, X, ArrowLeft, Clock, CreditCard, Smartphone, Loader2, Zap, Building2
} from 'lucide-react';
import { useRazorpay } from '../hooks/useRazorpay';
import { PaymentLinkButton } from '../components/RazorpayComponents';


import { Product } from '../types';

interface StorefrontProps {
    products: Product[];
    onBackToAdmin?: () => void;
    onCheckoutSuccess?: (cart: any[], total: number, gstAmount: number, custName?: string, custPhone?: string, custAddress?: string, source?: 'online' | 'offline', paid?: number, method?: any, rzpOrderId?: string, rzpPaymentId?: string) => void;
    onPreBook?: (custId: string, name: string, phone: string, pid: string, pname: string, qty: number) => void;
}



const Storefront: React.FC<StorefrontProps> = ({ products, onBackToAdmin, onCheckoutSuccess, onPreBook }) => {
    const { initiatePayment, isLoading: rzpLoading } = useRazorpay();
    const [cart, setCart] = useState<{ id: string, qty: number }[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


    // Checkout States
    const [showCheckout, setShowCheckout] = useState(false);
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddress, setCustAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('upi');
    const [couponCode, setCouponCode] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Pre-Booking States
    const [showPreBook, setShowPreBook] = useState(false);
    const [preBookCustName, setPreBookCustName] = useState('');
    const [preBookCustPhone, setPreBookCustPhone] = useState('');
    const [selectedPreBookProduct, setSelectedPreBookProduct] = useState<Product | null>(null);
    const [preBookSuccess, setPreBookSuccess] = useState(false);




    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, products]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) return prev; // Stock limit reached
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            if (product.stock <= 0) return prev; // Out of stock
            return [...prev, { id: product.id, qty: 1 }];
        });
    };



    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === id);
                if (!product) return item;

                const newQty = Math.max(0, item.qty + delta);
                if (newQty > product.stock) return item; // Cannot exceed stock

                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };



    const resolvedCart = useMemo(() => {
        return cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return null;

            const rate = product.gstRate || 0;
            const isInclusive = product.taxType === 'Inclusive';
            const price = product.price;
            const lineBase = price * item.qty;

            let tax = 0;
            let total = 0;

            if (isInclusive) {
                total = lineBase;
                tax = total - (total / (1 + rate / 100));
            } else {
                tax = (lineBase * rate) / 100;
                total = lineBase + tax;
            }

            return { product, qty: item.qty, tax, total };
        }).filter(item => item !== null) as { product: Product, qty: number, tax: number, total: number }[];
    }, [cart, products]);

    const cartTotal = resolvedCart.reduce((sum, item) => sum + item.total, 0);
    const cartCount = resolvedCart.reduce((sum, item) => sum + item.qty, 0);
    const cartTaxTotal = resolvedCart.reduce((sum, item) => sum + item.tax, 0);



    const getProductImage = (product: Product) => product.image;

    const renderProductImage = (product: Product, className: string) => {
        if (product.image) {
            return <img src={product.image} alt={product.name} className={className} />;
        }
        return (
            <div className={`flex items-center justify-center bg-blue-50 text-blue-600 font-black ${className}`}>
                <span className="text-4xl">{product.name.charAt(0).toUpperCase()}</span>
            </div>
        );
    };

    const getProductDescription = (product: Product) => {
        return product.description || 'Premium quality product managed via NEXA POS Inventory Control.';
    };

    const handlePlaceOrder = (methodOverride?: string, rzpOrderId?: string, rzpPaymentId?: string) => {
        if (!onCheckoutSuccess) return;

        const cartItems = resolvedCart.map(item => ({
            ...item.product,
            quantity: item.quantity || item.qty // Support both item.qty and item.quantity
        }));

        const totalGST = cartTaxTotal;
        const method = (methodOverride || paymentMethod) as any;

        // Signature: (cart, total, gstAmount, custName, custPhone, custAddress, source, paid, method, rzpOrderId, rzpPaymentId)
        onCheckoutSuccess(cartItems, cartTotal, totalGST, custName, custPhone, custAddress, 'online', cartTotal, method, rzpOrderId, rzpPaymentId);
        setIsSuccess(true);
        setCart([]);

        setTimeout(() => {
            setIsSuccess(false);
            setShowCheckout(false);
            setIsCartOpen(false);
        }, 3000);
    };

    const handleRazorpayStoreCheckout = async () => {
        if (!custName || !custPhone) return alert('Please enter name and phone number');

        await initiatePayment({
            amount: cartTotal,
            description: `Online Order from ${custName} — ${cartCount} items`,
            customerName: custName,
            customerPhone: custPhone,
            themeColor: '#2563EB',
            onSuccess: (data: any) => {
                handlePlaceOrder(paymentMethod, data.razorpay_order_id, data.razorpay_payment_id);
            },
            onFailure: () => {
                alert('Payment failed. Please try again.');
            }
        });
    };

    const handleConfirmPreBook = () => {
        if (!onPreBook || !selectedPreBookProduct || !preBookCustName || !preBookCustPhone) return;

        onPreBook(
            `CUST-TEMP-${Date.now()}`,
            preBookCustName,
            preBookCustPhone,
            selectedPreBookProduct.id,
            selectedPreBookProduct.name,
            1
        );

        setPreBookSuccess(true);
        setTimeout(() => {
            setPreBookSuccess(false);
            setShowPreBook(false);
            setSelectedPreBookProduct(null);
            setPreBookCustName('');
            setPreBookCustPhone('');
        }, 2000);
    };




    return (
        <div className="fixed inset-0 z-[10000] bg-white overflow-y-auto min-h-screen font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-6">
                            {onBackToAdmin && (
                                <button
                                    onClick={onBackToAdmin}
                                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all active:scale-90"
                                    title="Back to Admin Dashboard"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-100">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tight text-slate-900">NEXA<span className="text-blue-600">Store</span></span>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-md mx-10">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-bold text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                            >
                                <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full border-4 border-white flex items-center justify-center animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero Section */}
                <section className="mb-20">
                    <div className="relative rounded-[48px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 lg:p-20 overflow-hidden text-white shadow-2xl shadow-blue-100">
                        <div className="relative z-10 max-w-2xl">
                            <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">Premium Marketplace</span>
                            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">Quality Products <br />at your <span className="underline decoration-blue-300 decoration-8 underline-offset-8">Doorstep</span></h1>
                            <p className="text-blue-100 text-xl font-bold leading-relaxed mb-10">Experience the next generation of online shopping. Fresh, fast, and fully transparent at NEXA Store.</p>
                            <button className="px-10 py-5 bg-white text-blue-600 rounded-[20px] font-black text-lg shadow-2xl hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3">
                                Start Shopping <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"></div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                            <Filter className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap active:scale-95 ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-2 border-slate-50 text-slate-500 hover:border-blue-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                                    <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Showing {filteredProducts.length} Products</span>
                        </div>

                    </div>
                </section>

                {/* Product Display */}
                <section className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"}>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-[32px] p-4 border border-slate-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-6'}`}
                        >
                            <div className={`relative rounded-[24px] overflow-hidden shrink-0 bg-slate-50 ${viewMode === 'grid' ? 'aspect-square mb-6' : 'w-24 h-24 sm:w-32 sm:h-32'}`}>
                                {renderProductImage(product, "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700")}
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
                                        <span className="text-white text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">{product.category}</span>
                                        {product.unit && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.unit}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                        <span className="text-xs font-black">4.9</span>
                                    </div>
                                </div>
                                <h3 className={`${viewMode === 'grid' ? 'text-lg' : 'text-xl'} font-black text-slate-900 mb-2 truncate leading-tight group-hover:text-blue-600 transition-colors`}>{product.name}</h3>
                                <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{getProductDescription(product)}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {product.taxType === 'Inclusive' ? 'Incl. Tax' : `+ ${product.gstRate}% Tax`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {product.mrp > product.price && (
                                                <span className="text-sm font-bold text-slate-400 line-through">₹{product.mrp}</span>
                                            )}
                                            {product.mrp > product.price && (
                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide w-fit">Huge Saving!</span>
                                            )}
                                        </div>
                                    </div>


                                    {product.stock > 0 && (
                                        <button
                                            onClick={() => addToCart(product)}
                                            className={`${viewMode === 'grid' ? 'w-12 h-12' : 'px-8 py-4'} bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95 group/btn`}
                                        >
                                            {viewMode === 'grid' ? <Plus className="w-6 h-6" /> : <span className="font-black text-xs uppercase tracking-widest">Add To Basket</span>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                </section>
            </main>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[10001] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                    <div className="absolute inset-y-0 right-0 max-w-full flex">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tight">Your Basket</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {resolvedCart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                        <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest">Empty Basket</p>
                                    </div>
                                ) : (
                                    resolvedCart.map(item => (
                                        <div key={item.product.id} className="flex gap-4 p-4 rounded-[24px] bg-slate-50/50">
                                            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-white">
                                                {renderProductImage(item.product, "w-full h-full object-cover")}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 truncate">{item.product.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <p className="text-xs font-bold text-blue-600">₹{item.product.price}</p>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1 rounded">
                                                        {item.product.taxType === 'Inclusive' ? 'Inc.' : `+${item.product.gstRate}%`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-xs font-black">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-slate-900">₹{item.total.toLocaleString()}</p>

                                        </div>
                                    ))
                                )}

                            </div>

                            {resolvedCart.length > 0 && (
                                <div className="p-8 border-t border-slate-100">
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Total Amount</span>
                                                <span className="text-[10px] font-bold text-blue-600">Inclusive of all taxes</span>
                                            </div>
                                            <span className="text-2xl font-black text-slate-900">₹{cartTotal}</span>
                                        </div>

                                        {/* Tax Breakdown Preview */}
                                        <div className="px-4 space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Estimated GST (Weighted)</span>
                                                <span className="text-blue-600 font-black">₹{cartTaxTotal.toLocaleString()}</span>
                                            </div>

                                        </div>
                                    </div>


                                    <button
                                        onClick={() => setShowCheckout(true)}
                                        className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                    >
                                        Checkout Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Overlay */}
            {showCheckout && (
                <div className="fixed inset-0 z-[10002] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {isSuccess ? (
                            <div className="p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900">Order Successful!</h3>
                                <p className="text-slate-500 font-bold">Thank you, {custName}. Your order is being processed.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row h-[600px]">
                                <div className="flex-1 p-8 lg:p-10 space-y-8 overflow-y-auto">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Checkout Details</h3>
                                        <p className="text-sm font-bold text-slate-400">Complete your information to place order</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                value={custName}
                                                onChange={e => setCustName(e.target.value)}
                                                className="w-full mt-1.5 px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                value={custPhone}
                                                onChange={e => setCustPhone(e.target.value)}
                                                className="w-full mt-1.5 px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                                placeholder="Enter mobile number"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Details</label>
                                            <textarea
                                                value={custAddress}
                                                onChange={e => setCustAddress(e.target.value)}
                                                className="w-full mt-1.5 px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold h-24 resize-none"
                                                placeholder="Enter your full delivery address"
                                            />
                                        </div>
                                    </div>


                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'upi', label: 'UPI / QR', icon: Zap },
                                                { id: 'card', label: 'Credit/Debit', icon: CreditCard },
                                                { id: 'cash', label: 'Pay on Delivery', icon: Clock },
                                                { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === m.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                                >
                                                    <m.icon className="w-5 h-5" />
                                                    <span className="font-black text-[9px] uppercase tracking-widest">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Razorpay specific UI for online modes */}
                                    {(paymentMethod === 'upi' || paymentMethod === 'card') && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Secure Online Payment</p>
                                                <p className="text-[10px] font-bold text-blue-600">Powered by Razorpay Secure Checkout</p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'bank_transfer' && (
                                        <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 space-y-3">
                                            <p className="text-[10px] font-black text-cyan-800 uppercase tracking-widest">Get Payment Link</p>
                                            <PaymentLinkButton
                                                amount={cartTotal}
                                                customerName={custName}
                                                customerPhone={custPhone}
                                                description={`NEXA Store Order — ${cartCount} items`}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-[280px] bg-slate-50 p-8 flex flex-col justify-between border-l border-slate-100">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Summary</h4>
                                            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-tighter">Tax Compliant</div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                                <span>Items ({resolvedCart.length})</span>
                                                <span className="text-slate-900">₹{cartTotal}</span>
                                            </div>

                                            {/* GST Details Breakdown */}
                                            {(() => {
                                                const totalGST = cartTaxTotal;
                                                const subtotalNet = cartTotal - totalGST;



                                                return (
                                                    <div className="space-y-2.5 py-4 border-y border-slate-200 text-[11px] font-bold text-slate-500">
                                                        <div className="flex justify-between">
                                                            <span>Subtotal (Net)</span>
                                                            <span className="text-slate-900">₹{subtotalNet.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>CGST (Split)</span>
                                                            <span className="text-slate-900">₹{(totalGST / 2).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>SGST (Split)</span>
                                                            <span className="text-slate-900">₹{(totalGST / 2).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between pt-1 text-slate-900 border-t border-slate-100 mt-1">
                                                            <span>Weighted Tax Total</span>
                                                            <span>₹{totalGST.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            <div className="pt-2 flex justify-between items-center">
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                                                <span className="text-3xl font-black text-slate-900">₹{cartTotal.toLocaleString()}</span>
                                            </div>

                                        </div>


                                        <div className="space-y-2">
                                            <input
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value)}
                                                placeholder="Coupon Code"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={(paymentMethod === 'upi' || paymentMethod === 'card') ? handleRazorpayStoreCheckout : () => handlePlaceOrder()}
                                            disabled={!custName || !custPhone || rzpLoading}
                                            className="w-full py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                                        >
                                            {rzpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            <span>
                                                {rzpLoading
                                                    ? 'Opening Secure Gateway...'
                                                    : (paymentMethod === 'upi' || paymentMethod === 'card')
                                                        ? 'Pay Now & Place Order'
                                                        : 'Confirm Order'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setShowCheckout(false)}
                                            className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pre-Booking Modal */}
            {showPreBook && (
                <div className="fixed inset-0 z-[10003] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {preBookSuccess ? (
                            <div className="p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <Clock className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Pre-Booked!</h3>
                                <p className="text-slate-500 font-bold text-sm">We'll notify you as soon as {selectedPreBookProduct?.name} is back in stock.</p>
                            </div>
                        ) : (
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Pre-Book Item</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Item currently out of stock</p>
                                    </div>
                                    <button onClick={() => setShowPreBook(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-blue-600">
                                        {selectedPreBookProduct?.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-sm text-slate-900">{selectedPreBookProduct?.name}</p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">₹{selectedPreBookProduct?.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                        <input
                                            value={preBookCustName}
                                            onChange={e => setPreBookCustName(e.target.value)}
                                            className="w-full mt-1.5 px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                        <input
                                            value={preBookCustPhone}
                                            onChange={e => setPreBookCustPhone(e.target.value)}
                                            className="w-full mt-1.5 px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            placeholder="Enter phone for notification"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmPreBook}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Confirm Pre-Booking
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default Storefront;
