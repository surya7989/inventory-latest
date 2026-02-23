import React from 'react';
import { Search, Bell, LogOut, Menu, Calendar } from 'lucide-react';
import { Page, User } from '../types';

import { useLocalStorage } from '../hooks/useLocalStorage';

interface HeaderProps {
    activePage: Page;
    onPageChange: (page: Page) => void;
    onToggleSidebar: () => void;
    user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ activePage, onPageChange, onToggleSidebar, user }) => {
    const [profile] = useLocalStorage('inv_admin_profile', {
        name: 'NEXA Admin',
        avatar: ''
    });


    const displayName = profile.name.split(' ')[0] || user?.name?.split(' ')[0] || 'Admin';


    const titles: Partial<Record<Page, { title: string; subtitle: string }>> = {
        dashboard: { title: 'Dashboard', subtitle: `Welcome back, ${displayName}. Here's what's happening today.` },
        'invoice:create': { title: 'Billing Dashboard', subtitle: 'Dashboard > Billing' },
        'product:manage': { title: 'Inventory Dashboard', subtitle: 'Track stock levels, movement, and profitability' },
        customers: { title: 'Customer Management', subtitle: 'Manage and track all your customers in one place.' },
        vendors: { title: 'Vendors', subtitle: 'Manage vendor accounts, payment history, and outstanding amounts.' },
        analytics: { title: 'Analytics Dashboard', subtitle: 'Overview of product, customer, and vendor performance' },
        'settings:manage': { title: 'Settings', subtitle: 'Manage your business information' },
        reports: { title: 'Reports', subtitle: 'Generate and export business reports' },
        'expense:track': { title: 'Business Expenses', subtitle: 'Track and manage your operational costs' },
        'online-store': { title: 'Online Store Management', subtitle: 'Manage your digital storefront and orders' },
        storefront: { title: 'NEXA POS Storefront', subtitle: 'Customer-facing ordering portal' },
        'user:manage': { title: 'Admin Access', subtitle: 'Manage system administrators and permissions' },
        'payment:manage': { title: 'Payment Management', subtitle: 'Track and manage all payments' },
        'audit:read': { title: 'Audit Logs', subtitle: 'View system audit trail and activity logs' },
        'inventory:adjust': { title: 'Inventory Adjustment', subtitle: 'Adjust stock levels and manage inventory' },
        // Legacy aliases kept as fallback
        billing: { title: 'Billing Dashboard', subtitle: 'Dashboard > Billing' },
        inventory: { title: 'Inventory Dashboard', subtitle: 'Track stock levels, movement, and profitability' },
        expenses: { title: 'Business Expenses', subtitle: 'Track and manage your operational costs' },
        settings: { title: 'Settings', subtitle: 'Manage your business information' },
        'admin-access': { title: 'Admin Access', subtitle: 'Manage system administrators and permissions' },
        login: { title: '', subtitle: '' },
    };


    const { title, subtitle } = titles[activePage] || { title: 'Page', subtitle: '' };

    return (
        <header className="h-16 lg:h-20 bg-white shadow-sm px-4 lg:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-3.5 h-3.5" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg lg:text-2xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
                    <p className="text-xs lg:text-sm text-gray-500 truncate hidden sm:block">{subtitle}</p>
                </div>

            </div>

            <div className="flex items-center space-x-3 lg:space-x-5">
                {activePage === 'dashboard' && (
                    <div className="hidden md:flex items-center gap-3 mr-1">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Access: {user?.role || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                )}

                <button className="relative text-gray-500 hover:text-gray-700 transition-colors">

                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>


                <button
                    onClick={() => onPageChange('settings:manage')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
                    title="Go to Settings"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-transparent group-hover:border-blue-100 transition-all shadow-sm">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Admin" className="w-full h-full object-cover" />
                        ) : (
                            profile.name.charAt(0)
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
