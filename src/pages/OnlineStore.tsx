import React, { useState } from 'react';
import {
    ExternalLink, ShoppingCart, TrendingUp, Package, Users,
    ChevronRight, Settings, Globe, Layout, Share2, Eye,
    CreditCard, Truck, Clock, AlertCircle, Plus, Filter, Search
} from 'lucide-react';
import Portal from '../components/Portal';

import { Transaction, Customer, OrderStatus, PreBooking } from '../types';

interface OnlineStoreProps {
    onVisitStore: () => void;
    transactions: Transaction[];
    customers: Customer[];
    onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
    preBookings: PreBooking[];
    onUpdatePreBooking: (id: string, status: PreBooking['status']) => void;
}

const OnlineStore: React.FC<OnlineStoreProps> = ({
    onVisitStore, transactions, customers, onUpdateOrderStatus, preBookings, onUpdatePreBooking
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'prebookings'>('orders');



    // Derive real stats from transactions
    const onlineSalesTotal = transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    const totalOrdersCount = transactions.length;

    const stats = [
        { label: 'Online Sales', value: `₹ ${onlineSalesTotal.toLocaleString('en-IN')}`, change: '+12.5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Orders', value: totalOrdersCount.toString(), change: '+8', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Cart', value: '15', change: '+3', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Store Visitors', value: '842', change: '+122', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    // derive recent orders from transactions
    const recentOrders = transactions.map(t => {
        const customer = customers.find(c => c.id === t.customerId);
        return {
            id: t.id,
            customer: customer?.name || 'Walk-in Customer',
            address: customer?.address || '',
            amount: `₹ ${t.total.toLocaleString('en-IN')}`,
            status: t.orderStatus || 'Pending',
            date: t.date === new Date().toISOString().split('T')[0] ? 'Today' : t.date
        };
    });





    const handleVisitStore = () => {
        onVisitStore();
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        Online Store Management
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 ml-11">Control your customer-facing ordering portal</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 rounded-xl font-black text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 group shadow-sm"
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        Store Settings
                    </button>
                    <button
                        onClick={handleVisitStore}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 group"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Live Store
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">{stat.change}</span>
                        </div>
                        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Direct Orders ({recentOrders.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('prebookings')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'prebookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Pre-Bookings ({preBookings.filter(p => p.status === 'Pending').length})
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                {activeTab === 'orders' ? (
                                    <><Clock className="w-5 h-5 text-blue-600" /> Active Online Orders</>
                                ) : (
                                    <><AlertCircle className="w-5 h-5 text-orange-600" /> Customer Pre-Bookings</>
                                )}
                            </h3>
                            <button className="text-sm font-black text-blue-600 hover:underline">View All</button>
                        </div>

                        <div className="overflow-x-auto">
                            {activeTab === 'orders' ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-white">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Update</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentOrders.length === 0 ? (
                                            <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">No online orders found</td></tr>
                                        ) : recentOrders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="font-black text-xs text-blue-600 mb-0.5">{order.id}</div>
                                                    <div className="font-bold text-sm text-slate-900">{order.customer}</div>
                                                    {order.address && <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{order.address}</div>}
                                                </td>
                                                <td className="px-8 py-4 font-black text-sm text-slate-900">{order.amount}</td>
                                                <td className="px-8 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                        className={`
                                                            px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none border-none cursor-pointer
                                                            ${order.status === 'Pending' ? 'bg-orange-50 text-orange-600' : ''}
                                                            ${order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' : ''}
                                                            ${order.status === 'Shipped' ? 'bg-purple-50 text-purple-600' : ''}
                                                            ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : ''}
                                                        `}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirm</option>
                                                        <option value="Shipped">Ship Order</option>
                                                        <option value="Delivered">Deliver</option>
                                                        <option value="Cancelled">Cancel</option>
                                                    </select>

                                                    <div className="mt-2 group-hover:block hidden">
                                                        <select className="text-[9px] font-bold bg-slate-100 border-none rounded-lg px-2 py-1 outline-none text-slate-500">
                                                            <option>Assign Staff</option>
                                                            <option>John (Staff)</option>
                                                            <option>Sarah (Manager)</option>
                                                            <option>Mike (Delivery)</option>
                                                        </select>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-4 text-xs font-bold text-slate-400">{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-white">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {preBookings.length === 0 ? (
                                            <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">No pre-bookings found</td></tr>
                                        ) : preBookings.map((pb, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-sm text-slate-900">{pb.productName}</div>
                                                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Pre-Order</div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-sm text-slate-900">{pb.customerName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400">{pb.customerPhone}</div>
                                                </td>
                                                <td className="px-8 py-4 font-black text-sm text-slate-900">{pb.quantity}</td>
                                                <td className="px-8 py-4">
                                                    <button
                                                        onClick={() => onUpdatePreBooking(pb.id, 'Confirmed')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all"
                                                    >
                                                        Confirm
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>


                {/* Quick Actions & Store Health */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">

                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-purple-600" />
                            Marketing
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-[20px] flex items-center justify-between active:scale-95 transition-transform cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-purple-600 shadow-sm">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Create Coupon</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-[20px] flex items-center justify-between active:scale-95 transition-transform cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Share Link</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Settings Modal */}
            {showSettings && (
                <Portal>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                            {/* Blue Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
                                <h2 className="text-xl font-black text-white">Store Settings</h2>
                                <button onClick={() => setShowSettings(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                                    <Plus className="w-4 h-4 rotate-45" />
                                </button>
                            </div>

                            <div className="p-8 lg:p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Store Name</label>
                                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="Nexarats Online Shop" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Custom Domain</label>
                                        <div className="relative">
                                            <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all pr-12" placeholder="shop.nexarats.com" />
                                            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Currency</label>
                                        <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                            <option>INR (₹) - Indian Rupee</option>
                                            <option>USD ($) - US Dollar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Order Minimum (₹)</label>
                                        <input type="number" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="499" />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Store is currently Live</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publicly accessible</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-95">
                                        Go Offline
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowSettings(false)} className="px-8 py-4 text-slate-600 font-black rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                                <button onClick={() => setShowSettings(false)} className="px-10 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default OnlineStore;
