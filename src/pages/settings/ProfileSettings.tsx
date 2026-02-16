import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';

const ProfileSettings: React.FC = () => {
    const [profile, setProfile] = useState({
        name: 'John Anderson',
        email: 'admin@nexarats.com',
        phone: '+91 98765 43210',
        businessName: 'Nexarats Pro Store',
        address: '123 Business Street, Mumbai',
        role: 'Administrator'
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-black text-slate-900">Admin Profile</h2>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                    <Save className="w-4 h-4" /><span>Save</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 lg:p-6 bg-slate-50 rounded-2xl">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 overflow-hidden shrink-0">
                    <img src="https://picsum.photos/id/64/80/80" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-lg">{profile.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{profile.role}</p>
                </div>
                <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                    <Upload className="w-4 h-4" /><span>Upload Photo</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                    <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone</label>
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                    <input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Address</label>
                    <textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} rows={3} className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
