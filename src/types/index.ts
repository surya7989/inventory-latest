export type Page = 'login' | 'dashboard' | 'billing' | 'inventory' | 'customers' | 'vendors' | 'expenses' | 'analytics' | 'settings' | 'reports' | 'online-store' | 'storefront' | 'admin-access';

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
    mrp: number;
    discountPercentage: number;
    expiryDate?: string;
    profit?: number;
    returns?: 'Returnable' | 'Not Returnable';
    hsnCode?: string;
    taxType: 'Inclusive' | 'Exclusive';
    minStock?: number;
    description?: string;
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
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Transaction {
    id: string;
    customerId: string;
    items: CartItem[];
    total: number;
    gstAmount?: number;
    date: string;
    method: PaymentMethod;
    status: 'Paid' | 'Unpaid' | 'Partial';
    source: 'online' | 'offline';
    orderStatus?: OrderStatus;
    assignedStaff?: string;
    deliveryStatus?: string;
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    amount: number;
    date: string;
    status: 'Paid' | 'Unpaid' | 'Partial';
}

// Phase 2: RBAC Types
export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Staff' | 'Accountant' | 'Delivery Agent';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    permissions: string[];
}

// Phase 3: Pre-Booking Types
export interface PreBooking {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    productId: string;
    productName: string;
    quantity: number;
    status: 'Pending' | 'Confirmed' | 'Fulfilled' | 'Cancelled';
    timestamp: string;
}

