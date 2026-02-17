export type Page = 'login' | 'dashboard' | 'billing' | 'inventory' | 'customers' | 'vendors' | 'analytics' | 'settings' | 'reports';

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    purchasePrice: number;
    stock: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    image?: string;
    sku: string;
    gstRate: number;
    unit?: string;
    expiryDate?: string;
    profit?: number;
    returns?: 'Returnable' | 'Not Returnable';
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalPaid: number;
    pending: number;
    status: 'Paid' | 'Unpaid' | 'Partial';
    lastTransaction?: string;
    totalInvoices?: number;
    address?: string;
}

export interface Vendor {
    id: string;
    name: string;
    businessName: string;
    gstNumber: string;
    phone: string;
    email: string;
    totalPaid: number;
    pendingAmount: number;
    lastTransaction?: string;
    totalInvoices?: number;
    image?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split' | 'bank_transfer';

export interface Transaction {
    id: string;
    customerId: string;
    items: CartItem[];
    total: number;
    gstAmount?: number;
    date: string;
    method: PaymentMethod;
    status: 'Paid' | 'Unpaid' | 'Partial';
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    amount: number;
    date: string;
    status: 'Paid' | 'Unpaid' | 'Partial';
}
