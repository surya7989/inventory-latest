import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Phone, Mail, X, Building2 } from 'lucide-react';
import { Vendor } from '../types';

interface VendorsProps {
    vendors: Vendor[];
    onUpdate: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

const Vendors: React.FC<VendorsProps> = ({ vendors, onUpdate }) => {
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', businessName: '', gstNumber: '', phone: '', email: '' });

    const filtered = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.businessName.toLowerCase().includes(search.toLowerCase()) ||
        v.phone.includes(search)
    );

    const handleAdd = () => {
        const newVendor: Vendor = {
            id: `V-${Date.now()}`,
            ...formData,
            totalPaid: 0,
            pendingAmount: 0,
        };
        onUpdate(prev => [...prev, newVendor]);
        setShowAddModal(false);
        setFormData({ name: '', businessName: '', gstNumber: '', phone: '', email: '' });
    };

    const handleDelete = (id: string) => onUpdate(prev => prev.filter(v => v.id !== id));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button className="p-3 bg-slate-100 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /><span>Add Vendor</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-4 lg:px-6 py-4">Vendor</th>
                            <th className="px-4 lg:px-6 py-4 hidden md:table-cell">Business</th>
                            <th className="px-4 lg:px-6 py-4 hidden lg:table-cell">GST No.</th>
                            <th className="px-4 lg:px-6 py-4">Paid</th>
                            <th className="px-4 lg:px-6 py-4">Pending</th>
                            <th className="px-4 lg:px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50/50">
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-600 text-sm shrink-0">
                                            {v.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{v.name}</p>
                                            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                                                <Phone className="w-3 h-3" /><span>{v.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-600 truncate">{v.businessName}</span>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 hidden lg:table-cell text-xs font-mono text-slate-500">{v.gstNumber}</td>
                                <td className="px-4 lg:px-6 py-4 font-black text-sm text-green-600">₹{v.totalPaid.toLocaleString()}</td>
                                <td className="px-4 lg:px-6 py-4 font-black text-sm text-red-500">₹{v.pendingAmount.toLocaleString()}</td>
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Vendor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 lg:p-8 relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Add Vendor</h2>
                        <div className="space-y-4">
                            <div><label className="text-xs font-black text-slate-400 uppercase">Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">Business Name</label><input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">GST Number</label><input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">Phone</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">Email</label><input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                            <button onClick={handleAdd} disabled={!formData.name} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
