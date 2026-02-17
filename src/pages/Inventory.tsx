import React, { useState } from 'react';
import { Search, Plus, Filter, Grid, List, Edit2, Trash2, X, Image as ImageIcon, Upload, TrendingUp, TrendingDown, Calculator, Eye, FileSpreadsheet, FileText, Download, Check } from 'lucide-react';
import { Product } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InventoryProps {
    products: Product[];
    onUpdate: (products: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
    const [gstConfig] = useLocalStorage('nx_gst_config', {
        defaultRate: '18',
        enableCGST: true,
        enableSGST: true,
        enableIGST: false,
        taxInclusive: false,
    });

    const emptyForm = {
        name: '', category: 'General', price: '', purchasePrice: '', stock: '', sku: '', gstRate: gstConfig.defaultRate,
        unit: 'Pieces', expiryDate: '', returns: 'Returnable', image: ''
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ ...emptyForm });

    // Sync default GST rate when config changes (only if not editing)
    React.useEffect(() => {
        if (!editingId) {
            setFormData(prev => ({ ...prev, gstRate: gstConfig.defaultRate }));
        }
    }, [gstConfig.defaultRate, editingId]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [showImportModal, setShowImportModal] = useState(false);
    const [reviewBeforeImport, setReviewBeforeImport] = useState(true);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <div className="flex bg-slate-100 p-1 rounded-sm">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400'}`} title="Grid View"><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400'}`} title="Table View"><List className="w-4 h-4" /></button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-sm transition-all ${showFilters || selectedCategory !== 'All' || selectedStatus !== 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>

                        {showFilters && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)}></div>
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-2xl border border-slate-100 p-5 z-20 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">Filters</h4>
                                        <button
                                            onClick={() => { setSelectedCategory('All'); setSelectedStatus('All'); }}
                                            className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                                        >
                                            Reset All
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {categories.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setSelectedCategory(c)}
                                                        className={`px-3 py-2 rounded-sm text-[10px] font-bold text-left transition-all ${selectedCategory === c ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Stock Status</label>
                                            <div className="space-y-2">
                                                {statuses.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSelectedStatus(s)}
                                                        className={`w-full px-3 py-2 rounded-sm text-[10px] font-bold text-left transition-all ${selectedStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center space-x-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-sm font-bold text-sm whitespace-nowrap hover:bg-slate-200 transition-all"
                    >
                        <Upload className="w-4 h-4" /><span>Import</span>
                    </button>

                    <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-sm font-bold text-sm whitespace-nowrap shadow-lg shadow-blue-200">
                        <Plus className="w-4 h-4" /><span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Product Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                            <div className="aspect-square bg-slate-50 rounded-sm mb-4 overflow-hidden relative">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded-sm text-[10px] font-black uppercase ${p.status === 'In Stock' ? 'bg-green-100 text-green-600' : p.status === 'Low Stock' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
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
                                    <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-blue-600 rounded-sm hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-sm hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded border border-slate-100 overflow-hidden overflow-x-auto">
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
                                            <img src={p.image} className="w-10 h-10 rounded-sm object-cover" alt={p.name} />
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
                                            <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-blue-600 rounded-sm hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-sm hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
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
                    <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none">
                                    {['General', 'Dairy', 'Groceries', 'Personal Care', 'Beverages', 'Snacks', 'Electronics'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">SKU</label>
                                <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none" placeholder="Auto-generated if empty" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selling Price (₹)</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Purchase Price (₹)</label>
                                <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            {/* Profit Calculator */}
                            {(() => {
                                const sell = parseFloat(formData.price as string) || 0;
                                const purchase = parseFloat(formData.purchasePrice as string) || 0;
                                const profit = sell - purchase;
                                const margin = sell > 0 ? (profit / sell) * 100 : 0;
                                const hasValues = sell > 0 || purchase > 0;
                                const isProfit = profit > 0;
                                const isLoss = profit < 0;
                                return (
                                    <div className={`sm:col-span-2 p-4 rounded border-2 transition-all ${isProfit ? 'bg-green-50 border-green-200' : isLoss ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`p-2 rounded-sm ${isProfit ? 'bg-green-100' : isLoss ? 'bg-red-100' : 'bg-slate-200'
                                                }`}>
                                                <Calculator className={`w-4 h-4 ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-slate-500'
                                                    }`} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Profit Calculator</span>
                                        </div>
                                        {hasValues ? (
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className={`p-3 rounded-sm text-center ${isProfit ? 'bg-green-100/70' : isLoss ? 'bg-red-100/70' : 'bg-white'
                                                    }`}>
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        {isProfit ? <TrendingUp className="w-3 h-3 text-green-600" /> : isLoss ? <TrendingDown className="w-3 h-3 text-red-600" /> : null}
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Profit</p>
                                                    </div>
                                                    <p className={`text-lg font-black ${isProfit ? 'text-green-700' : isLoss ? 'text-red-700' : 'text-slate-400'
                                                        }`}>₹{Math.abs(profit).toFixed(2)}</p>
                                                    {isLoss && <p className="text-[10px] font-bold text-red-500">(Loss)</p>}
                                                </div>
                                                <div className={`p-3 rounded-sm text-center ${isProfit ? 'bg-green-100/70' : isLoss ? 'bg-red-100/70' : 'bg-white'
                                                    }`}>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Margin</p>
                                                    <p className={`text-lg font-black ${isProfit ? 'text-green-700' : isLoss ? 'text-red-700' : 'text-slate-400'
                                                        }`}>{Math.abs(margin).toFixed(1)}%</p>
                                                </div>
                                                <div className={`p-3 rounded-sm text-center ${isProfit ? 'bg-green-100/70' : isLoss ? 'bg-red-100/70' : 'bg-white'
                                                    }`}>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Per Unit</p>
                                                    <p className={`text-lg font-black ${isProfit ? 'text-green-700' : isLoss ? 'text-red-700' : 'text-slate-400'
                                                        }`}>₹{Math.abs(profit).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-medium text-center py-2">Enter selling and purchase prices to see profit</p>
                                        )}
                                    </div>
                                );
                            })()}

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock</label>
                                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                                <select value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none">
                                    {['0', '5', '12', '18', '28'].map(r => <option key={r} value={r}>{r}%</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit</label>
                                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none">
                                    {['Pieces', 'Kg', 'Liters', 'Meters', 'Box', 'Dozen'].map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Returns</label>
                                <select value={formData.returns} onChange={(e) => setFormData({ ...formData, returns: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none">
                                    <option>Returnable</option>
                                    <option>Not Returnable</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
                                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-sm outline-none" />
                            </div>

                            {/* Photo Upload */}
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Product Photo</label>
                                {formData.image ? (
                                    <div className="relative group">
                                        <img src={formData.image} alt="Product preview" className="w-full h-48 object-cover rounded-sm border-2 border-slate-100" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-sm transition-all flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewImage(formData.image)}
                                                className="px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                className="px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-sm hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="text-sm font-bold text-slate-500">Click to upload photo</span>
                                            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-slate-200"></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">or paste URL</span>
                                            <div className="h-px flex-1 bg-slate-200"></div>
                                        </div>
                                        <input
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-sm">Cancel</button>
                            <button onClick={handleSave} disabled={!formData.name} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-sm disabled:opacity-50">{editingId ? 'Update' : 'Add Product'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg text-slate-500 hover:text-red-500 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded" />
                    </div>
                </div>
            )}
            {/* Import Items Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-sm transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 lg:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-3">Import Items</h2>
                                <p className="text-slate-500 font-bold max-w-lg mx-auto">
                                    Add products to your inventory using Excel upload, barcode scanning, or PDF import.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Excel Upload Card */}
                                <div className="bg-white border-2 border-slate-100 rounded p-8 hover:border-green-500 transition-all group">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Upload from Excel</h3>
                                        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">Bulk import items using .xlsx or .csv files.</p>

                                        <div className="w-full border-2 border-dashed border-slate-200 rounded py-12 px-6 flex flex-col items-center justify-center mb-6 hover:bg-slate-50 cursor-pointer transition-colors group/drop">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover/drop:bg-blue-100 group-hover/drop:text-blue-600 transition-colors">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">Drag & drop your file here</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">or click to browse</p>
                                        </div>

                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-black shadow-lg shadow-blue-100 transition-all mb-4">
                                            Upload File
                                        </button>

                                        <button className="flex items-center space-x-2 text-blue-600 font-black text-sm hover:underline">
                                            <Download className="w-4 h-4" />
                                            <span>Download Excel Template</span>
                                        </button>
                                        <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest leading-loose">Supported formats: .xlsx, .csv | Max file size: 5MB</p>
                                    </div>
                                </div>

                                {/* PDF Upload Card */}
                                <div className="bg-white border-2 border-slate-100 rounded p-8 hover:border-blue-500 transition-all group">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-red-50 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <FileText className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Import from PDF</h3>
                                        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">Upload product lists in PDF format and extract items automatically.</p>

                                        <div className="w-full border-2 border-dashed border-slate-200 rounded py-12 px-6 flex flex-col items-center justify-center mb-6 hover:bg-slate-50 cursor-pointer transition-colors group/drop">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover/drop:bg-blue-100 group-hover/drop:text-blue-600 transition-colors">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">Drag & drop PDF here</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">or click to browse</p>
                                        </div>

                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-black shadow-lg shadow-blue-100 transition-all mb-4">
                                            Upload PDF
                                        </button>
                                        <div className="mt-8 invisible md:visible">.</div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest leading-loose">Supported: .pdf | Max: 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center pt-8 border-t border-slate-100">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div
                                        onClick={() => setReviewBeforeImport(!reviewBeforeImport)}
                                        className={`w-6 h-6 rounded-sm flex items-center justify-center border-2 transition-all ${reviewBeforeImport ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-300'}`}
                                    >
                                        {reviewBeforeImport && <Check className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">Review items before final import</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;


