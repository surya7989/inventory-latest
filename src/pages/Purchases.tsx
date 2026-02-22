import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, ShoppingBag, Calendar, CheckCircle2, XCircle, Clock, MoreVertical, Trash2, Edit2, FileText } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PurchaseOrder, Vendor } from '../types';

const Purchases: React.FC = () => {
    const [vendors] = useLocalStorage<Vendor[]>('inv_vendors', []);
    const [purchases, setPurchases] = useLocalStorage<PurchaseOrder[]>('inv_purchases', [
        { id: 'PO-001', vendorId: vendors[0]?.id || 'V-001', amount: 45000, date: '2026-02-15', status: 'Paid' },
        { id: 'PO-002', vendorId: vendors[1]?.id || 'V-002', amount: 12000, date: '2026-02-20', status: 'Unpaid' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredPurchases = purchases.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendors.find(v => v.id === p.vendorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'Unknown Vendor';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-sm flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase leading-none">Purchase Orders</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage supplier orders and stock procurement</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-sm font-black text-xs uppercase tracking-widest transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New PO</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Procurement</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{purchases.reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Unpaid</p>
                    <h3 className="text-2xl font-black text-rose-600">₹{purchases.filter(p => p.status === 'Unpaid').reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <h3 className="text-2xl font-black text-blue-600">{purchases.length} Orders</h3>
                </div>
            </div>

            <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden text-[#1E293B]">
                <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or Vendor..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded text-xs font-bold outline-none focus:border-blue-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Vendor Name</th>
                                <th className="px-8 py-5">Total Amount</th>
                                <th className="px-8 py-5">Order Date</th>
                                <th className="px-8 py-5 text-center">Payment Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPurchases.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">{order.id}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-900">{getVendorName(order.vendorId)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.vendorId}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">₹{order.amount.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'Unpaid' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchases;
