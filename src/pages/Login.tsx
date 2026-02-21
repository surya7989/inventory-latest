import React, { useState } from 'react';
import { LayoutGrid, XCircle } from 'lucide-react';

interface LoginProps {
    onLogin: (user: any) => void;
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
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('admin@nexarats.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            // Check against stored admins
            const storedAdminsStr = localStorage.getItem('nx_admin_users');
            const storedAdmins = storedAdminsStr ? JSON.parse(storedAdminsStr) : [];

            // Default Super Admin
            const isDefaultAdmin = email === 'admin@nexarats.com' && password === 'admin123';

            // Find in invited admins
            const invitedAdmin = storedAdmins.find((u: any) => u.email === email && u.password === password);

            if (isDefaultAdmin) {
                onLogin({
                    id: 'ADMIN-001',
                    name: 'Nexarats Admin',
                    email: 'admin@nexarats.com',
                    role: 'Super Admin',
                    permissions: ['all']
                } as any);
            } else if (invitedAdmin) {
                if (invitedAdmin.status !== 'Active') {
                    setError('Your account has been deactivated. Please contact Super Admin.');
                    setLoading(false);
                    return;
                }
                onLogin({
                    id: invitedAdmin.id,
                    name: invitedAdmin.name,
                    email: invitedAdmin.email,
                    role: invitedAdmin.role,
                    permissions: invitedAdmin.permissions || ['dashboard']
                } as any);
            } else {
                setError('Invalid email or password. Please try again.');
                setLoading(false);
            }
        }, 1200);
    };

    return (
        <div className="h-screen w-screen bg-white flex flex-col md:flex-row overflow-hidden">

            {/* ── Left panel: Branding ── */}
            <div className="hidden md:flex md:w-[45%] flex-col justify-between bg-[#EDF4FA] p-10 lg:p-16">
                <div>
                    <div className="flex items-center gap-2.5 mb-14">
                        <div className="bg-blue-600 rounded-lg p-2">
                            <LayoutGrid className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">
                            Nexarats
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                        Secure &amp; Simple <br />
                        <span className="text-blue-600">Inventory Control.</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed max-w-[360px]">
                        Manage your business operations efficiently with our enterprise-grade toolkit.
                    </p>
                </div>

                {/* Illustration - Now better fitted and larger */}
                <div className="w-full max-w-[480px] mt-auto">
                    <WarehouseIllustration />
                </div>
            </div>

            {/* ── Right panel: Login form ── */}
            <div className="w-full md:w-[55%] flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-sm">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-600 rounded-2xl p-4 shadow-xl shadow-blue-500/20">
                            <LayoutGrid className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 text-center mb-10 font-medium">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                                <XCircle className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        {/* Username / Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                placeholder="admin@nexarats.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                        </div>

                        {/* Remember Me Only */}
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remember" className="text-sm font-semibold text-gray-600 cursor-pointer select-none">
                                Remember me
                            </label>
                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : 'Login'}
                        </button>
                    </form>

                    {/* Create account link - RESTORED */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 font-medium">
                            Don't have an account?{' '}
                            <button className="text-blue-600 font-bold hover:underline ml-1">
                                Create Account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
