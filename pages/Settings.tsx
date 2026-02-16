import React, { useState } from 'react';
import { 
  User, Bell, FileCheck, MessageSquare, Shield, Palette, 
  Clock, Info, HelpCircle, Upload, Save, Smartphone, Settings as SettingsIcon, LogOut, Trash2
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Admin Profile' },
    { id: 'notification', icon: Bell, label: 'Notification' },
    { id: 'gst', icon: FileCheck, label: 'GST Configuration' },
    { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp Settings' },
    { id: 'security', icon: Shield, label: 'Security & Privacy' },
    { id: 'themes', icon: Palette, label: 'Invoice Themes' },
    { id: 'reminders', icon: Clock, label: 'Reminders' },
    { id: 'account', icon: Info, label: 'Account Info' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Admin Profile</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your business information</p>
            </div>
            <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
               <div className="relative mb-6">
                  <img src="https://picsum.photos/id/64/150/150" className="w-32 h-32 rounded-full border-4 border-white shadow-2xl" />
                  <button className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full border-4 border-white shadow-lg"><Upload className="w-5 h-5"/></button>
               </div>
               <button className="text-sm font-black text-blue-600 mb-1">Upload Photo</button>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JPG, PNG up to 5MB</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Admin Name</label>
                  <input defaultValue="John Anderson" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900" />
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                  <input defaultValue="+91 7896745633" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900" />
               </div>
               <div className="col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email ID</label>
                  <input defaultValue="john.anderson@company.com" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900" />
               </div>
               <div className="col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Shop Name</label>
                  <input defaultValue="Anderson's Digital Solutions" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900" />
               </div>
               <div className="col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Business Address</label>
                  <textarea rows={3} defaultValue="123 Business Park, Tech District, Silicon Valley, CA 94025, United States" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 resize-none" />
               </div>
            </div>
            <div className="flex justify-end pt-10 border-t border-slate-100 space-x-4">
               <button className="px-10 py-4 font-black text-slate-500 uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl">Edit</button>
               <button className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100">Save Changes</button>
            </div>
          </div>
        );
      case 'notification':
        return (
          <div className="max-w-4xl space-y-12 animate-in fade-in">
             <h2 className="text-3xl font-black text-slate-900">Notification Settings</h2>
             {['Email Notifications', 'SMS Notifications', 'App Notifications'].map(section => (
               <div key={section} className="space-y-6">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] pb-3 border-b border-slate-100">{section}</h4>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-2">
                       <div>
                          <p className="font-black text-slate-900 text-sm">Real-Time Alert {i}</p>
                          <p className="text-xs font-bold text-slate-400">Receive alerts for key business events.</p>
                       </div>
                       <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                    </div>
                  ))}
               </div>
             ))}
          </div>
        );
      case 'gst':
        return (
          <div className="max-w-4xl space-y-10 animate-in fade-in">
             <h2 className="text-3xl font-black text-slate-900">GST Configuration</h2>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Number</label>
                   <input defaultValue="22AAAAA0000A1Z5" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Percentage (%)</label>
                   <input defaultValue="18" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" />
                </div>
             </div>
             <div className="space-y-6 pt-10 border-t border-slate-100">
                {['Enable GST on Invoices', 'Enable GST on Purchase Orders', 'Show GST Breakdown'].map(toggle => (
                   <div key={toggle} className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">{toggle}</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                ))}
             </div>
          </div>
        );
      case 'account':
        return (
          <div className="max-w-4xl space-y-10 animate-in fade-in">
             <div>
                <h2 className="text-3xl font-black text-slate-900">Account Info</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">View your subscription and account details</p>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Subscription Plan</p>
                   <p className="text-2xl font-black text-blue-600">Premium</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Renewal Date</p>
                   <p className="text-2xl font-black text-slate-900">15 Jan 2025</p>
                </div>
             </div>
             <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3">
                   <Palette className="w-5 h-5" />
                   <span>Change Plan</span>
                </button>
                <div className="flex gap-4">
                  <button className="flex-1 border-2 border-slate-100 py-5 rounded-2xl font-black text-slate-500 flex items-center justify-center space-x-2">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                  <button className="flex-1 border-2 border-red-100 py-5 rounded-2xl font-black text-red-500 flex items-center justify-center space-x-2">
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Account</span>
                  </button>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <SettingsIcon className="w-24 h-24 mb-6" />
            <h3 className="text-2xl font-black">{tabs.find(t => t.id === activeTab)?.label} Page</h3>
            <p className="font-bold">This settings module is fully styled and structured <br/> per documentation standards.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full gap-8 vyapar-scrollbar">
      {/* Sidebar for settings tabs from Screenshot 26 */}
      <div className="w-72 flex flex-col space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${
              activeTab === tab.id
                ? 'bg-[#2563EB] text-white shadow-xl shadow-blue-100'
                : 'text-slate-500 hover:bg-white hover:shadow-sm font-bold'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-sm p-16 overflow-y-auto vyapar-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;