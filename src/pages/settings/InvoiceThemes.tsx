import React, { useState } from 'react';
import { Palette, Check, Upload, Save, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import confetti from 'canvas-confetti';

const themes = [
    { id: 'classic', name: 'Classic', primary: '#1E293B', accent: '#2563EB', description: 'Clean professional layout' },
    { id: 'modern', name: 'Modern', primary: '#0F172A', accent: '#8B5CF6', description: 'Sleek contemporary design' },
    { id: 'warm', name: 'Warm', primary: '#451A03', accent: '#F59E0B', description: 'Friendly warm tones' },
    { id: 'green', name: 'Eco', primary: '#052E16', accent: '#10B981', description: 'Fresh green theme' },
    { id: 'red', name: 'Bold', primary: '#450A0A', accent: '#EF4444', description: 'Eye-catching red accents' },
    { id: 'minimal', name: 'Minimal', primary: '#F8FAFC', accent: '#64748B', description: 'Clean minimal style' },
];

const InvoiceThemes: React.FC = () => {
    const [selectedTheme, setSelectedTheme] = useLocalStorage('nx_invoice_theme', 'classic');
    const [config, setConfig] = useLocalStorage('nx_invoice_config', {
        showLogo: true,
        showGST: true,
        showTerms: true,
        termsText: 'Payment is due within 30 days. Late payments may incur additional charges.',
        footerText: 'Thank you for your business!',
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#2563EB']
        });
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-sm flex items-center justify-center">
                        <Palette className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900">Invoice Themes</h2>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-sm font-bold text-sm transition-all ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg shadow-blue-100`}
                >
                    {saved ? <CheckCircle2 className="w-4 h-4 animate-in zoom-in" /> : <Save className="w-4 h-4" />}
                    <span>{saved ? 'Saved!' : 'Save'}</span>
                </button>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`relative p-4 rounded border-2 text-left transition-all ${selectedTheme === theme.id ? 'border-blue-600 shadow-lg' : 'border-slate-100 hover:border-slate-200'
                            }`}
                    >
                        {selectedTheme === theme.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                        )}
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 rounded-sm" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}></div>
                            <div>
                                <p className="font-black text-sm text-slate-900">{theme.name}</p>
                                <p className="text-[10px] text-slate-400">{theme.description}</p>
                            </div>
                        </div>
                        {/* Mini preview */}
                        <div className="bg-slate-50 rounded-sm p-3 space-y-2">
                            <div className="h-2 rounded-full w-16" style={{ backgroundColor: theme.primary }}></div>
                            <div className="flex space-x-2">
                                <div className="h-2 rounded-full w-12 bg-slate-200"></div>
                                <div className="h-2 rounded-full w-8" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-200"></div>
                            <div className="h-2 rounded-full w-3/4 bg-slate-200"></div>
                        </div>
                    </button>
                ))}
            </div>

            <hr className="border-slate-100" />

            {/* Invoice Options */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Invoice Options</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-sm">
                    <div className="flex items-center space-x-3">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <div><p className="font-bold text-sm text-slate-900">Business Logo</p><p className="text-xs text-slate-400">Upload your logo for invoices</p></div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm font-bold text-slate-600">Upload</button>
                </div>
                {[
                    { key: 'showLogo', label: 'Show Logo on Invoice' },
                    { key: 'showGST', label: 'Show GST Breakdown' },
                    { key: 'showTerms', label: 'Show Terms & Conditions' },
                ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-sm">
                        <p className="font-bold text-sm text-slate-900">{item.label}</p>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(config as any)[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${(config as any)[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                ))}
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Terms & Conditions</label>
                    <textarea value={config.termsText} onChange={(e) => setConfig({ ...config, termsText: e.target.value })} rows={3} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-sm outline-none resize-none text-sm" />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Footer Text</label>
                    <input value={config.footerText} onChange={(e) => setConfig({ ...config, footerText: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-sm outline-none text-sm" />
                </div>
            </div>
        </div>
    );
};

export default InvoiceThemes;


