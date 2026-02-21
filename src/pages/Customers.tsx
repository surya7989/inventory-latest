import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, Mail, Phone, X, FileSpreadsheet, FileText, Check, FileDown, ArrowDownToLine, ArrowLeft, MoreVertical, Calendar, Clock, CreditCard, ShieldCheck, MapPin, Printer, Send, Users, Globe, Eye } from 'lucide-react';

import { Customer, Transaction } from '../types';
import Portal from '../components/Portal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemedInvoice from '../components/ThemedInvoice';


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
    const [historyType, setHistoryType] = useState<'offline' | 'online'>('offline');
    const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);

    // Theme Settings for Invoice
    const [adminProfile] = useLocalStorage('inv_admin_profile', {
        businessName: 'My Store',
        address: 'Business Address',
        phone: '',
        email: '',
        avatar: ''
    });
    const [invoiceTheme] = useLocalStorage('nx_invoice_theme', 'vy_classic');

    const handlePrintInvoice = (order: Transaction) => {
        setPrintingTransaction(order);
        setTimeout(() => {
            window.print();
            setPrintingTransaction(null);
        }, 100);
    };


    const filtered = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search);

        // In Offline CRM mode, only show customers who have POS history (totalInvoices > 0)
        // or the special WALK-IN customer
        if (historyType === 'offline') {
            return matchesSearch && ((c.totalInvoices || 0) > 0 || c.id === 'WALK-IN');
        }

        return matchesSearch;
    });


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
                        <ArrowLeft className="w-3.5 h-3.5" />
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
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                <span>{selectedCustomer.id}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{selectedCustomer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{selectedCustomer.email || 'No email provided'}</span>
                            </div>
                            {selectedCustomer.address && (
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{selectedCustomer.address}</span>
                                </div>
                            )}
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
                                    <m.icon className={`w-4 h-4 ${m.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Transactions Table Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-xl font-black text-slate-900">
                                        {historyType === 'offline' ? 'Offline Billing History' : 'Online Order History'}
                                    </h3>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${historyType === 'offline' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {historyType === 'offline' ? 'POS CRM' : 'Channel Sync'}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 w-full md:w-auto">

                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input placeholder="Search transactions..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-sm hover:bg-slate-100 transition-all">
                                        <Download className="w-3.5 h-3.5" />
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
                                            <th className="px-8 py-5">{historyType === 'offline' ? 'Payment Status' : 'Order Status'}</th>
                                            {historyType === 'online' && <th className="px-8 py-5">Delivery Details</th>}
                                            <th className="px-8 py-5">Actions</th>
                                        </tr>

                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.filter(t => t.customerId === selectedCustomerId && (historyType === 'offline' ? t.source !== 'online' : t.source === 'online')).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">No {historyType} transactions found for this customer.</td>
                                            </tr>
                                        ) : (
                                            transactions.filter(t => t.customerId === selectedCustomerId && (historyType === 'offline' ? t.source !== 'online' : t.source === 'online')).map((t, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${t.source === 'online' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                            <span className="font-bold text-sm text-slate-900">{t.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{t.date}</td>
                                                    <td className="px-8 py-6 text-sm font-black text-slate-900">₹{t.total.toLocaleString()}</td>
                                                    <td className="px-8 py-6 text-sm">
                                                        {historyType === 'offline' ? (
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                                                t.status === 'Partial' ? 'bg-orange-100 text-orange-600' :
                                                                    'bg-red-100 text-red-600'
                                                                }`}>
                                                                {t.status}
                                                            </span>
                                                        ) : (
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                                t.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-600' :
                                                                    t.orderStatus === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                                        'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                {t.orderStatus || 'Pending'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {historyType === 'online' && (
                                                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 max-w-[150px] truncate">
                                                            {selectedCustomer.address || 'Standard Delivery'}
                                                        </td>
                                                    )}
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            {historyType === 'online' ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handlePrintInvoice(t)}
                                                                        className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                                                        title="View Invoice"
                                                                    >
                                                                        <Printer className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handlePrintInvoice(t)}
                                                                        className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all"
                                                                        title="Download"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
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

                            {/* Quick Actions removed as requested */}

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Bar with Mode Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Database</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold mt-2">
                            <button
                                onClick={() => setHistoryType('offline')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${historyType === 'offline' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                            >
                                <Users className="w-3 h-3" />
                                Offline CRM
                            </button>
                            <button
                                onClick={() => setHistoryType('online')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${historyType === 'online' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                            >
                                <Globe className="w-3 h-3" />
                                Online Channel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={historyType === 'offline' ? "Search customers..." : "Search online orders..."}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <button className="p-3 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                        {historyType === 'offline' ? (
                            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm whitespace-nowrap shadow-xl shadow-blue-100 active:scale-95 transition-all">
                                <Plus className="w-4 h-4" /><span>New Customer</span>
                            </button>
                        ) : (
                            <button className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-sm whitespace-nowrap shadow-xl shadow-orange-100 active:scale-95 transition-all">
                                <FileDown className="w-4 h-4" /><span>Export Orders</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>


            {/* Dynamic Content Section */}
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                {historyType === 'offline' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 w-10">
                                        <div
                                            onClick={toggleSelectAll}
                                            className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedRows.length === filtered.length && filtered.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}
                                        >
                                            {selectedRows.length === filtered.length && filtered.length > 0 && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                        </div>
                                    </th>
                                    <th className="px-8 py-5">Customer Profile</th>
                                    <th className="px-8 py-5 hidden md:table-cell">Contact</th>
                                    <th className="px-8 py-5 text-green-600">Lifetime POS Spent</th>
                                    <th className="px-8 py-5 text-red-500">Pending Amount</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div onClick={() => toggleRow(c.id)} className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedRows.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                {selectedRows.includes(c.id) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm uppercase">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900">{c.name}</p>
                                                    <button onClick={() => setSelectedCustomerId(c.id)} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-tighter mt-0.5">{c.id}</button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 hidden md:table-cell">
                                            <p className="text-sm font-bold text-slate-600">{c.phone}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{c.email || 'No Email'}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-green-600">₹{c.totalPaid.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-sm font-black text-red-500">₹{c.pending.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 w-10">
                                        <div
                                            className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white transition-all cursor-pointer flex items-center justify-center"
                                        >
                                        </div>
                                    </th>
                                    <th className="px-8 py-5">Online Customer Profile</th>
                                    <th className="px-8 py-5 text-center">Fulfillment</th>
                                    <th className="px-8 py-5 text-right">Actions</th>


                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.filter(t => t.source === 'online').length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No online orders found in database</td>

                                    </tr>

                                ) : (
                                    transactions.filter(t => t.source === 'online').map(order => {
                                        const cust = customers.find(c => c.id === order.customerId);
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white transition-all cursor-pointer flex items-center justify-center">
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm uppercase">
                                                            {cust?.name.charAt(0) || 'O'}
                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => setSelectedCustomerId(order.customerId)}
                                                                className="font-black text-sm text-slate-900 hover:text-blue-600 hover:underline text-left block"
                                                            >
                                                                {cust?.name || 'Online Customer'}
                                                            </button>
                                                            <p className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-tighter mt-0.5">{order.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                        order.orderStatus === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {order.orderStatus || 'Pending'}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => handlePrintInvoice(order)}
                                                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all shadow-sm"
                                                            title="Print Invoice"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePrintInvoice(order)}
                                                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-600 transition-all shadow-sm"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {showAddModal && (
                <Portal>

                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                            {/* Blue Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
                                <h2 className="text-xl font-black text-white">Add Customer</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
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
                            <div className="flex space-x-4 px-8 pb-8">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded hover:bg-slate-200 transition-all">Cancel</button>
                                <button onClick={handleAdd} disabled={!formData.name} className="flex-1 py-4 bg-blue-600 text-white font-black rounded shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all">Create</button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <Portal>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">

                        <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col relative px-8 py-12 lg:px-12">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="absolute top-8 right-8 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-sm transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
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
                                        <FileDown className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Export Customer Data</h3>
                                    <p className="text-sm font-bold text-slate-400 mb-8">Choose the format you want to export your items.</p>

                                    <div className="w-full space-y-4 max-w-sm mx-auto">
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-black flex items-center justify-center space-x-3 shadow-lg shadow-blue-100 transition-all active:scale-95 group">
                                            <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Export as Excel (.xlsx)</span>
                                        </button>

                                        <button className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 py-4 rounded font-black flex items-center justify-center space-x-3 transition-all active:scale-95 group">
                                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Export as CSV (.csv)</span>
                                        </button>

                                        <button className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 py-4 rounded font-black flex items-center justify-center space-x-3 transition-all active:scale-95 group">
                                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Export as PDF (.pdf)</span>
                                        </button>
                                    </div>

                                    <div className="mt-8 text-left w-full max-w-sm border-t border-slate-100 pt-8">
                                        <button className="text-blue-600 font-black text-sm hover:underline flex items-center space-x-2 mb-6 group">
                                            <ArrowDownToLine className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                                            <span>Download sample export format</span>
                                        </button>
                                        <ul className="space-y-3">
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 bg-green-50 rounded-sm flex items-center justify-center mt-0.5">
                                                    <Check className="w-2.5 h-2.5 text-green-600" />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Supports: .xlsx, .csv, .pdf</span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 bg-green-50 rounded-sm flex items-center justify-center mt-0.5">
                                                    <Check className="w-2.5 h-2.5 text-green-600" />
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
                </Portal>
            )}
            {/* Hidden Printable Invoice Component */}
            <div id="printable-invoice" className="print-only hidden">
                {printingTransaction && (
                    <ThemedInvoice
                        adminProfile={adminProfile}
                        invoiceTheme={invoiceTheme}
                        customerName={customers.find(c => c.id === printingTransaction.customerId)?.name || 'Online Customer'}
                        customerPhone={customers.find(c => c.id === printingTransaction.customerId)?.phone || ''}
                        txnInfo={{
                            id: printingTransaction.id,
                            date: printingTransaction.date,
                            methodLabel: printingTransaction.method.toUpperCase()
                        }}
                        cart={printingTransaction.items}
                        finalGST={printingTransaction.gstAmount || 0}
                        calculatedGrandTotal={printingTransaction.total}
                        grandTotal={printingTransaction.total}
                        couponDiscount={0}
                        paymentSource={printingTransaction.source}
                    />
                )}
            </div>
        </div>
    );
};

export default Customers;


