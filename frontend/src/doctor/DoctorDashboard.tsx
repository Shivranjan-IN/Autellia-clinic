import { useState } from 'react';
import { User } from '../common/types';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  TestTube,
  BarChart3,
  Brain,
  Activity,
  Bell,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { AppointmentManagement } from './AppointmentManagement';
import { Prescription } from './Prescription';
import { TelemedicineConsultationEnhanced } from './TelemedicineConsultationEnhanced';
import { PrescriptionRecords } from './PrescriptionRecords';
import { LabDiagnostics } from './LabDiagnostics';
import { ReportsAnalytics } from './ReportsAnalytics';
import { AIModules } from './AIModules';
import { IoTIntegration } from './IoTIntegration';
import { Notifications } from './Notifications';
import { PatientDocuments } from './PatientDocuments';
import { Settings } from './Settings';
import { useAuth } from '../contexts/AuthContext';

interface DoctorDashboardProps {
  user: User;
}

type DoctorView =
  | 'dashboard'
  | 'appointments'
  | 'prescription'
  | 'prescription_records'
  | 'lab'
  | 'reports'
  | 'patient_documents'
  | 'ai'
  | 'iot'
  | 'notifications'
  | 'settings'
  | 'video_consult';

const menuItems = [
  { id: 'dashboard' as DoctorView, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments' as DoctorView, label: 'Appointment Management', icon: Calendar },
  { id: 'prescription_records' as DoctorView, label: 'Prescription Records', icon: FileText },
  { id: 'lab' as DoctorView, label: 'Lab Diagnostics', icon: TestTube },
  { id: 'reports' as DoctorView, label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'patient_documents' as DoctorView, label: 'Patient Documents', icon: FileText },
  { id: 'ai' as DoctorView, label: 'AI Modules', icon: Brain },
  { id: 'iot' as DoctorView, label: 'IoT Integration', icon: Activity },
  { id: 'notifications' as DoctorView, label: 'Notifications', icon: Bell },
  { id: 'settings' as DoctorView, label: 'Settings', icon: SettingsIcon },
];

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [currentView, setCurrentView] = useState<DoctorView>('dashboard');
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const { logout } = useAuth();

  const handleStartAppointment = (appointment: any) => {
    setActiveAppointment(appointment);
    if (appointment.mode === 'video') {
      setCurrentView('video_consult');
    } else {
      setCurrentView('prescription');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={user.role as any} />;
      case 'appointments':
        return <AppointmentManagement userRole={user.role as any} onStartAppointment={handleStartAppointment} />;
      case 'prescription':
        return <Prescription appointment={activeAppointment} onBack={() => setCurrentView('appointments')} />;
      case 'prescription_records':
        return <PrescriptionRecords />;
      case 'lab':
        return <LabDiagnostics userRole={user.role as any} />;
      case 'reports':
        return <ReportsAnalytics userRole={user.role as any} />;
      case 'patient_documents':
        return <PatientDocuments />;
      case 'ai':
        return <AIModules userRole={user.role as any} />;
      case 'iot':
        return <IoTIntegration userRole={user.role as any} />;
      case 'notifications':
        return <Notifications userRole={user.role as any} />;
      case 'settings':
        return <Settings userRole={user.role as any} />;
      case 'video_consult':
        return <TelemedicineConsultationEnhanced 
                  onClose={() => setCurrentView('appointments')} 
                  appointmentId={activeAppointment?.appointment_id} 
                />;
      default:
        return <Dashboard userRole={user.role as any} />;
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-900 selection:bg-blue-600/10">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">E-Clinic</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium truncate">{user.name}</p>
          <div className="mt-2 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Medical Pro</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${isActive
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Secure Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2F5] relative custom-scrollbar">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="p-10 relative z-10 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
