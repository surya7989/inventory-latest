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
import { Page, Product, Customer, Vendor, CartItem, Transaction, PurchaseOrder } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CUSTOMERS, DEFAULT_VENDORS } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [page, setPage] = useLocalStorage<Page>('nx_page', 'login');
    const [products, setProducts] = useLocalStorage<Product[]>('nx_products', DEFAULT_PRODUCTS);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('nx_customers', DEFAULT_CUSTOMERS);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('nx_vendors', DEFAULT_VENDORS);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('nx_transactions', []);
    const [purchases, setPurchases] = useLocalStorage<PurchaseOrder[]>('nx_purchases', []);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    const handleSale = (cart: CartItem[], total: number, gstAmount: number, custName?: string, custPhone?: string) => {
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

        // Add or update customer from billing
        if (custName && custName.trim()) {
            const phone = custPhone?.trim() || '';
            // Derive the ID outside the state setter to ensure both setCustomers and setTransactions use the same ID
            const existingCustomer = customers.find(c => (phone !== '' && c.phone === phone) || (c.name.toLowerCase() === custName.toLowerCase().trim()));
            const finalCustId = existingCustomer ? existingCustomer.id : `CUST-${Date.now()}`;

            const now = new Date();
            const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            setCustomers(prev => {
                const existing = prev.find(c => c.id === finalCustId);
                if (existing) {
                    return prev.map(c => c.id === existing.id ? {
                        ...c,
                        totalPaid: c.totalPaid + total,
                        lastTransaction: localDate,
                        totalInvoices: (c.totalInvoices || 0) + 1,
                        status: 'Paid' as const,
                    } : c);
                }
                const newCustomer: Customer = {
                    id: finalCustId,
                    name: custName.trim(),
                    email: '',
                    phone,
                    totalPaid: total,
                    pending: 0,
                    status: 'Paid',
                    lastTransaction: localDate,
                    totalInvoices: 1,
                };
                return [...prev, newCustomer];
            });

            // Record transaction linked to this customer
            const newTxn: Transaction = {
                id: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
                customerId: finalCustId,
                items: [...cart],
                total: total,
                gstAmount: gstAmount,
                date: localDate,
                method: 'cash',
                status: 'Paid'
            };
            setTransactions(prev => [newTxn, ...prev]);
        }
    };

    const handleDeleteCustomer = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setTransactions(prev => prev.filter(t => t.customerId !== id));
    };

    const handleDeleteVendor = (id: string) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        setPurchases(prev => prev.filter(p => p.vendorId !== id));
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
                    onPageChange={setPage}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 vyapar-scrollbar">
                    {page === 'dashboard' && (
                        <Dashboard
                            onNavigateBilling={() => setPage('billing')}
                            stats={{ inventoryValue, lowStockCount }}
                            products={products}
                            customers={customers}
                            vendors={vendors}
                            transactions={transactions}
                            purchases={purchases}
                        />
                    )}
                    {page === 'billing' && <Billing products={products} onSaleSuccess={handleSale} />}
                    {page === 'inventory' && <Inventory products={products} onUpdate={setProducts} />}
                    {page === 'customers' && <Customers customers={customers} transactions={transactions} onUpdate={setCustomers} onDelete={handleDeleteCustomer} />}
                    {page === 'vendors' && <Vendors vendors={vendors} purchases={purchases} onUpdate={setVendors} onDelete={handleDeleteVendor} />}
                    {page === 'analytics' && <Analytics products={products} customers={customers} vendors={vendors} transactions={transactions} />}
                    {page === 'settings' && <Settings />}
                    {page === 'reports' && <Reports />}
                </main>
            </div>
        </div>
    );
};

export default App;

