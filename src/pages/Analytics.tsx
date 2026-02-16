import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ArrowUp, ArrowDown, Package, Users, IndianRupee } from 'lucide-react';
import { Product, Customer, Vendor } from '../types';

interface AnalyticsProps {
    products: Product[];
    customers: Customer[];
    vendors: Vendor[];
}

const monthlyRevenue = [
    { month: 'Jan', revenue: 42000, expenses: 28000 },
    { month: 'Feb', revenue: 38000, expenses: 25000 },
    { month: 'Mar', revenue: 55000, expenses: 32000 },
    { month: 'Apr', revenue: 48000, expenses: 30000 },
    { month: 'May', revenue: 62000, expenses: 35000 },
    { month: 'Jun', revenue: 58000, expenses: 33000 },
];

const categoryData = [
    { name: 'Dairy', value: 35, color: '#3B82F6' },
    { name: 'Groceries', value: 25, color: '#10B981' },
    { name: 'Personal Care', value: 20, color: '#8B5CF6' },
    { name: 'Beverages', value: 12, color: '#F59E0B' },
    { name: 'Others', value: 8, color: '#EF4444' },
];

const topProducts = [
    { name: 'Fortune Oil 1L', sold: 245, revenue: 44100 },
    { name: 'Amul Milk 1L', sold: 312, revenue: 19968 },
    { name: 'Basmati Rice 5kg', sold: 45, revenue: 28125 },
    { name: 'Colgate 200g', sold: 89, revenue: 11125 },
];

const Analytics: React.FC<AnalyticsProps> = ({ products, customers, vendors }) => {
    const totalRevenue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalCustomers = customers.length;
    const totalVendors = vendors.length;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+12.5%', positive: true, icon: IndianRupee, color: 'bg-green-500' },
                    { title: 'Products', value: products.length.toString(), change: '+3', positive: true, icon: Package, color: 'bg-blue-600' },
                    { title: 'Customers', value: totalCustomers.toString(), change: '+8', positive: true, icon: Users, color: 'bg-purple-600' },
                    { title: 'Vendors', value: totalVendors.toString(), change: '+2', positive: true, icon: TrendingUp, color: 'bg-orange-500' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-bold ${card.positive ? 'text-green-600' : 'text-red-500'} flex items-center space-x-1`}>
                                {card.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
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
                <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
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

                {/* Category Distribution */}
                <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 mb-6">Category Distribution</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="w-full sm:w-1/2 h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 space-y-3 mt-4 sm:mt-0">
                            {categoryData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-xs font-bold text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                                            <div className="bg-blue-600 rounded-full h-2" style={{ width: `${(p.sold / 312) * 100}%` }}></div>
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
