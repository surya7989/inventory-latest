import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CheckCircle2, CreditCard, Smartphone, Receipt, HandCoins, X, ChevronRight, LayoutGrid, LayoutList, Building2, ArrowLeftRight } from 'lucide-react';
import { Product, CartItem, PaymentMethod } from '../types';

interface BillingProps {
    products: Product[];
    onSaleSuccess: (cart: CartItem[], total: number) => void;
}

const Billing: React.FC<BillingProps> = ({ products, onSaleSuccess }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMode, setPaymentMode] = useState<PaymentMethod>('cash');
    const [isSuccess, setIsSuccess] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCart, setShowCart] = useState(false);

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
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const grandTotal = subtotal + cgst + sgst;

    const handleCheckout = () => {
        setIsSuccess(true);
        onSaleSuccess(cart, grandTotal);
        setTimeout(() => {
            setIsSuccess(false);
            setShowPayment(false);
            setCart([]);
            setShowCart(false);
        }, 2000);
    };

    return (
        <div className="flex h-full gap-4 lg:gap-6 relative">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Search & Actions */}
                <div className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between mb-4 lg:mb-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, SKU or barcode"
                            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 lg:space-x-3 ml-2 lg:ml-4">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><LayoutList className="w-4 h-4" /></button>
                        </div>
                        {/* Mobile cart toggle button */}
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="lg:hidden relative p-2 bg-blue-600 text-white rounded-xl"
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
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 lg:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all">
                                <Plus className="w-8 lg:w-10 h-8 lg:h-10 mb-3 lg:mb-4" />
                                <span className="font-black text-sm">Add New Product</span>
                            </div>
                            {filteredProducts.map(p => (
                                <div key={p.id} className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm relative group cursor-pointer hover:border-blue-500 transition-all">
                                    <div className="aspect-square bg-slate-50 rounded-xl mb-3 lg:mb-4 overflow-hidden relative">
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                        <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>{p.status}</span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm mb-1">{p.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-black text-slate-900">₹{p.price}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Stock: {p.stock}</p>
                                        </div>
                                        <button onClick={() => addToCart(p)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><Plus className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
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
                                                <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
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
                                                <button onClick={() => addToCart(p)} className="p-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
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
                            <div key={item.id} className="bg-slate-50 p-3 lg:p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-black text-slate-900 text-sm">{item.name}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 bg-white border border-slate-100 rounded-xl p-1">
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
                            <input type="text" placeholder="Enter coupon code" className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                            <button className="bg-slate-900 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black text-sm">Apply</button>
                        </div>
                        <div className="space-y-2 border-t border-slate-200 pt-4 text-xs font-bold text-slate-500">
                            <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900">₹{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>CGST (9%)</span><span className="text-slate-900">₹{cgst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>SGST (9%)</span><span className="text-slate-900">₹{sgst.toLocaleString()}</span></div>
                            <div className="flex justify-between text-slate-900"><span>Total GST</span><span>₹{(cgst + sgst).toLocaleString()}</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg lg:text-xl font-black text-slate-900">Grand Total</span>
                            <span className="text-2xl lg:text-3xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={() => setShowPayment(true)}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-4 lg:py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-xl transition-all disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-5 lg:w-6 h-5 lg:h-6" />
                        <span>Proceed to Payment</span>
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
                    <div className="bg-white rounded-3xl lg:rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPayment(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-xl transition-all"
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
                                    className={`flex-shrink-0 lg:w-full flex items-center justify-between p-3 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all ${paymentMode === method.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
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
                                                <input type="number" placeholder="0" className="w-full pl-12 pr-6 py-4 lg:py-6 bg-slate-50 border-2 border-slate-100 rounded-2xl lg:rounded-3xl text-2xl lg:text-3xl font-black outline-none focus:border-blue-500" />
                                            </div>
                                        </div>
                                        <div className="p-6 lg:p-8 bg-slate-50 rounded-2xl lg:rounded-[32px] border border-slate-100">
                                            <p className="text-slate-500 text-sm font-bold uppercase mb-2">Change to Return</p>
                                            <p className="text-3xl lg:text-4xl font-black text-slate-900">₹ 0</p>
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'upi' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">UPI Payment</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                                                <div key={app} className="p-4 lg:p-5 border-2 border-slate-100 rounded-2xl flex items-center space-x-3 lg:space-x-4 cursor-pointer hover:border-blue-600 transition-all">
                                                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-slate-50 rounded-lg"></div>
                                                    <span className="font-bold text-slate-900 text-sm">{app}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <input type="text" placeholder="user@upi or 9876543210" className="w-full px-6 py-4 lg:py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl lg:rounded-3xl text-base lg:text-lg font-bold outline-none" />
                                    </div>
                                )}

                                {paymentMode === 'card' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Card Payment</h2>
                                        <div className="space-y-4">
                                            <input placeholder="1234 5678 9012 3456" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="Card Holder Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input placeholder="MM/YY" className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                                <input placeholder="CVV" className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'split' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Split Payment</h2>
                                        <p className="text-sm text-slate-400 font-bold">Split the total amount across multiple payment methods</p>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cash Amount</label>
                                                <input type="number" placeholder="0" className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black outline-none" />
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">UPI / Card Amount</label>
                                                <input type="number" placeholder="0" className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black outline-none" />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-sm font-bold text-blue-600">Total: ₹{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {paymentMode === 'bank_transfer' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900">Bank Transfer</h2>
                                        <div className="space-y-4">
                                            <input placeholder="Account Number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="IFSC Code" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                            <input placeholder="Account Holder Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base lg:text-lg font-bold outline-none" />
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                            <p className="text-sm font-bold text-green-600">Amount: ₹{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 lg:mt-8">
                                <button onClick={handleCheckout} className="w-full bg-[#10B981] text-white py-4 lg:py-6 rounded-2xl lg:rounded-[32px] text-lg lg:text-2xl font-black shadow-xl hover:bg-[#059669] transition-all">
                                    {isSuccess ? '✅ Payment Successful!' : `Confirm ${paymentMode.replace('_', ' ')} Payment`}
                                </button>
                                <p className="text-center text-xs text-slate-400 font-bold mt-4 uppercase tracking-[0.2em]">Secured by 256-bit SSL Encryption</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
