import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';

const Reports: React.FC = () => {
    const [selectedReport, setSelectedReport] = useState('sales');
    const [dateRange, setDateRange] = useState('this_month');

    const reports = [
        { id: 'sales', title: 'Sales Report', icon: DollarSign, description: 'Revenue, transactions, and sales trends' },
        { id: 'inventory', title: 'Inventory Report', icon: BarChart3, description: 'Stock levels, movement, and valuation' },
        { id: 'profit', title: 'Profit & Loss', icon: TrendingUp, description: 'Income, expenses, and net profit' },
        { id: 'gst', title: 'GST Report', icon: PieChart, description: 'CGST, SGST, and IGST breakdown' },
        { id: 'customer', title: 'Customer Report', icon: FileText, description: 'Payment history, outstanding, and activity' },
    ];

    return (
        <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {reports.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setSelectedReport(r.id)}
                        className={`p-4 lg:p-5 rounded border-2 text-left transition-all ${selectedReport === r.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-3 ${selectedReport === r.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <r.icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-sm text-slate-900">{r.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{r.description}</p>
                    </button>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-transparent text-sm font-bold outline-none">
                            <option value="today">Today</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_quarter">This Quarter</option>
                            <option value="this_year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <button className="p-2.5 bg-slate-50 rounded-sm text-slate-400"><Filter className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-sm font-bold text-sm">
                        <Download className="w-4 h-4" /><span className="hidden sm:inline">Export PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-sm font-bold text-sm">
                        <Download className="w-4 h-4" /><span className="hidden sm:inline">Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900">{reports.find(r => r.id === selectedReport)?.title} Preview</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Data for {dateRange.replace('_', ' ')}</p>
                </div>

                {selectedReport === 'sales' && (
                    <div className="p-4 lg:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
                            {[
                                { label: 'Total Sales', value: '₹8,45,000', color: 'text-green-600' },
                                { label: 'Total Transactions', value: '1,240', color: 'text-blue-600' },
                                { label: 'Avg. Order Value', value: '₹681', color: 'text-purple-600' },
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 lg:p-5 rounded">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Invoice</th>
                                        <th className="px-4 py-3 hidden sm:table-cell">Customer</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3 hidden md:table-cell">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {[
                                        { date: '16 Feb 2026', invoice: 'INV-001', customer: 'Rajesh Kumar', amount: '₹2,450', status: 'Paid' },
                                        { date: '15 Feb 2026', invoice: 'INV-002', customer: 'Priya Sharma', amount: '₹1,890', status: 'Paid' },
                                        { date: '14 Feb 2026', invoice: 'INV-003', customer: 'Walk-in', amount: '₹3,200', status: 'Paid' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-slate-500">{row.date}</td>
                                            <td className="px-4 py-3 font-bold text-blue-600">{row.invoice}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell">{row.customer}</td>
                                            <td className="px-4 py-3 font-black">{row.amount}</td>
                                            <td className="px-4 py-3 hidden md:table-cell"><span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase">{row.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedReport === 'inventory' && (
                    <div className="p-4 lg:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
                            {[
                                { label: 'Total Products', value: '156', color: 'text-blue-600' },
                                { label: 'Low Stock Items', value: '12', color: 'text-orange-600' },
                                { label: 'Out of Stock', value: '3', color: 'text-red-600' },
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 lg:p-5 rounded">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-400 text-center py-8">Select Export to download full inventory valuation report</p>
                    </div>
                )}

                {selectedReport !== 'sales' && selectedReport !== 'inventory' && (
                    <div className="p-8 lg:p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Click Export to generate the full {reports.find(r => r.id === selectedReport)?.title}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;


