import React, { useState } from 'react';
import { ShieldCheck, Users, Key, History, UserPlus, Search, MoreVertical, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
    lastLogin: string;
}

const AdminAccess: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useLocalStorage<AdminUser[]>('nx_admin_users', [
        { id: '1', name: 'Surya Teja', email: 'surya@nexarats.com', role: 'Super Admin', status: 'Active', lastLogin: '10 mins ago' },
        { id: '2', name: 'Saisunil', email: 'sai@nexarats.com', role: 'Admin', status: 'Active', lastLogin: '1 hour ago' },
        { id: '3', name: 'Nexa Staff', email: 'staff@nexarats.com', role: 'Manager', status: 'Active', lastLogin: 'Yesterday' },
        { id: '4', name: 'Accountant', email: 'accounts@nexarats.com', role: 'Accountant', status: 'Inactive', lastLogin: '5 days ago' }
    ]);

    const stats = [
        { label: 'Total Admins', value: users.length.toString(), icon: Users, color: 'bg-blue-500' },
        { label: 'Active Sessions', value: '3', icon: Key, color: 'bg-emerald-500' },
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
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase">Admin Access Control</h2>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-sm font-bold text-sm transition-all shadow-lg shadow-slate-100">
                    <UserPlus className="w-3.5 h-3.5" />
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search admins..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded text-xs font-bold outline-none focus:border-red-500 transition-all w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role / Permissions</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-sm flex items-center justify-center font-black text-slate-400 text-xs">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{item.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                                            {item.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            {item.status === 'Active' ? (
                                                <div className="flex items-center space-x-1.5 text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                    <XCircle className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase">Disabled</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.lastLogin}</td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded transition-all text-slate-400">
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Logs Placeholder */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-widest mb-2">Security Audit Trails</h3>
                    <p className="text-slate-400 text-sm font-bold mb-6 max-w-lg">Monitor all sensitive administrative actions across the Nexarats network in real-time.</p>
                    <button className="px-6 py-2.5 bg-red-600 text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all">
                        View Audit Logs
                    </button>
                </div>
                <ShieldCheck className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
            </div>
        </div>
    );
};

export default AdminAccess;
