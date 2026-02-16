
import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  onUpdate: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdate }) => {
  const [search, setSearch] = useState('');

  // Added search filtering logic using props data
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">All Customers</h2>
        <button className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-600 transition-all">
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
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
            <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4">Customer ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Total Amount Paid</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((c, i) => (
              <tr key={c.id || i} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{c.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone}</td>
                <td className="px-6 py-4 text-sm font-black text-gray-900">₹{c.totalPaid.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    c.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
