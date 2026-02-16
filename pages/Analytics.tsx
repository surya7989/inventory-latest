import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, ChevronDown, CheckCircle } from 'lucide-react';

const salesTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  sales: 3000 + Math.sin(i * 0.5) * 1000 + Math.random() * 500
}));

const categoryData = [
  { name: 'Electronics', percentage: 42, color: '#3b82f6' },
  { name: 'Fashion', percentage: 28, color: '#0ea5e9' },
  { name: 'Home Goods', percentage: 15, color: '#38bdf8' },
  { name: 'Beauty', percentage: 10, color: '#7dd3fc' },
  { name: 'Accessories', percentage: 5, color: '#bae6fd' }
];

const vendorContributionData = [
  { name: 'TechSupply Co.', value: 38, color: '#3b82f6' },
  { name: 'Fashion Hub Ltd.', value: 24, color: '#8b5cf6' },
  { name: 'HomeStyle Imports', value: 15, color: '#f59e0b' },
  { name: 'Beauty Essentials', value: 13, color: '#ef4444' },
  { name: 'Others', value: 10, color: '#9ca3af' }
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Product Performance Insights from Screenshot 24 */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Product Performance Insights</h3>
          <div className="flex items-center space-x-3">
             <button className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
               <Download className="w-4 h-4" />
               <span>Export</span>
             </button>
             <button className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-900 bg-white shadow-sm">
               <span>Select Product</span>
               <ChevronDown className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           <div className="lg:col-span-3">
              <p className="text-center text-[10px] font-black text-slate-400 mb-8 uppercase tracking-[0.3em]">30-Day Sales Trend</p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 mt-6 px-10">
                 <span>Day 1</span>
                 <span>Day 15</span>
                 <span>Day 30</span>
              </div>
           </div>

           <div className="space-y-8 flex flex-col justify-center border-l border-slate-100 pl-12">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reorder Status</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900">Worth Restocking</h4>
              </div>
              
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units Sold</p>
                 <div className="flex items-baseline space-x-3">
                    <h4 className="text-4xl font-black text-slate-900">2,847</h4>
                    <span className="text-xs font-black text-green-500">+12.5% vs last period</span>
                 </div>
              </div>

              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Generated</p>
                 <div className="flex items-baseline space-x-3">
                    <h4 className="text-4xl font-black text-blue-600">₹142,350</h4>
                    <span className="text-xs font-black text-green-500">+18.2% vs last period</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Customer Analytics</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience Report</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Most Preferred Categories</p>
          <div className="space-y-10">
            {categoryData.map(c => (
              <div key={c.name} className="space-y-3">
                 <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-900">{c.name}</span>
                    <span className="text-slate-400">{c.percentage}%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.percentage}%`, backgroundColor: c.color }}></div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-10">Vendor Analytics</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-full h-72 relative">
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                   <span className="block text-[10px] font-black text-slate-400 uppercase">Vendor Contribution</span>
                </p>
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                        data={vendorContributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {vendorContributionData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-10 grid grid-cols-2 gap-x-12 gap-y-6 w-full px-4">
                {vendorContributionData.map(v => (
                   <div key={v.name} className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: v.color}}></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v.name}</span>
                      <span className="text-[10px] font-black text-slate-900 ml-auto">{v.value}%</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;