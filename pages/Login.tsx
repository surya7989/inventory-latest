
import React, { useState } from 'react';
import { LayoutGrid, Package } from 'lucide-react';
import { AuthComponent } from '../components/ui/SignUp';

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
        brandName="NexaratsINV"
        onGoToLogin={() => setView('login')}
        onSuccess={onLogin}
        logo={
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-lg shadow-blue-200/50">
            <LayoutGrid className="text-white w-4 h-4" />
          </div>
        }
      />
    );
  }

  return (
    <div className="h-screen w-full flex bg-white font-['Inter'] overflow-hidden">
      {/* Left Branding & Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F1F5F9] p-12 xl:p-20 flex-col relative overflow-hidden h-full">
        <div className="z-10 flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1E293B] leading-none tracking-tight">NexaratsINV</span>

            </div>
          </div>

          <div className="max-w-md py-8">
            <h1 className="text-4xl xl:text-5xl font-black text-[#1E293B] leading-[1.1] tracking-tight mb-6">
              Secure & Simple <br />
              <span className="text-[#2563EB]">Inventory Control.</span>
            </h1>
            <p className="text-lg font-medium text-slate-500/90 leading-relaxed max-w-sm">
              Keep your business running smoothly with our enterprise-grade management tools.
            </p>
          </div>

          <div className="relative flex-1 flex items-end justify-center">
            <div className="relative w-full max-w-sm xl:max-w-md mx-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-white rounded-full opacity-40 blur-2xl"></div>
              <div className="relative z-10 bg-[#E2EEF1] rounded-[32px] overflow-hidden shadow-xl border border-white/50 p-1.5">
                <img
                  src="https://img.freepik.com/free-vector/warehouse-staff-checking-inventory-with-tablet_74855-16358.jpg"
                  alt="Warehouse Management"
                  className="w-full h-auto object-cover rounded-[28px] mix-blend-multiply"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white h-full">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="w-full bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] border border-slate-50 flex flex-col items-center">
            <div className="w-14 h-14 bg-[#2563EB] rounded-[18px] flex items-center justify-center shadow-2xl shadow-blue-100 mb-6">
              <Package className="text-white w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-10">Inventory Login</h2>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Username/Email</label>
                <input required type="text" placeholder="Enter your username" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-50 focus:border-[#2563EB] outline-none transition-all shadow-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Password</label>
                <input required type="password" placeholder="Enter your password" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-50 focus:border-[#2563EB] outline-none transition-all shadow-sm" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black h-16 rounded-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 text-lg">
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              <div className="pt-4 text-center">
                <button type="button" onClick={() => setView('signup')} className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest">
                  New here? Create an account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
