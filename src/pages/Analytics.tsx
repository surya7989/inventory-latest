import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ArrowUp, ArrowDown, Package, Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { Product, Customer, Vendor, Transaction } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AnalyticsProps {
    products: Product[];
    customers: Customer[];
    vendors: Vendor[];
    transactions: Transaction[];
}

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6'];

const Analytics: React.FC<AnalyticsProps> = ({ products, customers, vendors, transactions }) => {
    const [gstConfig] = useLocalStorage('nx_gst_config', {
        defaultRate: '18',
        enableCGST: true,
        enableSGST: true,
        enableIGST: false,
    });

    const activeRate = parseFloat(gstConfig.defaultRate) || 0;

    // STRICT SYNC WITH DASHBOARD: Filter transactions by existing customers only
    const activeCustomerIds = new Set(customers.map(c => c.id));
    const validTransactions = transactions.filter(t => activeCustomerIds.has(t.customerId));

    const totalProducts = products.length;
    const totalCustomers = customers.length;
    const totalVendors = vendors.length;

    // Corrected Total Revenue logic: sum of all customer payments + direct transactions
    // This ensures that even without transaction logs, historical revenue is captured.
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.totalPaid) || 0), 0) +
        validTransactions.filter(t => t.customerId === 'WALK-IN').reduce((sum, t) => sum + Number(t.total), 0);

    // Tax collected from logged transactions
    const totalGstCollected = validTransactions.reduce((sum, t) => sum + (Number(t.gstAmount) || 0), 0);

    // Potential Revenue (Stock Value + Projected GST)
    const potentialRevenue = products.reduce((sum, p) => {
        const rate = p.gstRate !== undefined ? p.gstRate : activeRate;
        const priceWithTax = p.price * (1 + rate / 100);
        return sum + (priceWithTax * p.stock);
    }, 0);

    // Revenue vs Expenses by product category (real data + dynamic taxes)
    const catRevMap: Record<string, { revenue: number; expenses: number }> = {};
    products.forEach(p => {
        const cat = p.category || 'Other';
        if (!catRevMap[cat]) catRevMap[cat] = { revenue: 0, expenses: 0 };
        const rate = p.gstRate !== undefined ? p.gstRate : activeRate;
        const priceWithTax = p.price * (1 + rate / 100);
        catRevMap[cat].revenue += priceWithTax * p.stock;
        catRevMap[cat].expenses += p.purchasePrice * p.stock;
    });
    const monthlyRevenue = Object.entries(catRevMap).map(([month, data]) => ({
        month, revenue: data.revenue, expenses: data.expenses
    }));
    if (monthlyRevenue.length === 0) monthlyRevenue.push({ month: 'No Data', revenue: 0, expenses: 0 });

    // Category Distribution (real percentage by inventory value)
    const categoryData = Object.entries(catRevMap).map(([name, data], idx) => ({
        name,
        value: products.length > 0 ? Math.round((data.revenue / potentialRevenue) * 100) : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    })).filter(d => d.value > 0);

    if (categoryData.length === 0) categoryData.push({ name: 'No Stock', value: 100, color: '#94A3B8' });

    // Top Products (real data sorted by revenue)
    const topProducts = [...products]
        .map(p => {
            const rate = p.gstRate !== undefined ? p.gstRate : activeRate;
            const priceWithTax = p.price * (1 + rate / 100);
            return { name: p.name, sold: p.stock, revenue: priceWithTax * p.stock };
        })
        .sort((a, b) => b.revenue - a.revenue);
    const maxSold = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.sold)) : 1;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '0%', positive: true, icon: IndianRupee, color: 'bg-green-500' },
                    { title: 'Potential Value', value: `₹${potentialRevenue.toLocaleString()}`, change: '0%', positive: true, icon: TrendingUp, color: 'bg-orange-500' },
                    { title: 'Tax Collected', value: `₹${totalGstCollected.toLocaleString()}`, change: '0%', positive: true, icon: ShieldCheck, color: 'bg-indigo-500' },
                    { title: 'Customers', value: totalCustomers.toString(), change: '0%', positive: true, icon: Users, color: 'bg-purple-600' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white p-5 rounded border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-sm ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className={`text-xs font-bold ${card.positive ? 'text-green-600' : 'text-red-500'} flex items-center space-x-1`}>
                                {card.positive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                                <span>{card.change}</span>
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                        <h3 className="text-xl font-black text-slate-900">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses */}
                <div className="bg-white p-4 lg:p-6 rounded border border-slate-100 shadow-sm">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 mb-6">Revenue vs Expenses</h3>
                    <div className="h-56 lg:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="#D1FAE5" />
                                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="#FEE2E2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Value Distribution */}
                <div className="bg-white p-4 lg:p-6 rounded border border-slate-100 shadow-sm">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 mb-6">Inventory Value Distribution</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="w-full sm:w-1/2 h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 space-y-3 mt-4 sm:mt-0 px-4">
                            {categoryData.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Product Performance Bar Chart */}
                <div className="bg-white p-4 lg:p-6 rounded border border-slate-100 shadow-sm">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 mb-6">High Value Stock Segments</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} width={120} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-slate-100">
                    <h3 className="text-base lg:text-lg font-black text-slate-900">Top Selling Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-4 lg:px-6 py-4">Product</th>
                                <th className="px-4 lg:px-6 py-4">Units Sold</th>
                                <th className="px-4 lg:px-6 py-4">Revenue</th>
                                <th className="px-4 lg:px-6 py-4 hidden sm:table-cell">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {topProducts.map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 lg:px-6 py-4 font-bold text-sm text-slate-900">{p.name}</td>
                                    <td className="px-4 lg:px-6 py-4 font-black text-sm">{p.sold}</td>
                                    <td className="px-4 lg:px-6 py-4 font-black text-sm text-green-600">₹{p.revenue.toLocaleString()}</td>
                                    <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-blue-600 rounded-full h-2" style={{ width: `${(p.sold / maxSold) * 100}%` }}></div>
                                        </div>
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

export default Analytics;


