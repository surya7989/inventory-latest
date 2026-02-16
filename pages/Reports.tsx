import React from 'react';
import { FileText, Download, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { Product } from '../types';

interface ReportsProps {
  products: Product[];
  transactions: any[];
}

const Reports: React.FC<ReportsProps> = ({ products, transactions }) => {
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItemsSold = transactions.reduce((sum, t) => sum + t.items.reduce((s: number, i: any) => s + i.quantity, 0), 0);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><IndianRupee className="w-6 h-6"/></div>
              <h4 className="font-black text-gray-400 uppercase text-xs tracking-widest">Total Revenue</h4>
           </div>
           <p className="text-4xl font-black text-gray-900">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp className="w-6 h-6"/></div>
              <h4 className="font-black text-gray-400 uppercase text-xs tracking-widest">Items Sold</h4>
           </div>
           <p className="text-4xl font-black text-gray-900">{totalItemsSold}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><FileText className="w-6 h-6"/></div>
              <h4 className="font-black text-gray-400 uppercase text-xs tracking-widest">Total Invoices</h4>
           </div>
           <p className="text-4xl font-black text-gray-900">{transactions.length}</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-2xl font-black text-gray-900">Recent Sales Report</h3>
           <button className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-2xl text-sm font-black hover:bg-gray-50">
              <Download className="w-5 h-5"/>
              <span>Export PDF</span>
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">No transactions found for current period</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-6 font-black text-blue-600 text-sm">#INV-{t.id.toString().slice(-6)}</td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{t.date.toLocaleString()}</td>
                    <td className="px-6 py-6 font-black text-gray-900">{t.items.length} Items</td>
                    <td className="px-6 py-6 font-black text-gray-900 text-lg">₹{t.total.toLocaleString()}</td>
                    <td className="px-6 py-6">
                      <span className="bg-green-100 text-green-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Completed</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;