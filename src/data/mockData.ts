import { Product, Customer, Vendor } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
    { id: '1', name: 'Fortune Oil 1L', category: 'Dairy', price: 180, purchasePrice: 150, stock: 245, status: 'In Stock', sku: 'FOR-101', gstRate: 18, image: 'https://picsum.photos/id/11/200/200' },
    { id: '2', name: 'Amul Milk 1L', category: 'Dairy', price: 64, purchasePrice: 58, stock: 312, status: 'In Stock', sku: 'AMU-202', gstRate: 5, image: 'https://picsum.photos/id/12/200/200' },
    { id: '3', name: 'Basmati Rice 5kg', category: 'Groceries', price: 625, purchasePrice: 580, stock: 45, status: 'In Stock', sku: 'IND-303', gstRate: 0, image: 'https://picsum.photos/id/13/200/200' },
    { id: '4', name: 'Colgate 200g', category: 'Personal Care', price: 125, purchasePrice: 105, stock: 8, status: 'Low Stock', sku: 'COL-404', gstRate: 12, image: 'https://picsum.photos/id/14/200/200' },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
    { id: '#C-1001', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', totalPaid: 15000, pending: 2000, status: 'Partial' },
    { id: '#C-1002', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43211', totalPaid: 4500, pending: 0, status: 'Paid' },
];

export const DEFAULT_VENDORS: Vendor[] = [
    { id: 'V-1001', name: 'Raghav', businessName: 'Raghav Food Distributors', gstNumber: '29AAPFR6565D1Z1', phone: '9876543210', email: 'raghav@gmail.com', totalPaid: 32000, pendingAmount: 8000 },
];
