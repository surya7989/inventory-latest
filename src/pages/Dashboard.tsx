import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { IndianRupee, ShoppingBag, Warehouse, BarChart2, AlertCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';

interface DashboardProps {
    onNavigateBilling: () => void;
    stats: {
        totalSales: number;
        inventoryValue: number;
        lowStockCount: number;
    };
}

const performanceData = [
    { name: 'Sun', value: 25000 },
    { name: 'Mon', value: 32000 },
    { name: 'Tue', value: 28000 },
    { name: 'Wed', value: 40000 },
    { name: 'Thu', value: 42000 },
    { name: 'Fri', value: 38000 },
    { name: 'Sat', value: 44000 },
];

const customerPurchaseData = [
    { name: 'JAN', online: 30, offline: 20 },
    { name: 'FEB', online: 35, offline: 25 },
    { name: 'MAR', online: 45, offline: 35 },
    { name: 'APR', online: 55, offline: 40 },
    { name: 'MAY', online: 65, offline: 45 },
    { name: 'JUN', online: 75, offline: 55 },
];

const vendorPieData = [
    { name: 'Purchased', value: 145800, color: '#8b5cf6' },
    { name: 'Paid', value: 73400, color: '#10b981' },
    { name: 'Pending', value: 72400, color: '#f59e0b' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigateBilling, stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                <StatCard title="Net Sales" value={`₹${stats.totalSales.toLocaleString()}`} change="12.5" isPositive={true} icon={IndianRupee} iconColor="bg-green-500" subtitle="vs last period" />
                <StatCard title="Online Sales" value="₹3,25,480" change="8.2" isPositive={true} icon={ShoppingBag} iconColor="bg-orange-500" subtitle="vs ₹3,00,720 last period" />
                <StatCard title="Inventory Assets" value={`₹${stats.inventoryValue.toLocaleString()}`} change="3.1" isPositive={false} icon={Warehouse} iconColor="bg-blue-600" subtitle="Total asset value" />
                <StatCard title="Profit & Margin" value="₹5,19,840" change="15.8" isPositive={true} icon={BarChart2} iconColor="bg-purple-600" subtitle="Margin: 61.5%" />
                <StatCard title="Low Stock" value={`${stats.lowStockCount}`} change="5.2" isPositive={false} icon={AlertCircle} iconColor="bg-red-500" subtitle="Items need restocking" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <h3 className="text-base lg:text-lg font-black text-slate-900 uppercase tracking-tight">Performance Overview</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                            <button className="px-3 lg:px-4 py-2 rounded-lg text-slate-500">Daily</button>
                            <button className="px-3 lg:px-4 py-2 rounded-lg bg-red-500 text-white shadow-sm">Weekly</button>
                            <button className="px-3 lg:px-4 py-2 rounded-lg text-slate-500">Monthly</button>
                        </div>
                    </div>
                    <div className="h-56 lg:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={3} fill="#FEF2F2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Real-Time Today Panel */}
                <div className="bg-[#2563EB] text-white p-6 lg:p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg lg:text-xl font-black uppercase tracking-widest mb-6 lg:mb-8">Real-Time Today</h3>
                        <div className="space-y-4 lg:space-y-8">
                            <div className="p-4 lg:p-5 bg-white/10 rounded-2xl border border-white/10">
                                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Today's Sales</p>
                                <p className="text-2xl lg:text-3xl font-black">₹28,450</p>
                            </div>
                            <div className="p-4 lg:p-5 bg-white/10 rounded-2xl border border-white/10">
                                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Pending Payments</p>
                                <p className="text-2xl lg:text-3xl font-black">₹45,200</p>
                            </div>
                            <div className="p-4 lg:p-5 bg-white/10 rounded-2xl border border-white/10">
                                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Open Orders</p>
                                <p className="text-2xl lg:text-3xl font-black">15</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <h3 className="text-base lg:text-lg font-black text-slate-900">Customer Purchase Analytics</h3>
                    </div>
                    <div className="h-56 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerPurchaseData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip />
                                <Bar dataKey="online" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="offline" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 mb-6 lg:mb-8">Vendor Purchase Analytics</h3>
                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-between">
                        <div className="w-full sm:w-1/2 h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={vendorPieData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                                        {vendorPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 space-y-4 sm:pr-4 mt-4 sm:mt-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Vendor Purchases</span>
                                <span className="text-lg font-black text-slate-900">₹1,45,000</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Customers</span>
                                <span className="text-lg font-black text-slate-900">1440</span>
                            </div>
                            <hr className="border-slate-100" />
                            {vendorPieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900">₹{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
