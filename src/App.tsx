import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import { useSessionStorage } from './hooks/useSessionStorage';
import { Globe, Lock, ArrowLeft } from 'lucide-react';

import { Page, Product, Customer, Vendor, CartItem, Transaction, PurchaseOrder, User, PreBooking, OrderStatus } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CUSTOMERS, DEFAULT_VENDORS } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import api from './utils/api';


// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Billing = lazy(() => import('./pages/Billing'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Customers = lazy(() => import('./pages/Customers'));
const Vendors = lazy(() => import('./pages/Vendors'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const OnlineStore = lazy(() => import('./pages/OnlineStore'));
const Storefront = lazy(() => import('./pages/Storefront'));
const Login = lazy(() => import('./pages/Login'));
const AdminAccess = lazy(() => import('./pages/AdminAccess'));
const Expenses = lazy(() => import('./pages/Expenses'));

const LoadingFallback = () => (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('inv_vendors', DEFAULT_VENDORS);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [purchases, setPurchases] = useLocalStorage<PurchaseOrder[]>('inv_purchases', []);
    const [expenses, setExpenses] = useLocalStorage<any[]>('nx_expenses', []);
    const [preBookings, setPreBookings] = useLocalStorage<PreBooking[]>('inv_prebookings', []);
    const [currentUser, setCurrentUser] = useSessionStorage<User | null>('inv_user', null);
    const [isMigrating, setIsMigrating] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                const [prodRes, custRes, txnRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/customers'),
                    api.get('/invoices')
                ]);
                setProducts(prodRes.data);
                setCustomers(custRes.data);
                setTransactions(txnRes.data.map((inv: any) => ({
                    ...inv,
                    date: inv.createdAt,
                    status: inv.status as Transaction['status']
                })));
            } catch (err) {
                console.error('Failed to fetch data from API', err);
            }
        };

        fetchData();
    }, [currentUser]);

    // Migration Logic: LocalStorage -> Server (One-time)
    useEffect(() => {
        const hasMigrated = localStorage.getItem('nx_migrated') === 'true';
        if (!currentUser || hasMigrated) return;

        const migrateData = async () => {
            setIsMigrating(true);
            try {
                const localProds = JSON.parse(localStorage.getItem('inv_products') || '[]');
                const localCusts = JSON.parse(localStorage.getItem('inv_customers') || '[]');

                if (localProds.length > 0) {
                    for (const p of localProds) {
                        await api.post('/products', p).catch(() => { });
                    }
                }
                if (localCusts.length > 0) {
                    for (const c of localCusts) {
                        await api.post('/customers', c).catch(() => { });
                    }
                }

                localStorage.setItem('nx_migrated', 'true');
                // Refresh
                const [prodRes, custRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/customers')
                ]);
                setProducts(prodRes.data);
                setCustomers(custRes.data);
            } catch (err) {
                console.error('Migration failed', err);
            } finally {
                setIsMigrating(false);
            }
        };

        migrateData();
    }, [currentUser]);


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
            sessionStorage.removeItem('inv_user');
            setCurrentUser(null);
            navigate('/login');
        }
    }, [setCurrentUser, navigate]);

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

    const handleSale = async (cart: CartItem[], total: number, gstAmount: number, custName?: string, custPhone?: string, custAddress?: string, source: 'online' | 'offline' = 'offline', paid?: number, method: PaymentMethod = 'cash', rzpOrderId?: string, rzpPaymentId?: string) => {
        try {
            // 1. Create/Update Customer if needed
            let finalCustId = 'WALK-IN';
            if (custName && custName.trim()) {
                const phone = custPhone?.trim() || '';
                const existingCustomer = phone !== '' ? customers.find(c => c.phone === phone) : null;

                if (existingCustomer) {
                    finalCustId = existingCustomer.id;
                    await api.put(`/customers/${finalCustId}`, {
                        address: custAddress || existingCustomer.address
                    });
                } else {
                    const custRes = await api.post('/customers', {
                        name: custName.trim(),
                        phone,
                        address: custAddress || '',
                    });
                    finalCustId = custRes.data.id;
                }
            }

            // 2. Create Invoice
            const invoiceData = {
                number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
                customerId: finalCustId === 'WALK-IN' ? null : finalCustId,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    gst: item.gstRate,
                })),
                subtotal: total - gstAmount,
                gstAmount: gstAmount,
                total: total,
                paidAmount: paid !== undefined ? paid : (source === 'online' ? total : 0),
                method: method,
                source: source,
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: rzpPaymentId,
            };

            const invRes = await api.post('/invoices', invoiceData);

            // 3. Refresh data from server to ensure consistency
            const [prodRes, custRes, txnRes] = await Promise.all([
                api.get('/products'),
                api.get('/customers'),
                api.get('/invoices')
            ]);

            setProducts(prodRes.data);
            setCustomers(custRes.data);
            setTransactions(txnRes.data.map((inv: any) => ({
                ...inv,
                date: inv.createdAt,
                status: inv.status as Transaction['status']
            })));

        } catch (err) {
            console.error('Sale failed', err);
            alert('Checkout failed. Please check your connection.');
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

    const updateOrderStatus = async (txnId: string, newStatus: OrderStatus) => {
        try {
            await api.put(`/invoices/${txnId}`, { orderStatus: newStatus });
            setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, orderStatus: newStatus } : t));
        } catch (err) {
            console.error('Failed to update order status', err);
        }
    };

    const updatePreBookingStatus = (bookingId: string, newStatus: PreBooking['status']) => {
        setPreBookings(prev => prev.map(pb => pb.id === bookingId ? { ...pb, status: newStatus } : pb));
    };

    const handleAddProduct = async (productData: Partial<Product>) => {
        try {
            const res = await api.post('/products', productData);
            setProducts(prev => [...prev, res.data]);
        } catch (err) {
            console.error('Failed to add product', err);
        }
    };

    const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
        try {
            const res = await api.put(`/products/${id}`, productData);
            setProducts(prev => prev.map(p => p.id === id ? res.data : p));
        } catch (err) {
            console.error('Failed to update product', err);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete product', err);
        }
    };

    const handleUpdateInvoice = async (id: string, invoiceData: Partial<Transaction>) => {
        try {
            const res = await api.put(`/invoices/${id}`, invoiceData);
            setTransactions(prev => prev.map(t => t.id === id ? {
                ...res.data,
                date: res.data.createdAt,
                status: res.data.status as Transaction['status']
            } : t));

            // Re-fetch customers to update balances if needed
            const custRes = await api.get('/customers');
            setCustomers(custRes.data);
        } catch (err) {
            console.error('Failed to update invoice', err);
        }
    };

    const handleAddCustomer = async (customerData: Partial<Customer>) => {
        try {
            const res = await api.post('/customers', customerData);
            setCustomers(prev => [...prev, res.data]);
        } catch (err) {
            console.error('Failed to add customer', err);
        }
    };

    const handleUpdateCustomer = async (id: string, customerData: Partial<Customer>) => {
        try {
            const res = await api.put(`/customers/${id}`, customerData);
            setCustomers(prev => prev.map(c => c.id === id ? res.data : c));
        } catch (err) {
            console.error('Failed to update customer', err);
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        try {
            await api.delete(`/customers/${id}`);
            setCustomers(prev => prev.filter(c => c.id !== id));
            setTransactions(prev => prev.filter(t => t.customerId !== id));
        } catch (err) {
            console.error('Delete customer failed', err);
        }
    };

    const handleDeleteVendor = (id: string) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        setPurchases(prev => prev.filter(p => p.vendorId !== id));
    };

    const handleLogout = () => {
        sessionStorage.removeItem('inv_user');
        setCurrentUser(null);
        navigate('/login');
        setSidebarOpen(false);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        navigate('/dashboard');
    };

    const page = location.pathname.split('/')[1] || 'dashboard';

    if (!currentUser && location.pathname !== '/login' && !location.pathname.startsWith('/storefront')) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-[#F8F9FC]">
            {currentUser && location.pathname !== '/login' && !location.pathname.startsWith('/storefront') && (
                <Sidebar
                    activePage={page as Page}
                    onPageChange={(p) => navigate(`/${p}`)}
                    onLogout={handleLogout}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    user={currentUser}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {currentUser && location.pathname !== '/login' && !location.pathname.startsWith('/storefront') && (
                    <Header
                        activePage={page as Page}
                        onPageChange={(p) => navigate(`/${p}`)}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        user={currentUser}
                    />
                )}

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 vyapar-scrollbar bg-[#F8F9FC]" style={{ position: 'relative' }}>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/login" element={<Login onLogin={handleLogin} />} />
                            <Route path="/dashboard" element={
                                <Dashboard
                                    onNavigateBilling={() => navigate('/billing')}
                                    onVisitStore={() => navigate('/storefront')}
                                    stats={{ inventoryValue, lowStockCount }}
                                    products={products}
                                    customers={customers}
                                    vendors={vendors}
                                    transactions={transactions}
                                    purchases={purchases}
                                    expenses={expenses}
                                    user={currentUser}
                                />
                            } />
                            <Route path="/billing" element={<Billing user={currentUser} products={products} onSaleSuccess={handleSale} />} />
                            <Route path="/inventory" element={
                                <Inventory
                                    user={currentUser}
                                    products={products}
                                    onAdd={handleAddProduct}
                                    onUpdate={handleUpdateProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            } />
                            <Route path="/customers" element={
                                <Customers
                                    user={currentUser}
                                    customers={customers}
                                    transactions={transactions}
                                    onAdd={handleAddCustomer}
                                    onUpdate={handleUpdateCustomer}
                                    onUpdateTransaction={handleUpdateInvoice}
                                    onDelete={handleDeleteCustomer}
                                />
                            } />
                            <Route path="/vendors" element={<Vendors user={currentUser} vendors={vendors} purchases={purchases} onUpdate={setVendors} onDelete={handleDeleteVendor} />} />
                            <Route path="/analytics" element={<Analytics user={currentUser} products={products} customers={customers} vendors={vendors} transactions={transactions} />} />
                            <Route path="/settings" element={<Settings user={currentUser} />} />
                            <Route path="/online-store" element={
                                <OnlineStore
                                    user={currentUser}
                                    onVisitStore={() => navigate('/storefront')}
                                    transactions={transactions.filter(t => t.source === 'online')}
                                    customers={customers}
                                    onUpdateOrderStatus={updateOrderStatus}
                                    preBookings={preBookings}
                                    onUpdatePreBooking={updatePreBookingStatus}
                                    products={products}
                                />
                            } />
                            <Route path="/expenses" element={<Expenses user={currentUser} expenses={expenses} onUpdate={setExpenses} />} />
                            <Route path="/admin" element={<AdminAccess user={currentUser} />} />
                            <Route path="/storefront" element={
                                storeSettings.isOnline ? (
                                    <Storefront
                                        products={products}
                                        onCheckoutSuccess={(cart, total, gst, name, phone, addr, source, paid, method, rzpOrderId, rzpPaymentId) => {
                                            handleSale(cart, total, gst, name, phone, addr, source || 'online', paid, method, rzpOrderId, rzpPaymentId);
                                        }}
                                        onPreBook={handlePreBooking}
                                        onBackToAdmin={() => navigate('/online-store')}
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
                                            onClick={() => navigate('/online-store')}
                                            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                            Return to Dashboard
                                        </button>
                                    </div>
                                )
                            } />
                            <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;

