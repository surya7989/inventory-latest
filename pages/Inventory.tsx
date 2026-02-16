import React, { useState } from 'react';
import { Search, Plus, Filter, Grid, List, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    price: '',
    purchasePrice: '',
    stock: '',
    sku: '',
    gstRate: '18'
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      purchasePrice: Number(formData.purchasePrice),
      stock: Number(formData.stock),
      sku: formData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      gstRate: Number(formData.gstRate),
      status: Number(formData.stock) > 10 ? 'In Stock' : Number(formData.stock) > 0 ? 'Low Stock' : 'Out of Stock',
      image: 'https://picsum.photos/200/200?random=' + Math.random()
    };
    onUpdate([...products, newProduct]);
    setShowAddModal(false);
    setFormData({ name: '', category: 'General', price: '', purchasePrice: '', stock: '', sku: '', gstRate: '18' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onUpdate(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Inventory Items</h2>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage your warehouse stock</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..." 
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium" 
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5">Product Details</th>
              <th className="px-8 py-5">SKU ID</th>
              <th className="px-8 py-5 text-center">Stock</th>
              <th className="px-8 py-5">Purchase Price</th>
              <th className="px-8 py-5">Selling Price</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(p => (
              <tr key={p.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <img src={p.image} className="w-12 h-12 rounded-2xl object-cover bg-gray-100" />
                    <div>
                      <span className="block font-black text-gray-900 text-sm">{p.name}</span>
                      <span className="block text-xs font-bold text-gray-400">{p.category}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-blue-600 uppercase">{p.sku}</td>
                <td className="px-8 py-6 text-center">
                   <span className={`font-black ${p.stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                </td>
                <td className="px-8 py-6 font-bold text-gray-500">₹{p.purchasePrice}</td>
                <td className="px-8 py-6 font-black text-gray-900">₹{p.price}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    p.status === 'In Stock' ? 'bg-green-100 text-green-600' : p.status === 'Low Stock' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">Add New Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-red-500"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleAddItem} className="p-10 grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                  <option>Dairy</option><option>Snacks</option><option>Groceries</option><option>Personal Care</option><option>General</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">SKU Code (Optional)</label>
                <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">Stock Quantity</label>
                <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">GST Rate (%)</label>
                <select value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                  <option>0</option><option>5</option><option>12</option><option>18</option><option>28</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">Purchase Price</label>
                <input required type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">Selling Price</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
              </div>
              <button type="submit" className="col-span-2 mt-4 bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all">
                Add to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;