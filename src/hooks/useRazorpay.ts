/**
 * Razorpay Checkout Hook
 * Handles the full Razorpay payment flow:
 *   1. Create order on backend
 *   2. Open Razorpay checkout modal
 *   3. Verify payment on backend
 */

import { useState } from 'react';
import api from '../utils/api';

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export interface RazorpayOptions {
    amount: number;              // In RUPEES (will be converted to paise)
    currency?: string;
    description?: string;
    invoiceId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    prefillAddress?: string;
    notes?: Record<string, string>;
    themeColor?: string;
    onSuccess?: (data: RazorpaySuccessData) => void;
    onFailure?: (error: any) => void;
    onDismiss?: () => void;
}

export interface RazorpaySuccessData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    invoiceId?: string;
}

export interface UseRazorpayReturn {
    initiatePayment: (options: RazorpayOptions) => Promise<void>;
    createPaymentLink: (options: PaymentLinkOptions) => Promise<{ shortUrl: string; linkId: string }>;
    fetchPayment: (paymentId: string) => Promise<any>;
    initiateRefund: (paymentId: string, amount?: number, invoiceId?: string) => Promise<any>;
    isLoading: boolean;
    error: string | null;
}

export interface PaymentLinkOptions {
    amount: number;             // In RUPEES
    description?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    invoiceId?: string;
}

export const useRazorpay = (): UseRazorpayReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Opens Razorpay Checkout modal
     */
    const initiatePayment = async (options: RazorpayOptions) => {
        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error('Failed to load Razorpay SDK');

            // Step 2: Create order on backend (amount in paise)
            const { data: order } = await api.post('/payments/create-order', {
                amount: Math.round(options.amount * 100),
                currency: options.currency || 'INR',
                invoiceId: options.invoiceId,
                notes: options.notes,
            });

            // Step 3: Open Razorpay checkout modal
            const rzpOptions = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: 'NEXA POS',
                description: options.description || 'Payment',
                order_id: order.id,
                prefill: {
                    name: options.customerName || '',
                    email: options.customerEmail || '',
                    contact: options.customerPhone || '',
                },
                notes: {
                    invoiceId: options.invoiceId || '',
                    ...options.notes,
                },
                theme: {
                    color: options.themeColor || '#6366F1',
                },
                modal: {
                    ondismiss: () => {
                        options.onDismiss?.();
                    },
                },
                handler: async (response: any) => {
                    // Step 4: Verify payment on backend
                    try {
                        const { data: verification } = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: options.invoiceId,
                        });

                        if (verification.success) {
                            options.onSuccess?.({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                invoiceId: options.invoiceId,
                            });
                        }
                    } catch (verifyErr: any) {
                        setError('Payment verification failed');
                        options.onFailure?.(verifyErr);
                    }
                },
            };

            const rzp = new (window as any).Razorpay(rzpOptions);
            rzp.on('payment.failed', (response: any) => {
                setError(response.error?.description || 'Payment failed');
                options.onFailure?.(response);
            });
            rzp.open();
        } catch (err: any) {
            setError(err.message || 'Payment initiation failed');
            options.onFailure?.(err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Create a Razorpay Payment Link (no checkout modal needed)
     * Perfect for: WhatsApp payments, invoice reminders, remote collection
     */
    const createPaymentLink = async (options: PaymentLinkOptions) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/payments/payment-link', {
                amount: Math.round(options.amount * 100),
                description: options.description,
                customerName: options.customerName,
                customerEmail: options.customerEmail,
                customerPhone: options.customerPhone,
                invoiceId: options.invoiceId,
            });
            return { shortUrl: data.shortUrl, linkId: data.linkId };
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create payment link');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch a payment's full details from Razorpay
     */
    const fetchPayment = async (paymentId: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/payments/fetch/${paymentId}`);
            return data;
        } catch (err: any) {
            setError('Failed to fetch payment details');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Issue a refund (full or partial)
     * amount is in RUPEES (e.g., 250 for ₹250)
     * Omit amount for full refund
     */
    const initiateRefund = async (paymentId: string, amount?: number, invoiceId?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post(`/payments/refund/${paymentId}`, {
                amount: amount ? Math.round(amount * 100) : undefined,
                speed: 'optimum',       // Use fastest available (instant for UPI)
                invoiceId,
            });
            return data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Refund failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        initiatePayment,
        createPaymentLink,
        fetchPayment,
        initiateRefund,
        isLoading,
        error,
    };
};
