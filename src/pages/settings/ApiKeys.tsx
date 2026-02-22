import React, { useState } from 'react';
import { Key, Copy, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Plus, ShieldCheck } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
    status: 'Active' | 'Revoked';
}

const ApiKeys: React.FC = () => {
    const [keys, setKeys] = useLocalStorage<ApiKey[]>('nx_api_keys', [
        { id: '1', name: 'Mobile App Integration', key: 'nx_live_519283746501', created: '2026-01-15', lastUsed: '2 hours ago', status: 'Active' },
        { id: '2', name: 'Zapper Connector', key: 'nx_test_0192837465', created: '2026-02-01', lastUsed: '5 days ago', status: 'Active' }
    ]);

    const [copied, setCopied] = useState<string | null>(null);

    const generateKey = () => {
        const name = prompt('Enter a name for this API key:');
        if (!name) return;

        const newKey: ApiKey = {
            id: Date.now().toString(),
            name,
            key: `nx_live_${Math.random().toString(36).substring(2, 15)}`,
            created: new Date().toISOString().split('T')[0],
            lastUsed: 'Never',
            status: 'Active'
        };
        setKeys([...keys, newKey]);
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const revokeKey = (id: string) => {
        if (window.confirm('Are you sure you want to revoke this API key? Systems using it will lose access immediately.')) {
            setKeys(keys.map(k => k.id === id ? { ...k, status: 'Revoked' } : k));
        }
    };

    const deleteKey = (id: string) => {
        if (window.confirm('Permanently delete this key record?')) {
            setKeys(keys.filter(k => k.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900">Developer API Keys</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage external system access & integrations</p>
                </div>
                <button
                    onClick={generateKey}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Generate New Key</span>
                </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-black text-amber-900 uppercase">Security Warning</p>
                    <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
                        API keys grant full access to your business data. Never share them in public repositories or through insecure channels.
                        Use localized keys for different integrations.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {keys.map(item => (
                    <div key={item.id} className={`p-6 rounded-2xl border transition-all ${item.status === 'Active' ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 grayscale opacity-60'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    <Key className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase text-xs">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Created: {item.created} • Last Used: {item.lastUsed}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {item.status === 'Active' && (
                                    <button
                                        onClick={() => revokeKey(item.id)}
                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg hover:bg-rose-100 transition-colors"
                                    >
                                        Revoke
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteKey(item.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <code className="flex-1 font-mono text-sm font-bold text-slate-600 truncate">
                                {item.key}
                            </code>
                            <button
                                onClick={() => copyToClipboard(item.key)}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                            >
                                {copied === item.key ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="text-[10px] font-black uppercase">{copied === item.key ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                ))}

                {keys.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-black text-slate-400 uppercase">No active API keys</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Generate a key to start integrating</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiKeys;
