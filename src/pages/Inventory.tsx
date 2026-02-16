import React, { useState } from 'react';
import { Search, Plus, Filter, Grid, List, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
    products: Product[];
    onUpdate: (products: Product[]) => void;
}

const emptyForm = {
    name: '', category: 'General', price: '', purchasePrice: '', stock: '', sku: '', gstRate: '18',
    unit: 'Pieces', expiryDate: '', returns: 'Returnable', image: ''
};

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = () => {
        const stock = parseInt(formData.stock as string) || 0;
        const status: Product['status'] = stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock';
        const productData: Product = {
            id: editingId || Date.now().toString(),
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price as string) || 0,
            purchasePrice: parseFloat(formData.purchasePrice as string) || 0,
            stock,
            status,
            sku: formData.sku || `SKU-${Date.now()}`,
            gstRate: parseFloat(formData.gstRate as string) || 0,
            unit: formData.unit,
            expiryDate: formData.expiryDate,
            returns: formData.returns as Product['returns'],
            image: formData.image || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/200`,
        };

        if (editingId) {
            onUpdate(products.map(p => p.id === editingId ? productData : p));
        } else {
            onUpdate([...products, productData]);
        }
        closeModal();
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            purchasePrice: product.purchasePrice.toString(),
            stock: product.stock.toString(),
            sku: product.sku,
            gstRate: product.gstRate.toString(),
            unit: product.unit || 'Pieces',
            expiryDate: product.expiryDate || '',
            returns: product.returns || 'Returnable',
            image: product.image || '',
        });
        setEditingId(product.id);
        setShowAddModal(true);
    };

    const handleDelete = (id: string) => {
        onUpdate(products.filter(p => p.id !== id));
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingId(null);
        setFormData({ ...emptyForm });
    };

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
                    </div>
                    <button className="p-3 bg-slate-100 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /><span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Product Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                            <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : p.status === 'Low Stock' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                    }`}>{p.status}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mb-1">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mb-2">{p.category} · SKU: {p.sku}</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-black text-slate-900">₹{p.price}</p>
                                    <p className="text-[10px] font-bold text-slate-400">Stock: {p.stock}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-4 lg:px-6 py-4">Product</th>
                                <th className="px-4 lg:px-6 py-4 hidden sm:table-cell">Category</th>
                                <th className="px-4 lg:px-6 py-4">Price</th>
                                <th className="px-4 lg:px-6 py-4 hidden md:table-cell">Purchase</th>
                                <th className="px-4 lg:px-6 py-4">Stock</th>
                                <th className="px-4 lg:px-6 py-4 hidden lg:table-cell">Status</th>
                                <th className="px-4 lg:px-6 py-4 hidden lg:table-cell">GST</th>
                                <th className="px-4 lg:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 lg:px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{p.name}</p>
                                                <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-500 hidden sm:table-cell">{p.category}</td>
                                    <td className="px-4 lg:px-6 py-4 font-black text-sm">₹{p.price}</td>
                                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-500 hidden md:table-cell">₹{p.purchasePrice}</td>
                                    <td className="px-4 lg:px-6 py-4 font-black text-sm">{p.stock}</td>
                                    <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : p.status === 'Low Stock' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                            }`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{p.gstRate}%</td>
                                    <td className="px-4 lg:px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                                    {['General', 'Dairy', 'Groceries', 'Personal Care', 'Beverages', 'Snacks', 'Electronics'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">SKU</label>
                                <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" placeholder="Auto-generated if empty" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selling Price (₹)</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Purchase Price (₹)</label>
                                <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock</label>
                                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                                <select value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                                    {['0', '5', '12', '18', '28'].map(r => <option key={r} value={r}>{r}%</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit</label>
                                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                                    {['Pieces', 'Kg', 'Liters', 'Meters', 'Box', 'Dozen'].map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Returns</label>
                                <select value={formData.returns} onChange={(e) => setFormData({ ...formData, returns: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                                    <option>Returnable</option>
                                    <option>Not Returnable</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
                                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Image URL</label>
                                <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none" placeholder="https://..." />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                            <button onClick={handleSave} disabled={!formData.name} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">{editingId ? 'Update' : 'Add Product'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
