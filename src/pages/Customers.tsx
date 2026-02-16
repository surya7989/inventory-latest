import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, Mail, Phone, X } from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
    customers: Customer[];
    onUpdate: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdate }) => {
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', totalPaid: '0', pending: '0' });

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const handleAdd = () => {
        const newCustomer: Customer = {
            id: `#C-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            totalPaid: parseFloat(formData.totalPaid) || 0,
            pending: parseFloat(formData.pending) || 0,
            status: parseFloat(formData.pending) === 0 ? 'Paid' : parseFloat(formData.totalPaid) > 0 ? 'Partial' : 'Unpaid',
        };
        onUpdate(prev => [...prev, newCustomer]);
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', totalPaid: '0', pending: '0' });
    };

    const handleDelete = (id: string) => onUpdate(prev => prev.filter(c => c.id !== id));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button className="p-3 bg-slate-100 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
                    <button className="p-3 bg-slate-100 rounded-xl text-slate-500"><Download className="w-4 h-4" /></button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /><span>Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-4 lg:px-6 py-4">Customer</th>
                            <th className="px-4 lg:px-6 py-4 hidden md:table-cell">Contact</th>
                            <th className="px-4 lg:px-6 py-4">Total Paid</th>
                            <th className="px-4 lg:px-6 py-4">Pending</th>
                            <th className="px-4 lg:px-6 py-4 hidden sm:table-cell">Status</th>
                            <th className="px-4 lg:px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{c.name}</p>
                                            <p className="text-[10px] text-slate-400">{c.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-xs text-slate-500"><Mail className="w-3 h-3" /><span className="truncate">{c.email}</span></div>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500"><Phone className="w-3 h-3" /><span>{c.phone}</span></div>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 font-black text-sm text-green-600">₹{c.totalPaid.toLocaleString()}</td>
                                <td className="px-4 lg:px-6 py-4 font-black text-sm text-red-500">₹{c.pending.toLocaleString()}</td>
                                <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.status === 'Paid' ? 'bg-green-100 text-green-600' : c.status === 'Partial' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                        }`}>{c.status}</span>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 lg:p-8 relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Add Customer</h2>
                        <div className="space-y-4">
                            <div><label className="text-xs font-black text-slate-400 uppercase">Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">Email</label><input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
                            <div><label className="text-xs font-black text-slate-400 uppercase">Phone</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" /></div>
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

export default Customers;
