import React, { useState } from 'react';
import { LayoutGrid, Package, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

/* Inline SVG warehouse illustration */
const WarehouseIllustration = () => (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Sky / background */}
        <rect width="500" height="400" rx="12" fill="#E8F4F8" />

        {/* Ground */}
        <ellipse cx="250" cy="380" rx="220" ry="20" fill="#B8DDD0" opacity="0.5" />

        {/* Main building */}
        <rect x="60" y="120" width="200" height="220" rx="4" fill="#D4E8E0" />
        <rect x="60" y="120" width="200" height="30" rx="4" fill="#A8D0C0" />

        {/* Building windows */}
        <rect x="80" y="170" width="35" height="45" rx="3" fill="#F5F9F7" />
        <rect x="130" y="170" width="35" height="45" rx="3" fill="#F5F9F7" />
        <rect x="180" y="170" width="35" height="45" rx="3" fill="#F5F9F7" />
        <rect x="80" y="235" width="35" height="45" rx="3" fill="#F5F9F7" />
        <rect x="130" y="235" width="35" height="45" rx="3" fill="#F5F9F7" />
        <rect x="180" y="235" width="35" height="45" rx="3" fill="#89BBA8" />

        {/* Door */}
        <rect x="130" y="295" width="50" height="45" rx="3" fill="#6BA58F" />

        {/* Shelves area */}
        <rect x="280" y="140" width="160" height="200" rx="4" fill="#C8E0D5" />

        {/* Shelf rows */}
        <rect x="290" y="155" width="140" height="8" fill="#A8C8B8" />
        <rect x="290" y="200" width="140" height="8" fill="#A8C8B8" />
        <rect x="290" y="245" width="140" height="8" fill="#A8C8B8" />
        <rect x="290" y="290" width="140" height="8" fill="#A8C8B8" />

        {/* Boxes on shelves */}
        <rect x="295" y="135" width="20" height="20" rx="2" fill="#F4A940" />
        <rect x="320" y="130" width="25" height="25" rx="2" fill="#E8923A" />
        <rect x="350" y="138" width="18" height="17" rx="2" fill="#F4A940" />
        <rect x="375" y="132" width="22" height="23" rx="2" fill="#D4813A" />
        <rect x="405" y="140" width="18" height="15" rx="2" fill="#E8923A" />

        <rect x="295" y="175" width="22" height="25" rx="2" fill="#5B9BD5" />
        <rect x="322" y="178" width="18" height="22" rx="2" fill="#4A87C0" />
        <rect x="348" y="173" width="25" height="27" rx="2" fill="#5B9BD5" />
        <rect x="380" y="180" width="20" height="20" rx="2" fill="#4A87C0" />

        <rect x="295" y="220" width="25" height="25" rx="2" fill="#70B868" />
        <rect x="325" y="222" width="20" height="23" rx="2" fill="#5EA050" />
        <rect x="352" y="218" width="22" height="27" rx="2" fill="#70B868" />
        <rect x="382" y="225" width="18" height="20" rx="2" fill="#5EA050" />
        <rect x="405" y="220" width="22" height="25" rx="2" fill="#70B868" />

        <rect x="295" y="265" width="20" height="25" rx="2" fill="#E06060" />
        <rect x="320" y="268" width="25" height="22" rx="2" fill="#CC5050" />
        <rect x="350" y="262" width="18" height="28" rx="2" fill="#E06060" />

        {/* Ladder */}
        <rect x="255" y="160" width="4" height="180" fill="#B0CFC0" />
        <rect x="270" y="160" width="4" height="180" fill="#B0CFC0" />
        <rect x="255" y="190" width="19" height="4" fill="#B0CFC0" />
        <rect x="255" y="220" width="19" height="4" fill="#B0CFC0" />
        <rect x="255" y="250" width="19" height="4" fill="#B0CFC0" />
        <rect x="255" y="280" width="19" height="4" fill="#B0CFC0" />
        <rect x="255" y="310" width="19" height="4" fill="#B0CFC0" />

        {/* Worker 1 - standing near shelves */}
        <circle cx="340" cy="315" r="10" fill="#F5C882" />
        <rect x="330" y="325" width="20" height="30" rx="4" fill="#3B82F6" />
        <rect x="333" y="355" width="6" height="20" rx="2" fill="#2D5A8A" />
        <rect x="343" y="355" width="6" height="20" rx="2" fill="#2D5A8A" />
        <rect x="333" y="308" width="14" height="6" rx="2" fill="#F4A940" />

        {/* Worker 2 - near ladder */}
        <circle cx="260" cy="325" r="9" fill="#E8B878" />
        <rect x="251" y="334" width="18" height="26" rx="4" fill="#10B981" />
        <rect x="253" y="360" width="6" height="18" rx="2" fill="#2D5A8A" />
        <rect x="261" y="360" width="6" height="18" rx="2" fill="#2D5A8A" />
        <rect x="253" y="318" width="14" height="6" rx="2" fill="#F4A940" />

        {/* Forklift / cart */}
        <rect x="100" y="340" width="40" height="20" rx="3" fill="#F4A940" />
        <rect x="105" y="320" width="15" height="20" rx="2" fill="#E8923A" />
        <circle cx="108" cy="365" r="6" fill="#555" />
        <circle cx="132" cy="365" r="6" fill="#555" />

        {/* Plants */}
        <ellipse cx="55" cy="350" rx="15" ry="20" fill="#5EA050" />
        <rect x="52" y="350" width="6" height="25" fill="#6B4226" />
        <ellipse cx="455" cy="340" rx="12" ry="18" fill="#70B868" />
        <rect x="452" y="340" width="6" height="30" fill="#6B4226" />
        <ellipse cx="475" cy="347" rx="10" ry="14" fill="#5EA050" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [rememberMe, setRememberMe] = useState(false);

    // Signup state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
    const [signupError, setSignupError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => onLogin(), 1000);
    };

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');

        if (!signupName.trim()) {
            setSignupError('Please enter your full name.');
            return;
        }
        if (!signupEmail.trim() || !/\S+@\S+\.\S+/.test(signupEmail)) {
            setSignupError('Please enter a valid email address.');
            return;
        }
        if (signupPassword.length < 6) {
            setSignupError('Password must be at least 6 characters.');
            return;
        }
        if (signupPassword !== signupConfirmPassword) {
            setSignupError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setTimeout(() => onLogin(), 1000);
    };

    /* ── Left Branding Panel (shared) ── */
    const BrandingPanel = () => (
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#EDF4FA] p-10 xl:p-16">
            {/* Logo */}
            <div>
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-blue-600 rounded-sm p-2.5">
                        <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 leading-tight">
                        NexaratsINV
                    </span>
                </div>

                {/* Tagline */}
                <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
                    Secure &amp; Simple{' '}
                    <span className="text-blue-600">Inventory Control.</span>
                </h1>
                <p className="text-gray-500 text-base leading-relaxed max-w-[380px]">
                    Keep your business running smoothly with our enterprise-grade management tools.
                </p>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex items-end justify-center mt-8">
                <WarehouseIllustration />
            </div>
        </div>
    );

    /* ── Footer (shared) ── */
    const Footer = () => (
        <div className="text-center py-3 border-t border-gray-100 shrink-0 bg-white">
            <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-500">NexaratsINV</span> — created by{' '}
                <span className="font-semibold text-blue-600">Nexarats</span>
            </p>
        </div>
    );

    /* ══════════════════════  SIGNUP VIEW  ══════════════════════ */
    if (view === 'signup') {
        return (
            <div className="h-screen w-full flex flex-col overflow-hidden">
                <div className="flex flex-1 min-h-0">
                    {/* Left panel */}
                    <BrandingPanel />

                    {/* Right panel: Create Account form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 lg:p-12 overflow-y-auto">
                        <div className="w-full max-w-md">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-blue-600 rounded-sm p-3.5">
                                    <LayoutGrid className="w-7 h-7 text-white" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                                Create Account
                            </h2>

                            {signupError && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600 text-center">
                                    {signupError}
                                </div>
                            )}

                            <form onSubmit={handleSignupSubmit} className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSignupPassword ? 'text' : 'password'}
                                            placeholder="Create a password (min 6 chars)"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSignupConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            value={signupConfirmPassword}
                                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Create Account button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-semibold text-sm transition-all disabled:opacity-60 shadow-lg shadow-blue-200/50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : 'Create Account'}
                                </button>
                            </form>

                            {/* Login link */}
                            <p className="text-center mt-6 text-sm text-gray-500">
                                Already have an account?{' '}
                                <button
                                    onClick={() => { setView('login'); setLoading(false); }}
                                    className="text-blue-600 font-semibold hover:text-blue-700"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        );
    }

    /* ══════════════════════  LOGIN VIEW  ══════════════════════ */
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0">
                {/* Left panel: Branding */}
                <BrandingPanel />

                {/* Right panel: Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-blue-600 rounded-sm p-3.5">
                                <LayoutGrid className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
                            Inventory Login
                        </h2>

                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            {/* Username / Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Username/Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your username or email"
                                    defaultValue="admin@nexarats.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    defaultValue="admin123"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            {/* Login button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-semibold text-sm transition-all disabled:opacity-60 shadow-lg shadow-blue-200/50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </form>

                        {/* Create account link */}
                        <p className="text-center mt-8 text-sm text-gray-500">
                            Don't have an account?{' '}
                            <button
                                onClick={() => setView('signup')}
                                className="text-blue-600 font-semibold hover:text-blue-700"
                            >
                                Create Account
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Login;


