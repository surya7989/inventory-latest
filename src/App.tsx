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
import OnlineStore from './pages/OnlineStore';
import Storefront from './pages/Storefront';
import Login from './pages/Login';
import AdminAccess from './pages/AdminAccess';
import Expenses from './pages/Expenses';
import { useSessionStorage } from './hooks/useSessionStorage';
import { Globe, Lock, ArrowLeft } from 'lucide-react';


import { Page, Product, Customer, Vendor, CartItem, Transaction, PurchaseOrder, User, PreBooking, OrderStatus } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CUSTOMERS, DEFAULT_VENDORS } from './data/mockData';

import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [page, setPage] = useSessionStorage<Page>('inv_page', 'login');
    const [products, setProducts] = useLocalStorage<Product[]>('inv_products', DEFAULT_PRODUCTS);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('inv_customers', DEFAULT_CUSTOMERS);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('inv_vendors', DEFAULT_VENDORS);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('inv_transactions', []);
    const [purchases, setPurchases] = useLocalStorage<PurchaseOrder[]>('inv_purchases', []);
    const [expenses, setExpenses] = useLocalStorage<any[]>('nx_expenses', []);
    const [preBookings, setPreBookings] = useLocalStorage<PreBooking[]>('inv_prebookings', []);
    const [currentUser, setCurrentUser] = useSessionStorage<User | null>('inv_user', null);

    const [settingsValue] = useLocalStorage('nx_store_settings', {
        name: 'NEXA Store',
        domain: 'shop.nexapos.com',
        currency: 'INR (₹) - Indian Rupee',
        minOrder: '499',
        isOnline: true
    });

    const storeSettings = settingsValue || { name: 'NEXA Store', isOnline: true };

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasCredsParams = params.has('view_creds') || params.has('login_email');

        if (hasCredsParams) {
            // Force logout only in THIS tab for credential viewing
            sessionStorage.removeItem('inv_user');
            setCurrentUser(null);
            setPage('login');
        }
    }, [setCurrentUser, setPage]);

    // Sync currentUser with latest admin changes from localStorage
    useEffect(() => {
        if (!currentUser || currentUser.role === 'Super Admin') return;

        const syncUser = () => {
            const storedAdminsStr = localStorage.getItem('nx_admin_users');
            if (storedAdminsStr) {
                const storedAdmins = JSON.parse(storedAdminsStr);
                const updatedData = storedAdmins.find((u: any) => u.id === currentUser.id);
                if (updatedData) {
                    const hasChanged = JSON.stringify(updatedData.permissions) !== JSON.stringify(currentUser.permissions) ||
                        updatedData.role !== currentUser.role;

                    if (hasChanged) {
                        setCurrentUser({
                            ...currentUser,
                            role: updatedData.role,
                            permissions: updatedData.permissions || {}
                        });
                    }
                } else {
                    // Force logout if user was deleted
                    handleLogout();
                    alert('Access Revoked: Your administrator account has been removed.');
                }
            }
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'nx_admin_users') syncUser();
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [currentUser, setCurrentUser]);

    useEffect(() => {
        document.title = `${currentUser?.name || 'NEXA'} POS - Inventory Control`;
    }, [currentUser]);
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    const handleSale = (cart: CartItem[], total: number, gstAmount: number, custName?: string, custPhone?: string, custAddress?: string, source: 'online' | 'offline' = 'offline', paid?: number) => {


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

        // Calculate pending/debt if it's an offline sale where paid amount is provided
        const paidAmount = paid !== undefined ? paid : total;
        const pendingAmount = total > paidAmount ? total - paidAmount : 0;

        if (custName && custName.trim()) {
            const phone = custPhone?.trim() || '';
            // Track EXCLUSIVELY by mobile number.
            // If phone matches, it's the same customer.
            // If phone is empty, we always treat it as a new/unique entry to prevent accidental merging.
            const existingCustomer = phone !== ''
                ? customers.find(c => c.phone === phone)
                : null;

            finalCustId = existingCustomer ? existingCustomer.id : `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            setCustomers(prev => {
                const existing = prev.find(c => c.id === finalCustId);
                if (existing) {
                    return prev.map(c => c.id === existing.id ? {
                        ...c,
                        // Update LTV and Pending Balance
                        totalPaid: c.totalPaid + paidAmount,
                        pending: (c.pending || 0) + pendingAmount,
                        lastTransaction: localDate,
                        totalInvoices: (c.totalInvoices || 0) + 1,
                        status: ((c.pending || 0) + pendingAmount) > 0 ? 'Partial' : 'Paid' as const,
                        address: custAddress || c.address
                    } : c);

                }
                const newCustomer: Customer = {
                    id: finalCustId,
                    name: custName.trim(),
                    email: '',
                    phone,
                    totalPaid: paidAmount,
                    pending: pendingAmount,
                    status: pendingAmount > 0 ? 'Partial' : 'Paid',
                    lastTransaction: localDate,
                    totalInvoices: 1,
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
            paidAmount: paidAmount,
            gstAmount: gstAmount,
            date: localDate,
            method: 'cash',
            status: pendingAmount > 0 ? 'Partial' : 'Paid',
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
        sessionStorage.removeItem('inv_user');
        setCurrentUser(null);
        setPage('login');
        setSidebarOpen(false);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setPage('dashboard');
    };

    if (page === 'login') {
        return <Login onLogin={handleLogin} />;
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

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    activePage={page}
                    onPageChange={setPage}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    user={currentUser}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 vyapar-scrollbar bg-[#F8F9FC]" style={{ position: 'relative' }}>
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
                            expenses={expenses}
                            user={currentUser}
                        />


                    )}
                    {page === 'billing' && <Billing user={currentUser} products={products} onSaleSuccess={handleSale} />}
                    {page === 'inventory' && <Inventory user={currentUser} products={products} onUpdate={setProducts} />}
                    {page === 'customers' && <Customers user={currentUser} customers={customers} transactions={transactions} onUpdate={setCustomers} onUpdateTransactions={setTransactions} onDelete={handleDeleteCustomer} />}
                    {page === 'vendors' && <Vendors user={currentUser} vendors={vendors} purchases={purchases} onUpdate={setVendors} onDelete={handleDeleteVendor} />}
                    {page === 'analytics' && <Analytics user={currentUser} products={products} customers={customers} vendors={vendors} transactions={transactions} />}
                    {page === 'settings' && <Settings user={currentUser} />}
                    {page === 'online-store' && (
                        <OnlineStore
                            user={currentUser}
                            onVisitStore={() => setPage('storefront')}
                            transactions={transactions.filter(t => t.source === 'online')}
                            customers={customers}
                            onUpdateOrderStatus={updateOrderStatus}
                            preBookings={preBookings}
                            onUpdatePreBooking={updatePreBookingStatus}
                            products={products}
                        />
                    )}
                    {page === 'expenses' && <Expenses user={currentUser} expenses={expenses} onUpdate={setExpenses} />}
                    {page === 'admin' && <AdminAccess user={currentUser} />}
                    {page === 'storefront' && (
                        storeSettings.isOnline ? (
                            <Storefront
                                products={products}
                                onCheckoutSuccess={(cart, total, gst, name, phone, addr) => handleSale(cart, total, gst, name, phone, addr, 'online')}
                                onPreBook={handlePreBooking}
                                onBackToAdmin={() => setPage('online-store')}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-rose-500/10 rounded-[40px] animate-ping" />
                                    <div className="bg-rose-500 p-5 rounded-[28px] shadow-xl shadow-rose-200">
                                        <Globe className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-rose-100">
                                        <Lock className="w-4 h-4 text-rose-500" />
                                    </div>
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Store is Currently Offline</h1>
                                <p className="text-slate-500 font-bold max-w-sm leading-relaxed mb-10">
                                    The {storeSettings?.name || 'NEXA'} storefront is currently undergoing maintenance. Please contact the administrator or check back later.
                                </p>
                                <button
                                    onClick={() => setPage('online-store')}
                                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Return to Dashboard
                                </button>
                            </div>
                        )
                    )}
                </main>

            </div>
        </div>
    );
};

export default App;
