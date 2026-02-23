import React, { useState } from 'react';
import { Wallet, Plus, Search, Filter, TrendingDown, Receipt, Calendar, MoreVertical, Trash2, Edit2, Eye, CheckCircle2, ShieldCheck, User as UserIcon, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User as AppUser } from '../types';
import Portal from '../components/Portal';

interface ExpensesProps {
    user?: AppUser | null;
    expenses: any[];
    onUpdate: (expenses: any[]) => void;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: 'Utilities' | 'Rent' | 'Salaries' | 'Marketing' | 'Supplies' | 'Other';
    date: string;
    status: 'Paid' | 'Pending';
    paymentMethod: 'Cash' | 'Bank' | 'UPI';
    photo?: string;
}

const Expenses: React.FC<ExpensesProps> = ({ user, expenses, onUpdate }) => {
    const permissionLevel = (user?.role === 'Super Admin') ? 'manage' : (user?.permissions?.['expenses'] || 'none');
    const isReadOnly = permissionLevel === 'read';
    const canManageExpenses = permissionLevel === 'manage' || permissionLevel === 'cru';
    const canDeleteExpenses = permissionLevel === 'manage' || permissionLevel === 'cru';

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    const setExpenses = onUpdate;

    const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
        description: '',
        amount: 0,
        category: 'Other',
        date: new Date().toLocaleDateString('en-CA'),
        status: 'Paid',
        paymentMethod: 'UPI',
        photo: ''
    });

    const categories = ['Utilities', 'Rent', 'Salaries', 'Marketing', 'Supplies', 'Other'];

    const filteredExpenses = expenses.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleAddExpense = () => {
        if (!newExpense.description || newExpense.amount <= 0) return;

        if (editingExpense) {
            setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...newExpense, id: e.id } : e));
        } else {
            const exp: Expense = {
                ...newExpense,
                id: `EXP-${Date.now()}`
            };
            setExpenses([exp, ...expenses]);
        }

        setIsModalOpen(false);
        setEditingExpense(null);
        setNewExpense({
            description: '',
            amount: 0,
            category: 'Other',
            date: new Date().toLocaleDateString('en-CA'), // Returns YYYY-MM-DD local
            status: 'Paid',
            paymentMethod: 'UPI',
            photo: ''
        });
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
        setNewExpense({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            status: expense.status,
            paymentMethod: expense.paymentMethod,
            photo: expense.photo || ''
        });
        setIsModalOpen(true);
    };

    const deleteExpense = (id: string) => {
        if (window.confirm('Delete this expense?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewExpense(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-sm flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase leading-none">Business Expenses</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track and manage operational costs</p>
                    </div>
                </div>
                {canManageExpenses && (
                    <button
                        onClick={() => {
                            setEditingExpense(null);
                            setNewExpense({
                                description: '',
                                amount: 0,
                                category: 'Other',
                                date: new Date().toISOString().split('T')[0],
                                status: 'Paid',
                                paymentMethod: 'UPI',
                                photo: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-sm font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Expense</span>
                    </button>
                )}
            </div>

            {isReadOnly && (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-orange-600 p-1.5 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-orange-900 uppercase">View Only Mode</p>
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">You have restricted access to expense tracking</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent (Monthly)</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{totalExpenses.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Payments</p>
                    <h3 className="text-2xl font-black text-rose-600">₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expense Count</p>
                    <h3 className="text-2xl font-black text-blue-600">{expenses.length} Entries</h3>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded text-xs font-bold outline-none focus:border-rose-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Expense Details</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded flex items-center justify-center">
                                                <TrendingDown className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{expense.description}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{expense.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">₹{expense.amount.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">{expense.date}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            {expense.photo && (
                                                <button
                                                    onClick={() => setViewingPhoto(expense.photo!)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="View Photo"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canManageExpenses && (
                                                <button
                                                    onClick={() => handleEditClick(expense)}
                                                    className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                                                    title="Edit Expense"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canDeleteExpenses && (
                                                <button onClick={() => deleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isReadOnly && (
                                                <div className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-full border border-slate-100">Locked</div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-50 rounded-[24px] w-full max-w-md max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-300">
                            {/* Header */}
                            <div className="px-8 py-5 bg-gradient-to-r from-rose-600 to-rose-700 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                                        <div className="bg-white/20 p-1.5 rounded-lg">
                                            {editingExpense ? <Edit2 className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-white" />}
                                        </div>
                                        {editingExpense ? 'Modify Expense' : 'Record Expense'}
                                    </h2>
                                    <p className="text-[10px] text-rose-200 font-bold uppercase tracking-widest mt-0.5 ml-9">Business Expense Management</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"><X className="w-3.5 h-3.5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Office Supplies"
                                        className="w-full mt-1.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 shadow-sm"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full mt-1.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 shadow-sm"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select
                                            className="w-full mt-1.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 shadow-sm appearance-none"
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                                        >
                                            {categories.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                        <select
                                            className="w-full mt-1.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 shadow-sm appearance-none"
                                            value={newExpense.status}
                                            onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as any })}
                                        >
                                            <option>Paid</option>
                                            <option>Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                                        <select
                                            className="w-full mt-1.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 shadow-sm appearance-none"
                                            value={newExpense.paymentMethod}
                                            onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
                                        >
                                            <option>Cash</option>
                                            <option>Bank</option>
                                            <option>UPI</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Voucher / Photo</label>
                                    <div className="mt-1.5 flex items-center gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-rose-500 hover:bg-rose-50 transition-all cursor-pointer group">
                                            {newExpense.photo ? (
                                                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                                                    <img src={newExpense.photo} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-rose-100 transition-colors">
                                                        <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-rose-600">Click to upload photo</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                        {newExpense.photo && (
                                            <button
                                                onClick={() => setNewExpense(prev => ({ ...prev, photo: '' }))}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                                title="Remove Photo"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 shrink-0">
                                <button
                                    onClick={handleAddExpense}
                                    className="w-full py-4 bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                                >
                                    {editingExpense ? 'Save Changes' : 'Record Expense'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* Photo Viewer Modal */}
            {viewingPhoto && (
                <Portal>
                    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
                        <div className="relative max-w-4xl w-full">
                            <button
                                onClick={() => setViewingPhoto(null)}
                                className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img src={viewingPhoto} alt="Expense Voucher" className="w-full h-auto rounded-3xl shadow-2xl" />
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default Expenses;
