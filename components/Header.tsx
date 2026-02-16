
import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { Page } from '../types';

interface HeaderProps {
  activePage: Page;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onLogout }) => {
  const titles: Record<Page, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: "Welcome back, John. Here's what's happening today." },
    billing: { title: 'Billing Dashboard', subtitle: 'Dashboard > Billing' },
    inventory: { title: 'Inventory Dashboard', subtitle: 'Track stock levels, movement, and profitability' },
    customers: { title: 'Customer Management', subtitle: 'Manage and track all your customers in one place.' },
    vendors: { title: 'Vendors', subtitle: 'Manage vendor accounts, payment history, and outstanding amounts.' },
    analytics: { title: 'Analytics Dashboard', subtitle: 'Overview of product, customer, and vendor performance' },
    settings: { title: 'Settings', subtitle: 'Manage your business information' },
    reports: { title: 'Reports', subtitle: 'Generate and export business reports' },
    login: { title: '', subtitle: '' }
  };

  const { title, subtitle } = titles[activePage] || { title: 'Page', subtitle: '' };

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative w-64">
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
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
            J
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
