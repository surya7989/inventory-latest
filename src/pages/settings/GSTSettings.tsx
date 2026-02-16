import React, { useState } from 'react';
import { Save } from 'lucide-react';

const GSTSettings: React.FC = () => {
    const [config, setConfig] = useState({
        gstNumber: '29AAPFR6565D1Z1',
        businessType: 'Regular',
        defaultRate: '18',
        cgstEnabled: true,
        sgstEnabled: true,
        igstEnabled: false,
        compositionScheme: false,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-black text-slate-900">GST Configuration</h2>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                    <Save className="w-4 h-4" /><span>Save</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">GSTIN Number</label>
                    <input value={config.gstNumber} onChange={(e) => setConfig({ ...config, gstNumber: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Type</label>
                    <select value={config.businessType} onChange={(e) => setConfig({ ...config, businessType: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                        <option>Regular</option>
                        <option>Composition</option>
                        <option>Exempt</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Default GST Rate</label>
                    <select value={config.defaultRate} onChange={(e) => setConfig({ ...config, defaultRate: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none">
                        {['0', '5', '12', '18', '28'].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Tax Components</h3>
                {[
                    { key: 'cgstEnabled', label: 'CGST (Central GST)', desc: 'Applied for intra-state transactions' },
                    { key: 'sgstEnabled', label: 'SGST (State GST)', desc: 'Applied for intra-state transactions' },
                    { key: 'igstEnabled', label: 'IGST (Integrated GST)', desc: 'Applied for inter-state transactions' },
                    { key: 'compositionScheme', label: 'Composition Scheme', desc: 'Simplified tax for small businesses' },
                ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div><p className="font-bold text-sm text-slate-900">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(config as any)[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${(config as any)[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GSTSettings;
