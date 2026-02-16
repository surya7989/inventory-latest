
import React, { useState } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, Building2, Smartphone, Mail } from 'lucide-react';
import { Vendor } from '../types';

interface VendorsProps {
  vendors: Vendor[];
  onUpdate: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

const Vendors: React.FC<VendorsProps> = ({ vendors, onUpdate }) => {
  const [search, setSearch] = useState('');

  // Added search filtering logic using props data
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Vendors</h2>
        <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-green-600 transition-all">
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
          />
        </div>
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4">Vendor Name</th>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">GST Number</th>
              <th className="px-6 py-4">Mobile Number</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Total Amount Paid</th>
              <th className="px-6 py-4">Pending Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVendors.map((v, i) => (
              <tr key={v.id || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{v.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-500">{v.businessName}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{v.gstNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{v.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{v.email}</td>
                <td className="px-6 py-4 text-sm font-black text-gray-900">₹{v.totalPaid.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`font-black ${v.pendingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ₹{v.pendingAmount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vendors;
