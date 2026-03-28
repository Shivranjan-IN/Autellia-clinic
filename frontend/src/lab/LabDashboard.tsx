import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Calendar, 
    Droplet, 
    FlaskConical, 
    FileText, 
    History, 
    Link as LinkIcon, 
    User,
    CreditCard, 
    Clock, 
    Star, 
    Users, 
    Settings, 
    LogOut,
    Menu,
    X,
    Bell,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { User as UserType } from '../common/types';
import { Button } from '../common/ui/button';
import { Badge } from '../common/ui/badge';

// Import our 12 amazing components
import { DashboardOverview } from './components/DashboardOverview';
import { TestBookings } from './components/TestBookings';
import { SampleManagement } from './components/SampleManagement';
import { TestCatalog } from './components/TestCatalog';
import { ReportManagement } from './components/ReportManagement';
import { PatientRecords } from './components/PatientRecords';
import { ClinicConnections } from './components/ClinicConnections';
import { BillingPayments } from './components/BillingPayments';
import { Scheduling } from './components/Scheduling';
import { Reviews } from './components/Reviews';
import { StaffManagement } from './components/StaffManagement';
import { LabSettings } from './components/LabSettings';

interface LabDashboardProps {
    user: UserType;
}

type ViewType = 
    | 'dashboard'
    | 'bookings'
    | 'samples'
    | 'tests'
    | 'reports'
    | 'patients'
    | 'clinics'
    | 'billing'
    | 'schedule'
    | 'reviews'
    | 'staff'
    | 'settings';

export function LabDashboard({ user }: LabDashboardProps) {
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const menuItems = [
        { id: 'dashboard' as ViewType, label: '🏠 Dashboard', icon: LayoutDashboard },
        { id: 'bookings' as ViewType, label: '📅 Test Bookings', icon: Calendar },
        { id: 'samples' as ViewType, label: '🧾 Sample Management', icon: Droplet },
        { id: 'tests' as ViewType, label: '🔬 Test Management', icon: FlaskConical },
        { id: 'reports' as ViewType, label: '📄 Report Management', icon: FileText },
        { id: 'patients' as ViewType, label: '👨‍⚕️ Patient Records', icon: History },
        { id: 'clinics' as ViewType, label: '🔗 Connected Clinics', icon: LinkIcon },
        { id: 'billing' as ViewType, label: '💰 Billing & Payments', icon: CreditCard },
        { id: 'schedule' as ViewType, label: '⏰ Availability', icon: Clock },
        { id: 'reviews' as ViewType, label: '⭐ Reviews & Ratings', icon: Star },
        { id: 'staff' as ViewType, label: '👥 Staff Management', icon: Users },
        { id: 'settings' as ViewType, label: '⚙️ Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardOverview />;
            case 'bookings': return <TestBookings />;
            case 'samples': return <SampleManagement />;
            case 'tests': return <TestCatalog />;
            case 'reports': return <ReportManagement />;
            case 'patients': return <PatientRecords />;
            case 'clinics': return <ClinicConnections />;
            case 'billing': return <BillingPayments />;
            case 'schedule': return <Scheduling />;
            case 'reviews': return <Reviews />;
            case 'staff': return <StaffManagement />;
            case 'settings': return <LabSettings />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-white border-r border-[#F1F5F9] transition-all duration-500 ease-in-out flex flex-col z-50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.05)]`}>
                <div className="p-8 pb-4 flex items-center justify-between overflow-hidden">
                    {sidebarOpen ? (
                        <div className="flex flex-col animate-in slide-in-from-left duration-500">
                             <div className="flex items-center gap-2 group cursor-pointer active:scale-95 transition-transform duration-300">
                                 <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200"><FlaskConical className="w-5 h-5 text-white" /></div>
                                 <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase underline decoration-blue-500/30 decoration-4 underline-offset-4 leading-none">E-Labs</h1>
                             </div>
                             <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none pointer-events-none italic">Diagnostic Command Center</p>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-100"><FlaskConical className="w-5 h-5 text-white" /></div>
                    )}
                </div>

                <div className="p-4 overflow-hidden mb-4">
                     <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-blue-100 group w-full flex items-center justify-center text-gray-400 ${!sidebarOpen ? 'bg-blue-50/50 border-blue-100 text-blue-600' : ''}`}
                     >
                        {sidebarOpen ? <X className="w-5 h-5 group-hover:rotate-90 transition-transform" /> : <Menu className="w-5 h-5" />}
                     </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 transform scale-105 active:scale-100 border-none' 
                                    : 'text-gray-500 hover:bg-gray-50 border border-transparent active:scale-95'
                                }`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <div className={`p-1.5 rounded-xl transition-all grow-0 shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600 shadow-inner'}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                </div>
                                {sidebarOpen && (
                                    <span className={`text-[11px] font-black uppercase tracking-widest italic group-hover:italic transition-all ${isActive ? 'translate-x-1' : ''}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-[#F1F5F9] bg-gray-50/50 rounded-t-[2.5rem]">
                    {sidebarOpen ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-gray-400 border-4 border-white group-hover:scale-110 transition-transform transform -rotate-3 group-hover:rotate-0">
                                    {user.full_name?.charAt(0) || 'L'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest truncate leading-tight group-hover:text-blue-600 transition-colors">{user.full_name || 'Lab Admin'}</p>
                                    <p className="text-[10px] items-center gap-1 font-bold text-gray-400 uppercase tracking-tighter flex mt-1 group-hover:text-green-600 transition-colors"><ShieldCheck className="w-3 h-3 text-green-500" /> Authorized Access</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleLogout}
                                className="w-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl h-12 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest h-12 shadow-inner border border-red-100 transition-all hover:shadow-red-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Session</span>
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-12 h-12 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl mx-auto flex items-center justify-center transition-all border border-red-100 shadow-inner"
                            title="Terminate Session"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Modern Header */}
                <header className="h-28 bg-white border-b border-[#F1F5F9] px-12 flex items-center justify-between shrink-0 shadow-sm z-30">
                    <div className="flex items-center gap-8">
                         <div className="flex flex-col">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-1 italic">Knowledge Center / {currentView}</h2>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-green-50"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_green] animate-pulse" /></div>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest italic flex items-center gap-1">Facility Live & Operational</p>
                            </div>
                         </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer hidden md:flex items-center gap-3 px-4 py-2 border rounded-full hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-95 h-11">
                             <TrendingUp className="w-4 h-4 text-green-500 animate-bounce" />
                             <p className="text-[10px] font-black italic uppercase tracking-widest text-gray-600 leading-none">Market Share: <span className="text-blue-600">+12%</span></p>
                        </div>
                        <div className="h-10 w-[1px] bg-gray-100" />
                        <button className="relative p-3 bg-gray-50 hover:bg-blue-600 group rounded-2xl transition-all shadow-inner hover:shadow-blue-200">
                            <Bell className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full group-hover:animate-ping" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 animate-in fade-in duration-500 custom-scrollbar-main">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                    {/* Bottom Padding */}
                    <div className="h-20" />
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar-main::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar-main::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 20px; border: 4px solid transparent; background-clip: content-box; }
                .custom-scrollbar-main::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}
