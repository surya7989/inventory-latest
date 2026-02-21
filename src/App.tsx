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
import OnlineStore from './pages/OnlineStore';
import Storefront from './pages/Storefront';
import Login from './pages/Login';
import AdminAccess from './pages/AdminAccess';


import { Page, Product, Customer, Vendor, CartItem, Transaction, PurchaseOrder, User, PreBooking, OrderStatus } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CUSTOMERS, DEFAULT_VENDORS } from './data/mockData';

import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [page, setPage] = useLocalStorage<Page>('inv_page', 'login');
    const [products, setProducts] = useLocalStorage<Product[]>('inv_products', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('inv_customers', []);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('inv_vendors', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('inv_transactions', []);
    const [purchases, setPurchases] = useLocalStorage<PurchaseOrder[]>('inv_purchases', []);
    const [preBookings, setPreBookings] = useLocalStorage<PreBooking[]>('inv_prebookings', []);
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('inv_user', {
        id: 'ADMIN-001',
        name: 'Nexarats',

        email: 'admin@nexarats.com',
        role: 'Admin',
        permissions: ['all']
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = `${currentUser?.name || 'Nexarats'}INV - Inventory Control`;
    }, [currentUser]);
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    const handleSale = (cart: CartItem[], total: number, gstAmount: number, custName?: string, custPhone?: string, custAddress?: string, source: 'online' | 'offline' = 'offline') => {


        // 1. Update Inventory Stocks
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

        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // 2. Determine Customer ID (Link to existing, create new, or use special 'Walk-in')
        let finalCustId = 'WALK-IN';

        if (custName && custName.trim()) {
            const phone = custPhone?.trim() || '';
            const existingCustomer = customers.find(c => (phone !== '' && c.phone === phone) || (c.name.toLowerCase() === custName.toLowerCase().trim()));
            finalCustId = existingCustomer ? existingCustomer.id : `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            setCustomers(prev => {
                const existing = prev.find(c => c.id === finalCustId);
                if (existing) {
                    return prev.map(c => c.id === existing.id ? {
                        ...c,
                        // Only add to LTV if it's an offline sale
                        totalPaid: source === 'offline' ? c.totalPaid + total : c.totalPaid,
                        lastTransaction: localDate,
                        totalInvoices: source === 'offline' ? (c.totalInvoices || 0) + 1 : (c.totalInvoices || 0),
                        status: 'Paid' as const,
                        address: custAddress || c.address
                    } : c);

                }
                const newCustomer: Customer = {
                    id: finalCustId,
                    name: custName.trim(),
                    email: '',
                    phone,
                    // If online order, start at 0 (reflected in Dashboard instead)
                    totalPaid: source === 'offline' ? total : 0,
                    pending: 0,
                    status: 'Paid',
                    lastTransaction: localDate,
                    totalInvoices: source === 'offline' ? 1 : 0,
                    address: custAddress || '',
                };

                return [...prev, newCustomer];
            });

        } else {
            // Ensure a 'Walk-in' customer shell exists for the dashboard validTransactions filter
            setCustomers(prev => {
                if (prev.find(c => c.id === 'WALK-IN')) return prev;
                return [...prev, {
                    id: 'WALK-IN',
                    name: 'Walk-in Customer',
                    email: '',
                    phone: '',
                    totalPaid: 0,
                    pending: 0,
                    status: 'Paid',
                    lastTransaction: localDate,
                    totalInvoices: 0
                }];
            });
        }

        // 3. ALWAYS Record transaction
        const newTxn: Transaction = {
            id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
            customerId: finalCustId,
            items: [...cart],
            total: total,
            gstAmount: gstAmount,
            date: localDate,
            method: 'cash',
            status: 'Paid',
            source: source,
            orderStatus: source === 'online' ? 'Pending' : undefined
        };


        setTransactions(prev => [newTxn, ...prev]);

        // Update Walk-in totals if applicable (only for offline)
        if (finalCustId === 'WALK-IN' && source === 'offline') {
            setCustomers(prev => prev.map(c => c.id === 'WALK-IN' ? {
                ...c,
                totalPaid: c.totalPaid + total,
                totalInvoices: (c.totalInvoices || 0) + 1,
                lastTransaction: localDate
            } : c));
        }

    };

    const handlePreBooking = (customerId: string, name: string, phone: string, productId: string, productName: string, qty: number) => {
        const newBooking: PreBooking = {
            id: `PB-${Date.now()}`,
            customerId,
            customerName: name,
            customerPhone: phone,
            productId,
            productName,
            quantity: qty,
            status: 'Pending',
            timestamp: new Date().toISOString()
        };
        setPreBookings(prev => [newBooking, ...prev]);
    };

    const updateOrderStatus = (txnId: string, newStatus: OrderStatus) => {
        setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, orderStatus: newStatus } : t));
    };

    const updatePreBookingStatus = (bookingId: string, newStatus: PreBooking['status']) => {
        setPreBookings(prev => prev.map(pb => pb.id === bookingId ? { ...pb, status: newStatus } : pb));
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
        <div className="flex h-screen bg-[#F8F9FC]">
            <Sidebar
                activePage={page}
                onPageChange={setPage}
                onLogout={handleLogout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={currentUser}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    activePage={page}
                    onPageChange={setPage}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    user={currentUser}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 vyapar-scrollbar bg-[#F8F9FC]">
                    {page === 'dashboard' && (
                        <Dashboard
                            onNavigateBilling={() => setPage('billing')}
                            onVisitStore={() => setPage('storefront')}
                            stats={{ inventoryValue, lowStockCount }}
                            products={products}
                            customers={customers}
                            vendors={vendors}
                            transactions={transactions}
                            purchases={purchases}
                            user={currentUser}
                        />


                    )}
                    {page === 'billing' && <Billing products={products} onSaleSuccess={handleSale} />}
                    {page === 'inventory' && <Inventory products={products} onUpdate={setProducts} />}
                    {page === 'customers' && <Customers customers={customers} transactions={transactions} onUpdate={setCustomers} onDelete={handleDeleteCustomer} />}
                    {page === 'vendors' && <Vendors vendors={vendors} purchases={purchases} onUpdate={setVendors} onDelete={handleDeleteVendor} />}
                    {page === 'analytics' && <Analytics products={products} customers={customers} vendors={vendors} transactions={transactions} />}
                    {page === 'settings' && <Settings />}
                    {page === 'reports' && <Reports />}
                    {page === 'online-store' && (
                        <OnlineStore
                            onVisitStore={() => setPage('storefront')}
                            transactions={transactions.filter(t => t.source === 'online')}
                            customers={customers}
                            onUpdateOrderStatus={updateOrderStatus}
                            preBookings={preBookings}
                            onUpdatePreBooking={updatePreBookingStatus}
                        />
                    )}
                    {page === 'admin-access' && <AdminAccess />}
                    {page === 'storefront' && (
                        <Storefront
                            products={products}
                            onCheckoutSuccess={(cart, total, gst, name, phone, addr) => handleSale(cart, total, gst, name, phone, addr, 'online')}
                            onPreBook={handlePreBooking}
                            onBackToAdmin={() => setPage('online-store')}
                        />
                    )}





                </main>

            </div>
        </div>
    );
};

export default App;

