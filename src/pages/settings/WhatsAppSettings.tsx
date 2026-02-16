import React, { useState } from 'react';
import { MessageSquare, Send, Save, Phone } from 'lucide-react';

const WhatsAppSettings: React.FC = () => {
    const [config, setConfig] = useState({
        apiNumber: '+91 98765 43210',
        businessName: 'Nexarats Pro Store',
        autoReply: true,
        orderConfirmation: true,
        paymentReceipt: true,
        deliveryUpdate: true,
        promotionalMessages: false,
        welcomeMessage: 'Welcome to Nexarats Pro! How can we help you today?',
        orderTemplate: 'Hi {{name}}, your order #{{orderId}} has been confirmed. Total: ₹{{amount}}',
        paymentTemplate: 'Hi {{name}}, payment of ₹{{amount}} received. Thank you!',
    });

    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button onClick={onChange} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900">WhatsApp Settings</h2>
                </div>
                <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                    <Save className="w-4 h-4" /><span>Save</span>
                </button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-sm text-green-700 font-bold">WhatsApp Business API Integration</p>
                <p className="text-xs text-green-600 mt-1">Connect your WhatsApp Business account to send automated messages to customers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp Business Number</label>
                    <div className="relative mt-2">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={config.apiNumber} onChange={(e) => setConfig({ ...config, apiNumber: e.target.value })} className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                    <input value={config.businessName} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-3">Automated Messages</h3>
                {[
                    { key: 'autoReply' as const, label: 'Auto-Reply', desc: 'Send automatic responses to incoming messages' },
                    { key: 'orderConfirmation' as const, label: 'Order Confirmation', desc: 'Send confirmation after each order' },
                    { key: 'paymentReceipt' as const, label: 'Payment Receipt', desc: 'Send digital receipt after payment' },
                    { key: 'deliveryUpdate' as const, label: 'Delivery Updates', desc: 'Notify customers about delivery status' },
                    { key: 'promotionalMessages' as const, label: 'Promotional Messages', desc: 'Send offers and deals to customers' },
                ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all">
                        <div><p className="font-bold text-sm text-slate-900">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                        <ToggleSwitch enabled={config[item.key]} onChange={() => setConfig(prev => ({ ...prev, [item.key]: !prev[item.key] }))} />
                    </div>
                ))}
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Message Templates</h3>
                <div>
                    <label className="text-xs font-bold text-slate-400">Welcome Message</label>
                    <textarea value={config.welcomeMessage} onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })} rows={2} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none text-sm" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400">Order Confirmation Template</label>
                    <textarea value={config.orderTemplate} onChange={(e) => setConfig({ ...config, orderTemplate: e.target.value })} rows={2} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none text-sm" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400">Payment Receipt Template</label>
                    <textarea value={config.paymentTemplate} onChange={(e) => setConfig({ ...config, paymentTemplate: e.target.value })} rows={2} className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none text-sm" />
                </div>
                <p className="text-[10px] text-slate-400">Use {'{{name}}'}, {'{{orderId}}'}, {'{{amount}}'} as placeholders in templates.</p>
            </div>
        </div>
    );
};

export default WhatsAppSettings;
