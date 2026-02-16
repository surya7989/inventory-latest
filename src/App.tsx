import React, { useState, useEffect } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Analytics from './pages/Analytics';
import Settings from './pages/settings/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { Page, Product, Customer, Vendor, CartItem } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CUSTOMERS, DEFAULT_VENDORS } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [page, setPage] = useLocalStorage<Page>('nx_page', 'login');
    const [products, setProducts] = useLocalStorage<Product[]>('nx_products', DEFAULT_PRODUCTS);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('nx_customers', DEFAULT_CUSTOMERS);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('nx_vendors', DEFAULT_VENDORS);
    const [totalSales, setTotalSales] = useLocalStorage<number>('nx_totalSales', 0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    const handleSale = (cart: CartItem[], total: number) => {
        setTotalSales(prev => prev + total);
        setProducts(prev =>
            prev.map(p => {
                const sold = cart.find(c => c.id === p.id);
                if (!sold) return p;
                const newStock = p.stock - sold.quantity;
                return {
                    ...p,
                    stock: newStock,
                    status: newStock === 0 ? 'Out of Stock' : newStock < 10 ? 'Low Stock' : 'In Stock',
                };
            })
        );
    };

    const handleLogout = () => {
        setPage('login');
        setSidebarOpen(false);
    };

    if (page === 'login') {
        return <Login onLogin={() => setPage('dashboard')} />;
    }

    return (
        <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
            <Sidebar
                activePage={page}
                onPageChange={setPage}
                onLogout={handleLogout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header
                    activePage={page}
                    onLogout={handleLogout}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 vyapar-scrollbar">
                    {page === 'dashboard' && (
                        <Dashboard
                            onNavigateBilling={() => setPage('billing')}
                            stats={{ totalSales, inventoryValue, lowStockCount }}
                        />
                    )}
                    {page === 'billing' && <Billing products={products} onSaleSuccess={handleSale} />}
                    {page === 'inventory' && <Inventory products={products} onUpdate={setProducts} />}
                    {page === 'customers' && <Customers customers={customers} onUpdate={setCustomers} />}
                    {page === 'vendors' && <Vendors vendors={vendors} onUpdate={setVendors} />}
                    {page === 'analytics' && <Analytics products={products} customers={customers} vendors={vendors} />}
                    {page === 'settings' && <Settings />}
                    {page === 'reports' && <Reports />}
                </main>
            </div>
        </div>
    );
};

export default App;
