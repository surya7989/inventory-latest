import React, { useState } from 'react';
import { ShieldCheck, Users, Key, History, UserPlus, Search, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Trash2, Edit2, X, Save, Eye, EyeOff, Lock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
    lastLogin: string;
    permissions?: string[];
    password?: string;
}

const ACCESS_MODULES = [
    { id: 'dashboard', label: 'Dashboard Overview' },
    { id: 'billing', label: 'Billing & POS' },
    { id: 'inventory', label: 'Inventory Control' },
    { id: 'customers', label: 'Customer Relations' },
    { id: 'vendors', label: 'Vendor Management' },
    { id: 'analytics', label: 'Business Analytics' },
    { id: 'settings', label: 'System Settings' }
];

const AdminAccess: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState<{
        name: string;
        email: string;
        password: string;
        role: string;
        status: 'Active' | 'Inactive';
        permissions: string[];
    }>({
        name: '',
        email: '',
        password: '',
        role: 'Manager',
        status: 'Active',
        permissions: ['dashboard']
    });

    const [users, setUsers] = useLocalStorage<AdminUser[]>('nx_admin_users', [
        { id: '1', name: 'Surya Teja', email: 'surya@nexarats.com', role: 'Super Admin', status: 'Active', lastLogin: '10 mins ago', permissions: ACCESS_MODULES.map(m => m.id) },
        { id: '2', name: 'Saisunil', email: 'sai@nexarats.com', role: 'Admin', status: 'Active', lastLogin: '1 hour ago', permissions: ACCESS_MODULES.map(m => m.id) },
        { id: '3', name: 'Nexa Staff', email: 'staff@nexarats.com', role: 'Manager', status: 'Active', lastLogin: 'Yesterday', permissions: ['dashboard', 'billing', 'inventory'] },
        { id: '4', name: 'Accountant', email: 'accounts@nexarats.com', role: 'Accountant', status: 'Inactive', lastLogin: '5 days ago', permissions: ['dashboard', 'analytics'] }
    ]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvite = () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Please fill in all mandatory fields (Name, Email, Password)');
            return;
        }

        const userToAdd: AdminUser = {
            id: `ADM-${Date.now()}`,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            status: newUser.status,
            lastLogin: 'Never',
            permissions: newUser.permissions
        };

        setUsers([userToAdd, ...users]);
        setNewUser({ name: '', email: '', password: '', role: 'Manager', status: 'Active', permissions: ['dashboard'] });
        setIsModalOpen(false);
    };

    const togglePermission = (moduleId: string) => {
        setNewUser(prev => ({
            ...prev,
            permissions: prev.permissions.includes(moduleId)
                ? prev.permissions.filter(id => id !== moduleId)
                : [...prev.permissions, moduleId]
        }));
    };

    const toggleStatus = (id: string) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    };

    const deleteUser = (id: string) => {
        if (window.confirm('Are you sure you want to revoke access for this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const stats = [
        { label: 'Total Admins', value: users.length.toString(), icon: Users, color: 'bg-blue-500' },
        { label: 'Active Sessions', value: users.filter(u => u.status === 'Active').length.toString(), icon: Key, color: 'bg-emerald-500' },
        { label: 'Security Alerts', value: '0', icon: ShieldAlert, color: 'bg-orange-500' },
        { label: 'System Health', value: '100%', icon: History, color: 'bg-purple-600' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase leading-none">Admin Access Control</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage platform permissions and user credentials</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-sm font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-100"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite User</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded border border-slate-100 shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-sm ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Access Management</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find by name, email or role..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded text-xs font-bold outline-none focus:border-red-500 focus:bg-white transition-all w-full sm:w-80 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">User Details</th>
                                <th className="px-8 py-5">Role / Permissions</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5">Last Activity</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-sm border border-slate-200 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-red-600 transition-colors">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest inline-block w-fit ${item.role.includes('Admin') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {item.role}
                                            </span>
                                            <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">
                                                {item.permissions?.length || 0} Modules Enabled
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => toggleStatus(item.id)}
                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all border cursor-pointer ${item.status === 'Active'
                                                    ? 'text-green-600 bg-green-50 border-green-100 hover:bg-green-100'
                                                    : 'text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {item.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                <span className="text-[10px] font-black uppercase">{item.status}</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-500">{item.lastLogin}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingUser(item)}
                                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(item.id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button className="p-2 text-slate-400 group-hover:hidden"><MoreVertical className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No matching administrators found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left Side: Basic Info */}
                            <div className="p-8 space-y-6 bg-white">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <UserPlus className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase">New Administrator</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-red-500 outline-none text-sm font-bold"
                                            placeholder="Rahul Kumar"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-red-500 outline-none text-sm font-bold"
                                            placeholder="rahul@nexarats.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl focus:border-red-500 outline-none text-sm font-black tracking-widest"
                                                placeholder="••••••••"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designated Role</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-red-500 outline-none text-sm font-black appearance-none"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option>Admin</option>
                                            <option>Manager</option>
                                            <option>Accountant</option>
                                            <option>Staff</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Permissions Scope */}
                            <div className="p-8 bg-slate-50 border-l border-slate-100 flex flex-col">
                                <div className="mb-6">
                                    <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 block">Permission Scope</label>
                                    <h4 className="text-sm font-black text-slate-900 uppercase">Module Access Control</h4>
                                </div>

                                <div className="flex-1 space-y-3">
                                    {ACCESS_MODULES.map((module) => (
                                        <label key={module.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-red-200 hover:shadow-sm transition-all group">
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-red-600 transition-colors">{module.label}</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={newUser.permissions.includes(module.id)}
                                                    onChange={() => togglePermission(module.id)}
                                                />
                                                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-600"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleInvite}
                                        className="flex-1 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                                    >
                                        Authorise
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal (Matching new style) */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Edit2 className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-black text-slate-900 uppercase">Update Account</h3>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-xl">
                                    {editingUser.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{editingUser.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingUser.email}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Level</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-red-500 outline-none text-sm font-black"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option>Super Admin</option>
                                        <option>Admin</option>
                                        <option>Manager</option>
                                        <option>Accountant</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50">
                            <button
                                onClick={() => {
                                    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                                    setEditingUser(null);
                                }}
                                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                            >
                                <Save className="w-4 h-4" /> Save Authority Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAccess;
