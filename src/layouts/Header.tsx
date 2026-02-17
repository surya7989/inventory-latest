import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { Page } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface HeaderProps {
    activePage: Page;
    onPageChange: (page: Page) => void;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onPageChange, onToggleSidebar }) => {
    const [profile] = useLocalStorage('nx_admin_profile', {
        name: 'John Anderson',
        avatar: ''
    });

    const titles: Record<Page, { title: string; subtitle: string }> = {
        dashboard: { title: 'Dashboard', subtitle: `Welcome back, ${profile.name.split(' ')[0]}. Here's what's happening today.` },
        billing: { title: 'Billing Dashboard', subtitle: 'Dashboard > Billing' },
        inventory: { title: 'Inventory Dashboard', subtitle: 'Track stock levels, movement, and profitability' },
        customers: { title: 'Customer Management', subtitle: 'Manage and track all your customers in one place.' },
        vendors: { title: 'Vendors', subtitle: 'Manage vendor accounts, payment history, and outstanding amounts.' },
        analytics: { title: 'Analytics Dashboard', subtitle: 'Overview of product, customer, and vendor performance' },
        settings: { title: 'Settings', subtitle: 'Manage your business information' },
        reports: { title: 'Reports', subtitle: 'Generate and export business reports' },
        login: { title: '', subtitle: '' },
    };

    const { title, subtitle } = titles[activePage] || { title: 'Page', subtitle: '' };

    return (
        <header className="h-16 lg:h-20 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg lg:text-2xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
                    <p className="text-xs lg:text-sm text-gray-500 truncate hidden sm:block">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-6">
                <div className="relative w-40 lg:w-64 hidden md:block">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
                    <Bell className="w-5 lg:w-6 h-5 lg:h-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <button
                    onClick={() => onPageChange('settings')}
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
