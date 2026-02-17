import React, { useState } from 'react';
import { User, Bell, FileCheck, MessageSquare, Shield, Palette, Clock, Info, HelpCircle, Save, LogOut, Trash2 } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import GSTSettings from './GSTSettings';
import WhatsAppSettings from './WhatsAppSettings';
import SecuritySettings from './SecuritySettings';
import InvoiceThemes from './InvoiceThemes';
import RemindersSettings from './RemindersSettings';
import AccountInfo from './AccountInfo';
import HelpSupport from './HelpSupport';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', icon: User, label: 'Admin Profile' },
        { id: 'notification', icon: Bell, label: 'Notification' },
        { id: 'gst', icon: FileCheck, label: 'GST Configuration' },
        { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
        { id: 'security', icon: Shield, label: 'Security & Privacy' },
        { id: 'invoice', icon: Palette, label: 'Invoice Themes' },
        { id: 'reminders', icon: Clock, label: 'Reminders' },
        { id: 'account', icon: Info, label: 'Account Info' },
        { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'notification': return <NotificationSettings />;
            case 'gst': return <GSTSettings />;
            case 'whatsapp': return <WhatsAppSettings />;
            case 'security': return <SecuritySettings />;
            case 'invoice': return <InvoiceThemes />;
            case 'reminders': return <RemindersSettings />;
            case 'account': return <AccountInfo />;
            case 'help': return <HelpSupport />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]">
            {/* Tabs Sidebar */}
            <div className="w-full lg:w-72 bg-white rounded border border-slate-100 shadow-sm p-3 lg:p-4 shrink-0">
                <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 vyapar-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-sm transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-bold">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="hidden lg:block mt-6 space-y-2 border-t border-slate-100 pt-4">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-sm transition-all">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-bold">Sign Out</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-sm transition-all">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-bold">Delete Account</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded border border-slate-100 shadow-sm p-4 lg:p-8 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;


