import React, { useState } from 'react';
import { CreditCard, Link2, RefreshCw, Loader2, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useRazorpay, RazorpaySuccessData } from '../hooks/useRazorpay';

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay Checkout Button
// ─────────────────────────────────────────────────────────────────────────────

interface RazorpayPayButtonProps {
    amount: number;                // In ₹ Rupees
    invoiceId?: string;
    description?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess?: (data: RazorpaySuccessData) => void;
    onFailure?: () => void;
    variant?: 'primary' | 'outline' | 'ghost';
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const RazorpayPayButton: React.FC<RazorpayPayButtonProps> = ({
    amount, invoiceId, description, customerName, customerEmail, customerPhone,
    onSuccess, onFailure, variant = 'primary', label, size = 'md',
}) => {
    const { initiatePayment, isLoading } = useRazorpay();
    const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

    const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
    const variantClasses = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200',
        outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        ghost: 'text-indigo-600 hover:bg-indigo-50',
    };

    const handlePay = async () => {
        await initiatePayment({
            amount,
            invoiceId,
            description,
            customerName,
            customerEmail,
            customerPhone,
            onSuccess: (data) => {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 4000);
                onSuccess?.(data);
            },
            onFailure: () => {
                setStatus('failed');
                setTimeout(() => setStatus('idle'), 4000);
                onFailure?.();
            },
        });
    };

    return (
        <button
            onClick={handlePay}
            disabled={isLoading || status === 'success'}
            className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
        >
            {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            ) : status === 'success' ? (
                <><CheckCircle className="w-4 h-4 text-green-400" /> Paid!</>
            ) : status === 'failed' ? (
                <><XCircle className="w-4 h-4" /> Failed — Retry</>
            ) : (
                <><CreditCard className="w-4 h-4" /> {label || `Pay ₹${amount.toLocaleString('en-IN')}`}</>
            )}
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment Link Button
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentLinkButtonProps {
    amount: number;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    invoiceId?: string;
    description?: string;
}

export const PaymentLinkButton: React.FC<PaymentLinkButtonProps> = ({
    amount, customerName, customerPhone, customerEmail, invoiceId, description,
}) => {
    const { createPaymentLink, isLoading } = useRazorpay();
    const [link, setLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        setError(null);
        try {
            const result = await createPaymentLink({ amount, customerName, customerPhone, customerEmail, invoiceId, description });
            setLink(result.shortUrl);
        } catch {
            setError('Could not generate payment link. Check your Razorpay keys.');
        }
    };

    const handleCopy = () => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2">
            {!link ? (
                <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-60"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    {isLoading ? 'Generating…' : 'Send Payment Link'}
                </button>
            ) : (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-xs text-green-700 truncate flex-1 font-mono">{link}</span>
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-green-100 text-green-700 flex-shrink-0"
                        title="Copy link"
                    >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-green-100 text-green-700 flex-shrink-0"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Refund Button
// ─────────────────────────────────────────────────────────────────────────────

interface RefundButtonProps {
    paymentId: string;
    maxAmount: number;          // Max refundable amount in ₹
    invoiceId?: string;
    onRefunded?: () => void;
}

export const RefundButton: React.FC<RefundButtonProps> = ({
    paymentId, maxAmount, invoiceId, onRefunded,
}) => {
    const { initiateRefund, isLoading } = useRazorpay();
    const [showDialog, setShowDialog] = useState(false);
    const [refundAmount, setRefundAmount] = useState(maxAmount.toString());
    const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [message, setMessage] = useState('');

    const handleRefund = async () => {
        const amount = parseFloat(refundAmount);
        try {
            const result = await initiateRefund(paymentId, amount === maxAmount ? undefined : amount, invoiceId);
            setStatus('success');
            setMessage(result.message || 'Refund initiated successfully');
            setShowDialog(false);
            onRefunded?.();
        } catch (err: any) {
            setStatus('failed');
            setMessage(err.response?.data?.error || 'Refund failed');
        }
    };

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs rounded-lg font-medium border border-orange-200 transition-all"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Refund
            </button>

            {status !== 'idle' && (
                <p className={`text-xs mt-1 ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}

            {showDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Initiate Refund</h3>
                        <p className="text-sm text-gray-500 mb-4">Max refundable: ₹{maxAmount.toLocaleString('en-IN')}</p>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                        <input
                            type="number"
                            value={refundAmount}
                            onChange={e => setRefundAmount(e.target.value)}
                            max={maxAmount}
                            min={1}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {isLoading ? 'Processing…' : 'Confirm Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
