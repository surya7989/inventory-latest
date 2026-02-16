
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { Page, Product, Customer, Vendor } from './types';

// Default Mock Data
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Fortune Oil 1L', category: 'Dairy', price: 180, purchasePrice: 150, stock: 245, status: 'In Stock', sku: 'FOR-101', gstRate: 18, image: 'https://picsum.photos/id/11/200/200' },
  { id: '2', name: 'Amul Milk 1L', category: 'Dairy', price: 64, purchasePrice: 58, stock: 312, status: 'In Stock', sku: 'AMU-202', gstRate: 5, image: 'https://picsum.photos/id/12/200/200' },
  { id: '3', name: 'Basmati Rice 5kg', category: 'Groceries', price: 625, purchasePrice: 580, stock: 45, status: 'In Stock', sku: 'IND-303', gstRate: 0, image: 'https://picsum.photos/id/13/200/200' },
  { id: '4', name: 'Colgate 200g', category: 'Personal Care', price: 125, purchasePrice: 105, stock: 8, status: 'Low Stock', sku: 'COL-404', gstRate: 12, image: 'https://picsum.photos/id/14/200/200' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: '#C-1001', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', totalPaid: 15000, pending: 2000, status: 'Partial' },
  { id: '#C-1002', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43211', totalPaid: 4500, pending: 0, status: 'Paid' },
];

const DEFAULT_VENDORS: Vendor[] = [
  { id: 'V-1001', name: 'Raghav', businessName: 'Raghav Food Distributors', gstNumber: '29AAPFR6565D1Z1', phone: '9876543210', email: 'raghav@gmail.com', totalPaid: 32000, pendingAmount: 8000 },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize shared state from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexarats_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('nexarats_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('nexarats_vendors');
    return saved ? JSON.parse(saved) : DEFAULT_VENDORS;
  });

  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('nexarats_transactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Re-hydrate Date objects
      return parsed.map((t: any) => ({ ...t, date: new Date(t.date) }));
    }
    return [];
  });

  // Persist state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('nexarats_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexarats_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nexarats_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('nexarats_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleSaleSuccess = (cart: any[], total: number) => {
    // Update Stock
    setProducts(prev => prev.map(p => {
      const soldItem = cart.find(item => item.id === p.id);
      if (soldItem) {
        const newStock = Math.max(0, p.stock - soldItem.quantity);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock < 10 ? 'Low Stock' : 'In Stock'
        };
      }
      return p;
    }));
    
    // Add to Transactions
    setTransactions(prev => [...prev, { id: Date.now(), items: cart, total, date: new Date() }]);
  };

  if (!isAuthenticated || currentPage === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activePage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activePage={currentPage} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && (
            <Dashboard 
              onNavigateBilling={() => setCurrentPage('billing')}
              stats={{
                totalSales: transactions.reduce((sum, t) => sum + t.total, 845320),
                inventoryValue: products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0),
                lowStockCount: products.filter(p => p.stock < 10).length
              }}
            />
          )}
          {currentPage === 'billing' && (
            <Billing 
              products={products} 
              onSaleSuccess={handleSaleSuccess} 
            />
          )}
          {currentPage === 'inventory' && (
            <Inventory 
              products={products} 
              onUpdate={setProducts} 
            />
          )}
          {currentPage === 'customers' && (
            <Customers 
              customers={customers} 
              onUpdate={setCustomers} 
            />
          )}
          {currentPage === 'vendors' && (
            <Vendors 
              vendors={vendors} 
              onUpdate={setVendors} 
            />
          )}
          {currentPage === 'analytics' && <Analytics />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'reports' && (
            <Reports products={products} transactions={transactions} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
