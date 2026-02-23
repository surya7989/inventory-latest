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

        <rect x="295" y="175" width="22" height="25" rx="2" fill="#7DD3FC" />
        <rect x="322" y="178" width="18" height="22" rx="2" fill="#38BDF8" />
        <rect x="348" y="173" width="25" height="27" rx="2" fill="#7DD3FC" />
        <rect x="380" y="180" width="20" height="20" rx="2" fill="#38BDF8" />

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
        <rect x="330" y="325" width="20" height="30" rx="4" fill="#0284C7" />
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
    const [viewCreds, setViewCreds] = useState<{ name: string; email: string; pass: string; role: string; perms: Record<string, string> } | null>(null);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEmail = params.get('login_email');
        const urlPassword = params.get('login_password');
        const isViewMode = params.get('view_creds') === 'true';
        const urlName = params.get('name');
        const urlRole = params.get('role');
        const urlPerms = params.get('perms');

        if (isViewMode && urlEmail && urlPassword) {
            let parsedPerms = {};
            try {
                if (urlPerms) parsedPerms = JSON.parse(decodeURIComponent(urlPerms));
            } catch (e) {
                console.error("Failed to parse permissions", e);
            }

            setViewCreds({
                name: decodeURIComponent(urlName || 'Administrator'),
                email: decodeURIComponent(urlEmail),
                pass: decodeURIComponent(urlPassword),
                role: decodeURIComponent(urlRole || 'Admin'),
                perms: parsedPerms
            });
        } else {
            if (urlEmail) setEmail(decodeURIComponent(urlEmail));
            if (urlPassword) setPassword(decodeURIComponent(urlPassword));
        }

        // Optional: clear params from URL after reading them
        if (urlEmail || urlPassword || isViewMode) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            // Check against stored admins
            const storedAdminsStr = localStorage.getItem('nx_admin_users');
            const storedAdmins = storedAdminsStr ? JSON.parse(storedAdminsStr) : [];

            // Default Super Admin
            const isDefaultAdmin = (email === 'admin@nexarats.com' || email === 'admin@nexapos.com') && password === 'admin123';

            // Find in invited admins
            const invitedAdmin = storedAdmins.find((u: any) => u.email === email && u.password === password);

            if (isDefaultAdmin) {
                // Map all ACCESS_MODULES to 'manage' for super admin
                const superAdminPerms: Record<string, any> = {};
                // ACCESS_MODULES is not imported here, but we can use 'manage' for all known IDs
                // or just handle the logic in Sidebar/App to treat 'all' or empty as full if role is Super Admin.
                // However, let's try to be consistent.

                onLogin({
                    id: 'ADMIN-001',
                    name: 'NEXA Admin',
                    email: 'admin@nexapos.com',
                    role: 'Super Admin',
                    permissions: {} // Sidebar handles Super Admin case specifically
                });
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
                    permissions: invitedAdmin.permissions || {}
                });
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
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">NEXA POS</h2>
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

            {/* ── Right panel: Login form OR Credential Card ── */}
            <div className="w-full md:w-[55%] flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-sm">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-600 rounded-2xl p-4 shadow-xl shadow-blue-500/20">
                            <LayoutGrid className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {viewCreds ? (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                                Access Authorized
                            </h2>
                            <p className="text-gray-500 text-center mb-10 font-medium uppercase tracking-widest text-xs">Login Credentials Slip</p>

                            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 relative">
                                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Valid</div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorized User</label>
                                        <p className="text-lg font-bold text-slate-900">{viewCreds.name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Login ID (Email)</label>
                                        <p className="text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{viewCreds.email}</p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Password</label>
                                        <p className="text-lg font-mono font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200">{viewCreds.pass}</p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Designated Role</label>
                                        <p className="text-xs font-black text-white bg-slate-900 px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-4">{viewCreds.role}</p>

                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-t border-slate-200 pt-4">Module Access Scopes</label>
                                        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-2 vyapar-scrollbar">
                                            {Object.entries(viewCreds.perms).filter(([_, level]) => level !== 'none').map(([id, level]) => (
                                                <div key={id} className="flex items-center justify-between text-[10px] bg-white p-2 rounded-lg border border-slate-100">
                                                    <span className="font-extrabold text-slate-600 uppercase tracking-tight">{id.replace(':', ' ')}</span>
                                                    <span className={`font-black uppercase tracking-widest ${level === 'manage' ? 'text-blue-600' :
                                                        level === 'cru' ? 'text-emerald-500' :
                                                            level === 'read' ? 'text-orange-500' : 'text-slate-400'
                                                        }`}>{level}</span>
                                                </div>
                                            ))}
                                            {Object.keys(viewCreds.perms).length === 0 && (
                                                <p className="text-[10px] font-bold text-slate-400 italic">No specific permissions assigned.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setEmail(viewCreds.email);
                                    setPassword(viewCreds.pass);
                                    setViewCreds(null);
                                }}
                                className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                Proceed to Login
                            </button>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
