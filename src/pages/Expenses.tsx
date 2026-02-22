import React, { useState } from 'react';
import { Wallet, Plus, Search, Filter, TrendingDown, Receipt, Calendar, MoreVertical, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: 'Utilities' | 'Rent' | 'Salaries' | 'Marketing' | 'Supplies' | 'Other';
    date: string;
    status: 'Paid' | 'Pending';
    paymentMethod: 'Cash' | 'Bank' | 'UPI';
}

const Expenses: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const [expenses, setExpenses] = useLocalStorage<Expense[]>('nx_expenses', [
        { id: 'EXP-001', description: 'Monthly Rent', amount: 25000, category: 'Rent', date: '2026-02-01', status: 'Paid', paymentMethod: 'Bank' },
        { id: 'EXP-002', description: 'Electricity Bill', amount: 4500, category: 'Utilities', date: '2026-02-05', status: 'Paid', paymentMethod: 'UPI' },
        { id: 'EXP-003', description: 'Social Media Ads', amount: 5000, category: 'Marketing', date: '2026-02-10', status: 'Pending', paymentMethod: 'Cash' },
    ]);

    const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
        description: '',
        amount: 0,
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        paymentMethod: 'UPI'
    });

    const categories = ['Utilities', 'Rent', 'Salaries', 'Marketing', 'Supplies', 'Other'];

    const filteredExpenses = expenses.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleAddExpense = () => {
        if (!newExpense.description || newExpense.amount <= 0) return;
        const exp: Expense = {
            ...newExpense,
            id: `EXP-${Date.now()}`
        };
        setExpenses([exp, ...expenses]);
        setIsModalOpen(false);
        setNewExpense({
            description: '',
            amount: 0,
            category: 'Other',
            date: new Date().toISOString().split('T')[0],
            status: 'Paid',
            paymentMethod: 'UPI'
        });
    };

    const deleteExpense = (id: string) => {
        if (window.confirm('Delete this expense?')) {
            setExpenses(expenses.filter(e => e.id !== id));
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-sm font-black text-xs uppercase tracking-widest transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Expense</span>
                </button>
            </div>

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
                                            <button onClick={() => deleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 uppercase">New Expense</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-rose-600">
                                <Receipt className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Office Supplies"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-rose-500"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-rose-500"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-rose-500"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                                    >
                                        {categories.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-rose-500"
                                        value={newExpense.status}
                                        onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as any })}
                                    >
                                        <option>Paid</option>
                                        <option>Pending</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Payment Method</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-rose-500"
                                        value={newExpense.paymentMethod}
                                        onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
                                    >
                                        <option>Cash</option>
                                        <option>Bank</option>
                                        <option>UPI</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50">
                            <button
                                onClick={handleAddExpense}
                                className="w-full py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                            >
                                Record Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
