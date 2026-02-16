import React, { useState } from 'react';
import { LayoutGrid, Package } from 'lucide-react';
import { AuthComponent } from '../components/auth/AuthComponent';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'login' | 'signup'>('login');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => onLogin(), 1000);
    };

    if (view === 'signup') {
        return (
            <AuthComponent
                onSuccess={onLogin}
                onGoToLogin={() => setView('login')}
                logo={
                    <div className="bg-blue-600 text-white rounded-lg p-1.5">
                        <Package className="h-4 w-4" />
                    </div>
                }
                brandName="Nexarats Pro"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl lg:rounded-[40px] p-8 lg:p-12 w-full max-w-md border border-white/20 shadow-2xl">
                {/* Logo */}
                <div className="text-center mb-8 lg:mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 lg:mb-6 shadow-xl shadow-blue-500/25">
                        <LayoutGrid className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200/70 text-sm font-medium">Sign in to your Nexarats Pro dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                    <div>
                        <label className="text-xs font-bold text-blue-200/60 uppercase tracking-widest">Email</label>
                        <input
                            type="email"
                            defaultValue="admin@nexarats.com"
                            className="w-full mt-2 px-5 py-3.5 lg:py-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-white placeholder:text-blue-200/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-blue-200/60 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            defaultValue="admin123"
                            className="w-full mt-2 px-5 py-3.5 lg:py-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-white placeholder:text-blue-200/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center space-x-2 text-blue-200/60 cursor-pointer">
                            <input type="checkbox" className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/20" />
                            <span>Remember me</span>
                        </label>
                        <button type="button" className="text-blue-400 font-bold hover:text-blue-300">Forgot Password?</button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 lg:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl lg:rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-6 lg:mt-8 text-xs text-blue-200/40">
                    Don't have an account?{' '}
                    <button onClick={() => setView('signup')} className="text-blue-400 font-bold hover:text-blue-300">Create Account</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
