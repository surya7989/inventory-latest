import React from 'react';
import { Product, Customer, Vendor } from '../types';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag,
  Warehouse, BarChart2, AlertCircle, Calendar
} from 'lucide-react';

interface DashboardProps {
  onNavigateBilling: () => void;
  stats: {
    inventoryValue: number;
    lowStockCount: number;
  };
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  transactions: any[];
  purchases: any[];
}

// All chart data is now computed dynamically inside the component from real data

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  iconColor: string;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, iconColor, subtitle }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`flex items-center space-x-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        <span>{isPositive ? '+' : ''}{change}%</span>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      </div>
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-xl font-black text-slate-900 mb-1">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigateBilling, stats, products, customers, vendors, transactions, purchases }) => {
  // Compute real data from app state
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

  const totalProfit = products.reduce((sum, p) => sum + (p.price - p.purchasePrice) * p.stock, 0);
  const profitMargin = inventoryValue > 0 ? ((totalProfit / inventoryValue) * 100).toFixed(1) : '0';

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const activeCustomerIds = new Set(safeCustomers.map(c => c.id));

  // Only count transactions linked to existing customers
  const validTransactions = safeTransactions.filter(t => activeCustomerIds.has(t.customerId));

  const totalCustomerPaid = safeCustomers.reduce((sum, c) => sum + (Number(c.totalPaid) || 0), 0);
  const totalCustomerPending = safeCustomers.reduce((sum, c) => sum + (Number(c.pending) || 0), 0);

  // Unified Date Handing for Today's Sales
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Primary source for Today's Sales is the VALID Transactions log
  const todayTransactions = validTransactions.filter(t => {
    if (!t.date) return false;
    // Handle both YYYY-MM-DD and YYYY-M-D formats
    const tD = t.date.split('-').map(part => part.padStart(2, '0')).join('-');
    return tD === todayStr;
  });

  const todaySales = todayTransactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  const totalVendorPurchased = vendors.reduce((sum, v) => sum + (Number(v.totalPaid) || 0) + (Number(v.pendingAmount) || 0), 0);
  const totalVendorPaid = vendors.reduce((sum, v) => sum + (Number(v.totalPaid) || 0), 0);
  const totalVendorPending = vendors.reduce((sum, v) => sum + (Number(v.pendingAmount) || 0), 0);

  // Net Sales logic: Sum of all valid transactions OR mock customer data if no transactions exist
  // If there are zero customers, the total is always zero.
  const transactionsTotal = validTransactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
  const netSales = safeCustomers.length === 0 ? 0 : (transactionsTotal > 0 ? transactionsTotal : totalCustomerPaid);

  // Vendor pie chart - real data, no fallbacks
  const vendorPieData = [
    { name: 'Purchased', value: totalVendorPurchased, color: '#8b5cf6' },
    { name: 'Paid', value: totalVendorPaid, color: '#10b981' },
    { name: 'Pending', value: totalVendorPending, color: '#f59e0b' }
  ];

  // Performance Overview - real inventory value per product category
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.price * p.stock);
  });
  const performanceData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  // If no products, show empty placeholder
  if (performanceData.length === 0) performanceData.push({ name: 'No Data', value: 0 });

  // Customer Purchase Analytics - real paid vs pending per customer
  const customerPurchaseData = customers.map(c => ({
    name: c.name.split(' ')[0],
    paid: c.totalPaid,
    pending: c.pending
  }));
  if (customerPurchaseData.length === 0) customerPurchaseData.push({ name: 'No Data', paid: 0, pending: 0 });

  return (
    <div className="space-y-6">
      {/* Row 1: 5 Stat Cards in a row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <StatCard title="Net Sales" value={`₹${netSales.toLocaleString('en-IN')}`} change="12.5" isPositive={netSales > 0} icon={IndianRupee} iconColor="bg-green-500" subtitle={`${customers.length} customers`} />
        <StatCard title="Online sales" value={`₹${totalCustomerPaid.toLocaleString('en-IN')}`} change="8.2" isPositive={true} icon={ShoppingBag} iconColor="bg-orange-500" subtitle={`${customers.filter(c => c.status === 'Paid').length} paid customers`} />
        <StatCard title="Inventory Assets" value={`₹${inventoryValue.toLocaleString('en-IN')}`} change="3.1" isPositive={inventoryValue > 0} icon={Warehouse} iconColor="bg-blue-600" subtitle={`${products.length} products`} />
        <StatCard title="Profit & Margin" value={`₹${totalProfit.toLocaleString('en-IN')}`} change={profitMargin} isPositive={totalProfit > 0} icon={BarChart2} iconColor="bg-purple-600" subtitle={`Margin: ${profitMargin}%`} />
        <StatCard title="Low Stock" value={String(lowStockCount)} change={lowStockCount > 0 ? String(lowStockCount) : '0'} isPositive={lowStockCount === 0} icon={AlertCircle} iconColor="bg-red-500" subtitle={`${products.filter(p => p.status === 'Out of Stock').length} out of stock`} />
      </div>

      {/* Row 2: Performance Overview (2/3) + Real-Time Today (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Overview</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button className="px-4 py-2 rounded-lg text-slate-500">Daily</button>
              <button className="px-4 py-2 rounded-lg bg-red-500 text-white shadow-sm">Weekly</button>
              <button className="px-4 py-2 rounded-lg text-slate-500">Monthly</button>
            </div>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
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

        {/* Real-Time Today Blue Panel */}
        <div className="bg-[#2563EB] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-widest mb-8">Real-Time Today</h3>
            <div className="space-y-6">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Today's Sales</p>
                <p className="text-3xl font-black">₹{todaySales.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Pending Payments</p>
                <p className="text-3xl font-black">₹{(totalCustomerPending + totalVendorPending).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Open Orders</p>
                <p className="text-3xl font-black">{vendors.length + customers.filter(c => c.status !== 'Paid').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Customer Purchase + Vendor Purchase Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Customer Purchase Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 leading-tight">Customer<br />Purchase<br />Analytics</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Paid</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pending</span>
              </div>
              <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <Calendar className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerPurchaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip />
                <Bar dataKey="paid" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Purchase Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-5">Vendor Purchase Analytics</h3>

          {/* Top stat boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="mb-5">
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Vendor Purchases</p>
              <p className="text-xl font-black text-slate-900">₹{totalVendorPurchased.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Customers</p>
              <p className="text-xl font-black text-slate-900">{customers.length}</p>
            </div>
          </div>

          {/* Vendor Payment Overview subtitle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-slate-700">Vendor Payment Overview</p>
            <button className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors">Filters</button>
          </div>

          {/* Donut chart + Legend side by side */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '160px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vendorPieData} innerRadius={45} outerRadius={70} paddingAngle={6} dataKey="value">
                    {vendorPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 pl-4">
              {vendorPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹{item.value.toLocaleString()}</span>
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