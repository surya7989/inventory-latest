import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, Mail, Phone, X, FileSpreadsheet, FileText, Check, FileDown, ArrowDownToLine, ArrowLeft, MoreVertical, Calendar, Clock, CreditCard, ShieldCheck, MapPin, Printer, Send } from 'lucide-react';
import { Customer, Transaction } from '../types';

interface CustomersProps {
    customers: Customer[];
    transactions: Transaction[];
    onUpdate: React.Dispatch<React.SetStateAction<Customer[]>>;
    onDelete?: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, transactions, onUpdate, onDelete }) => {
    const [search, setSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [includeZeroBalance, setIncludeZeroBalance] = useState(true);
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

    const handleDelete = (id: string) => {
        if (onDelete) onDelete(id);
        else onUpdate(prev => prev.filter(c => c.id !== id));
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === filtered.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filtered.map(c => c.id));
        }
    };

    const toggleRow = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    if (selectedCustomerId && selectedCustomer) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Profile Header */}
                <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative overflow-hidden">
                    <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="absolute top-6 left-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-20 h-20 bg-blue-50 rounded flex items-center justify-center font-black text-blue-600 text-3xl shrink-0 mt-8 md:mt-0 uppercase">
                        {selectedCustomer.name.charAt(0)}
                    </div>

                    <div className="flex-1 text-center md:text-left mt-8 md:mt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                            <h2 className="text-3xl font-black text-slate-900">{selectedCustomer.name}</h2>
                            <span className={`w-fit mx-auto md:mx-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedCustomer.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                selectedCustomer.status === 'Partial' ? 'bg-orange-100 text-orange-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {selectedCustomer.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-bold text-slate-400">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                <span>{selectedCustomer.id}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{selectedCustomer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{selectedCustomer.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[
                        { label: 'Total Received', value: `₹${selectedCustomer.totalPaid.toLocaleString()}`, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Pending Amount', value: `₹${selectedCustomer.pending.toLocaleString()}`, icon: Clock, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'Total Invoices', value: (selectedCustomer.totalInvoices || 0).toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Last Transaction', value: selectedCustomer.lastTransaction || 'No transactions', icon: Calendar, color: 'text-slate-600', bg: 'bg-slate-50' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{m.label}</p>
                            <div className="flex items-end justify-between">
                                <h3 className={`text-2xl font-black ${m.color}`}>{m.value}</h3>
                                <div className={`p-2.5 rounded ${m.bg}`}>
                                    <m.icon className={`w-5 h-5 ${m.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Transactions Table Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="text-xl font-black text-slate-900">Recent Transactions</h3>
                                <div className="flex items-center space-x-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input placeholder="Search transactions..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-sm hover:bg-slate-100 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-5">Invoice ID</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.filter(t => t.customerId === selectedCustomerId).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No transactions found for this customer.</td>
                                            </tr>
                                        ) : (
                                            transactions.filter(t => t.customerId === selectedCustomerId).map((t, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            <span className="font-bold text-sm text-slate-900">{t.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{t.date}</td>
                                                    <td className="px-8 py-6 text-sm font-black text-slate-900">₹{t.total.toLocaleString()}</td>
                                                    <td className="px-8 py-6 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                                            t.status === 'Partial' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-red-100 text-red-600'
                                                            }`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-8 mt-auto border-t border-slate-50 flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-400">Showing 1 to 6 of 6 entries</p>
                                <div className="flex space-x-2">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-sm bg-slate-50 text-slate-400 font-bold hover:bg-slate-100 transition-all border border-slate-100">1</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact Information</h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Customer ID</p>
                                        <p className="text-sm font-black text-slate-900">{selectedCustomer.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Phone Number</p>
                                        <p className="text-sm font-bold text-slate-900">{selectedCustomer.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Email</p>
                                        <p className="text-sm font-bold text-slate-900">{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Address</p>
                                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                                            123, MG Road, Bangalore<br />Karnataka - 560001
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Financial Summary</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Total Amount Received</span>
                                        <span className="text-sm font-black text-green-600">₹{selectedCustomer.totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Pending Amount</span>
                                        <span className="text-sm font-black text-red-500">₹{selectedCustomer.pending.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Total Transactions</span>
                                        <span className="text-xs font-black text-slate-900">12 Invoices</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Quick Actions</h4>
                                <div className="space-y-3">
                                    <button className="w-full py-4 px-6 bg-white border-2 border-slate-100 rounded font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 text-sm">
                                        <Printer className="w-4 h-4" />
                                        <span>Generate Invoice</span>
                                    </button>
                                    <button className="w-full py-4 px-6 bg-white border-2 border-slate-100 rounded font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 text-sm">
                                        <Send className="w-4 h-4" />
                                        <span>Send Reminder</span>
                                    </button>
                                    <button className="w-full py-4 px-6 bg-white border-2 border-slate-100 rounded font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 text-sm">
                                        <Download className="w-4 h-4" />
                                        <span>Download Statement</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button className="p-3 bg-slate-100 rounded-sm text-slate-500 hover:bg-slate-200 transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="p-3 bg-slate-100 rounded-sm text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-sm font-bold text-sm whitespace-nowrap shadow-lg shadow-blue-100">
                        <Plus className="w-4 h-4" /><span>Add Customer</span>
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded border border-slate-100 overflow-hidden overflow-x-auto shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-4 lg:px-6 py-4 w-10">
                                <div
                                    onClick={toggleSelectAll}
                                    className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedRows.length === filtered.length && filtered.length > 0
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 bg-white hover:border-blue-400'
                                        }`}
                                >
                                    {selectedRows.length === filtered.length && filtered.length > 0 && (
                                        <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                    )}
                                </div>
                            </th>
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
                            <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${selectedRows.includes(c.id) ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-4 lg:px-6 py-4">
                                    <div
                                        onClick={() => toggleRow(c.id)}
                                        className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedRows.includes(c.id)
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-slate-300 bg-white hover:border-blue-400'
                                            }`}
                                    >
                                        {selectedRows.includes(c.id) && (
                                            <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 font-bold text-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm shrink-0 uppercase">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-slate-900 truncate">{c.name}</p>
                                            <button
                                                onClick={() => setSelectedCustomerId(c.id)}
                                                className="text-[10px] text-blue-600 font-black hover:underline tracking-tight"
                                            >
                                                {c.id}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                                            <Mail className="w-3 h-3 text-slate-300" />
                                            <span className="truncate">{c.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                                            <Phone className="w-3 h-3 text-slate-300" />
                                            <span>{c.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                    <p className="font-black text-sm text-green-600">₹{c.totalPaid.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                    <p className="font-black text-sm text-red-500">₹{c.pending.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Amount</p>
                                </td>
                                <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                                    <span className={`px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${c.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                        c.status === 'Partial' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-sm hover:bg-blue-50 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-sm hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 lg:p-10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Add Customer</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1.5 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="Enter customer name" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1.5 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="customer@example.com" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1.5 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="+91 00000 00000" />
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-10">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleAdd} disabled={!formData.name} className="flex-1 py-4 bg-blue-600 text-white font-black rounded shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col relative px-8 py-12 lg:px-12">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowExportModal(false)}
                            className="absolute top-8 right-8 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-sm transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-3">Export Items</h2>
                            <p className="text-slate-500 font-bold max-w-md mx-auto">
                                Export your customer database using Excel, PDF, or Barcode list formats.
                            </p>
                        </div>

                        <div className="bg-white border-2 border-slate-50 rounded-[32px] p-8 lg:p-10 shadow-sm relative overflow-hidden">
                            {/* Mesh Gradient Background */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -z-1" />

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-16 h-16 bg-blue-50 rounded flex items-center justify-center mb-6 border border-blue-100">
                                    <FileDown className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Export Customer Data</h3>
                                <p className="text-sm font-bold text-slate-400 mb-8">Choose the format you want to export your items.</p>

                                <div className="w-full space-y-4 max-w-sm mx-auto">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-black flex items-center justify-center space-x-3 shadow-lg shadow-blue-100 transition-all active:scale-95 group">
                                        <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Export as Excel (.xlsx)</span>
                                    </button>

                                    <button className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 py-4 rounded font-black flex items-center justify-center space-x-3 transition-all active:scale-95 group">
                                        <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Export as CSV (.csv)</span>
                                    </button>

                                    <button className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 py-4 rounded font-black flex items-center justify-center space-x-3 transition-all active:scale-95 group">
                                        <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Export as PDF (.pdf)</span>
                                    </button>
                                </div>

                                <div className="mt-8 text-left w-full max-w-sm border-t border-slate-100 pt-8">
                                    <button className="text-blue-600 font-black text-sm hover:underline flex items-center space-x-2 mb-6 group">
                                        <ArrowDownToLine className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                        <span>Download sample export format</span>
                                    </button>
                                    <ul className="space-y-3">
                                        <li className="flex items-start space-x-3">
                                            <div className="w-5 h-5 bg-green-50 rounded-sm flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Supports: .xlsx, .csv, .pdf</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="w-5 h-5 bg-green-50 rounded-sm flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">Exports all customers including contact & pending balance</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-10 flex items-center justify-start w-full max-w-sm">
                                    <label className="flex items-center space-x-4 cursor-pointer group">
                                        <div
                                            onClick={() => setIncludeZeroBalance(!includeZeroBalance)}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${includeZeroBalance ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                                        >
                                            {includeZeroBalance && <div className="w-3 h-3 bg-white rounded-full animate-in zoom-in duration-200" />}
                                        </div>
                                        <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">Include customers with zero balance</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;


