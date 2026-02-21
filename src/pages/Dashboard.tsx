import React from 'react';
import { Product, Customer, Vendor, Transaction, PurchaseOrder, User } from '../types';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag,
  Warehouse, BarChart2, AlertCircle, Calendar, Coins
} from 'lucide-react';


interface DashboardProps {
  onNavigateBilling: () => void;
  onVisitStore: () => void;
  stats: {
    inventoryValue: number;
    lowStockCount: number;
  };
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  transactions: Transaction[];
  purchases: PurchaseOrder[];
  user?: User | null;
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
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className={`flex items-center space-x-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        <span>{isPositive ? '+' : ''}{change}%</span>
        {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      </div>
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-xl font-black text-slate-900 mb-1">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigateBilling, onVisitStore, stats, products, customers, vendors, transactions = [], purchases = [], user }) => {

  const [timeFilter, setTimeFilter] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  // Compute real data from app state
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

  const totalProfit = products.reduce((sum, p) => sum + (p.price - (p.purchasePrice || 0)) * p.stock, 0);
  const profitMargin = inventoryValue > 0 ? ((totalProfit / inventoryValue) * 100).toFixed(1) : '0';


  const safeTransactions = transactions;
  const safeCustomers = customers;
  const activeCustomerIds = new Set(safeCustomers.map(c => c.id));

  // Only count transactions linked to existing customers
  const validTransactions = safeTransactions.filter(t => activeCustomerIds.has(t.customerId));

  // FILTER LOGIC FOR PERFORMANCE OVERVIEW - Fixed timezone issue
  const getFilteredTransactions = () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return validTransactions.filter(t => {
      if (timeFilter === 'Daily') {
        return t.date === todayStr;
      } else if (timeFilter === 'Weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const tDate = new Date(t.date);
        return tDate >= weekAgo;
      } else {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // ONLINE VS OFFLINE SALES
  const totalOnlineSales = validTransactions
    .filter(t => t.method !== 'cash')
    .reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  const totalOfflineSales = validTransactions
    .filter(t => t.method === 'cash')
    .reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  const totalCustomerPending = safeCustomers.reduce((sum, c) => sum + (Number(c.pending) || 0), 0);

  // Today handling - Fixed to use local string
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todaySales = validTransactions
    .filter(t => t.date === todayStr)
    .reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  const totalVendorPurchased = vendors.reduce((sum, v) => sum + (Number(v.totalPaid) || 0) + (Number(v.pendingAmount) || 0), 0);
  const totalVendorPaid = vendors.reduce((sum, v) => sum + (Number(v.totalPaid) || 0), 0);
  const totalVendorPending = vendors.reduce((sum, v) => sum + (Number(v.pendingAmount) || 0), 0);

  const netSales = totalOnlineSales + totalOfflineSales;

  // Vendor pie chart - real data
  const vendorPieData = [
    { name: 'Purchased', value: totalVendorPurchased, color: '#8b5cf6' },
    { name: 'Paid', value: totalVendorPaid, color: '#10b981' },
    { name: 'Pending', value: totalVendorPending, color: '#f59e0b' }
  ];

  // PERFORMANCE OVERVIEW DATA GENERATION
  const getPerformanceData = () => {
    const result: { name: string, value: number }[] = [];

    if (timeFilter === 'Daily') {
      // Last 24 hours trend
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

        // Match transactions from today's date (mock data doesn't have hours, so we split today's total)
        const isToday = d.toDateString() === now.toDateString();
        const value = isToday ? (todaySales / 12) : 0; // Simplified distribution for visualization

        result.push({ name: hourLabel, value: Math.round(value) });
      }
    } else if (timeFilter === 'Weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });

        const dayTotal = validTransactions
          .filter(t => t.date === dayKey)
          .reduce((sum, t) => sum + (Number(t.total) || 0), 0);

        result.push({ name: label, value: dayTotal });
      }
    } else if (timeFilter === 'Monthly') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const dayTotal = validTransactions
          .filter(t => t.date === dayKey)
          .reduce((sum, t) => sum + (Number(t.total) || 0), 0);

        result.push({ name: label, value: dayTotal });
      }
    }
    return result;
  };



  const performanceData = getPerformanceData();

  // Customer Analytics - Online vs Offline per customer
  const customerAnalyticsData = customers.slice(0, 6).map(c => {
    const custTrans = validTransactions.filter(t => t.customerId === c.id);
    return {
      name: c.name.split(' ')[0],
      online: custTrans.filter(t => t.method !== 'cash').reduce((sum, t) => sum + Number(t.total), 0),
      offline: custTrans.filter(t => t.method === 'cash').reduce((sum, t) => sum + Number(t.total), 0),
    };
  });
  if (customerAnalyticsData.length === 0) customerAnalyticsData.push({ name: 'No Data', online: 0, offline: 0 });

  return (
    <div className="space-y-6">

      {/* Row 1: 6 Stat Cards in a row */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        <StatCard title="Online Sales" value={`₹${totalOnlineSales.toLocaleString('en-IN')}`} change="0" isPositive={true} icon={ShoppingBag} iconColor="bg-orange-500" subtitle="Digital payments" />
        <StatCard title="Offline Sales" value={`₹${totalOfflineSales.toLocaleString('en-IN')}`} change="0" isPositive={true} icon={Coins} iconColor="bg-emerald-500" subtitle="Cash payments" />
        <StatCard title="Net Sales" value={`₹${netSales.toLocaleString('en-IN')}`} change="0" isPositive={netSales > 0} icon={IndianRupee} iconColor="bg-green-500" subtitle={`${customers.length} total customers`} />
        <StatCard title="Inventory Assets" value={`₹${inventoryValue.toLocaleString('en-IN')}`} change="0" isPositive={inventoryValue > 0} icon={Warehouse} iconColor="bg-blue-600" subtitle={`${products.length} products`} />
        <StatCard title="Profit & Margin" value={`₹${totalProfit.toLocaleString('en-IN')}`} change="0" isPositive={totalProfit > 0} icon={BarChart2} iconColor="bg-purple-600" subtitle={`Margin: ${profitMargin}%`} />
        <StatCard title="Low Stock" value={String(lowStockCount)} change="0" isPositive={lowStockCount === 0} icon={AlertCircle} iconColor="bg-red-500" subtitle={`${products.filter(p => p.status === 'Out of Stock').length} out of stock`} />
      </div>




      {/* Row 2: Performance Overview (2/3) + Real-Time Today (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Overview</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {timeFilter === 'Daily' ? 'Today\'s Sales by Category' : `${timeFilter} Revenue Trend`}
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setTimeFilter('Daily')}
                className={`px-4 py-2 rounded-lg transition-all ${timeFilter === 'Daily' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}
              >Daily</button>
              <button
                onClick={() => setTimeFilter('Weekly')}
                className={`px-4 py-2 rounded-lg transition-all ${timeFilter === 'Weekly' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}
              >Weekly</button>
              <button
                onClick={() => setTimeFilter('Monthly')}
                className={`px-4 py-2 rounded-lg transition-all ${timeFilter === 'Monthly' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}
              >Monthly</button>
            </div>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                  interval={timeFilter === 'Monthly' ? 5 : timeFilter === 'Daily' ? 3 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#EF4444' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1000}
                />
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
            <h3 className="text-lg font-black text-slate-900 leading-tight">Customer<br />Sales Analytics</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Online</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Offline</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Calendar className="w-3 h-3 text-slate-400" />
                </button>
                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 bg-white p-3 rounded-lg border border-slate-100 shadow-xl z-50 min-w-[200px]">
                    <p className="text-[10px] font-bold text-slate-400 mb-2">Select Date Scope</p>
                    <input type="date" className="w-full text-xs p-2 border border-slate-100 rounded outline-none mb-2" />
                    <button onClick={() => setShowDatePicker(false)} className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Apply</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerAnalyticsData}>
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