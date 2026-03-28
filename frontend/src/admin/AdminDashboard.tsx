import { useEffect, useState } from 'react';
import { User } from '../common/types';
import { clinicService } from '../services/clinicService';
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  UserCog,
  ClipboardList,
  DollarSign,
  Pill,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
  Calendar,
  FileText as Prescription,
  Activity,
  Brain,
  Watch,
  Bell,
  LogOut,
  Loader2
} from 'lucide-react';

// Import existing components
import { ClinicProfile } from './ClinicProfile';
import { QueueManagement } from './QueueManagement';
import { DoctorManagement } from './DoctorManagement';
import { DoctorManagement as ClinicDoctorManagement } from '../clinic/DoctorManagement';
import { DoctorRegistration as ClinicDoctorRegistration } from '../clinic/DoctorRegistration';
import { StaffManagement } from './StaffManagement';

// Import clinic components (these exist in the clinic folder)
import { PatientManagement } from '../clinic/PatientManagement';
import { AppointmentManagement } from '../clinic/AppointmentManagement';
import { PrescriptionRecords } from '../clinic/PrescriptionRecords';
import { LabDiagnostics } from '../clinic/LabDiagnostics';
import { BillingPayments } from '../clinic/BillingPayments';
import { PharmacyInventory } from '../clinic/PharmacyInventory';
import { ReportsAnalytics } from '../clinic/ReportsAnalytics';
import { AIModules } from '../public/AIModules';
import { IoTIntegration } from '../clinic/IoTIntegration';
import { Notifications } from '../clinic/Notifications';
import { SecurityCompliance } from '../clinic/SecurityCompliance';
import { Settings as SettingsComponent } from '../clinic/Settings';

interface AdminDashboardProps {
  user: User;
}

type ViewType =
  | 'dashboard'
  | 'profile'
  | 'patients'
  | 'appointments'
  | 'queue'
  | 'doctors'
  | 'staff'
  | 'prescriptions'
  | 'lab'
  | 'billing'
  | 'pharmacy'
  | 'reports'
  | 'ai'
  | 'iot'
  | 'notifications'
  | 'security'
  | 'settings'
  | 'clinic-register-doctor';

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentQueue, setRecentQueue] = useState<any[]>([]);

  useEffect(() => {
    if (currentView === 'dashboard') {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const [reportsData, queueData] = await Promise.all([
            clinicService.getReports(),
            clinicService.getQueue()
          ]);
          setStats(reportsData);
          setRecentQueue(queueData.slice(0, 5));
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [currentView]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as ViewType, label: 'Clinic Profile', icon: Building2 },
    { id: 'patients' as ViewType, label: 'Patients', icon: Users },
    { id: 'appointments' as ViewType, label: 'Appointments', icon: Calendar },
    { id: 'queue' as ViewType, label: 'Queue Management', icon: ClipboardList },
    { id: 'doctors' as ViewType, label: 'Doctors', icon: Stethoscope },
    { id: 'staff' as ViewType, label: 'Staff', icon: UserCog },
    { id: 'prescriptions' as ViewType, label: 'Prescriptions', icon: Prescription },
    { id: 'lab' as ViewType, label: 'Lab & Diagnostics', icon: Activity },
    { id: 'billing' as ViewType, label: 'Billing', icon: DollarSign },
    { id: 'pharmacy' as ViewType, label: 'Pharmacy', icon: Pill },
    { id: 'reports' as ViewType, label: 'Reports', icon: FileText },
    { id: 'ai' as ViewType, label: 'AI Modules', icon: Brain },
    { id: 'iot' as ViewType, label: 'IoT & Wearables', icon: Watch },
    { id: 'notifications' as ViewType, label: 'Notifications', icon: Bell },
    { id: 'security' as ViewType, label: 'Security', icon: Shield },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ClinicProfile user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'patients':
        return <PatientManagement user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'appointments':
        return <AppointmentManagement userRole={user.role} />;
      case 'queue':
        return <QueueManagement userRole={user.role} />;
      case 'doctors':
        if (user.role === 'clinic') {
          return <ClinicDoctorManagement user={user} onNavigate={setCurrentView as any} onBack={() => setCurrentView('dashboard')} />;
        }
        return <DoctorManagement userRole={user.role} />;
      case 'clinic-register-doctor' as any: 
        return <ClinicDoctorRegistration onSuccess={() => setCurrentView('doctors')} onBack={() => setCurrentView('doctors')} />;
      case 'staff':
        return <StaffManagement userRole={user.role} />;
      case 'prescriptions':
        return <PrescriptionRecords userRole={user.role} />;
      case 'lab':
        return <LabDiagnostics userRole={user.role} />;
      case 'billing':
        return <BillingPayments userRole={user.role} />;
      case 'pharmacy':
        return <PharmacyInventory userRole={user.role} />;
      case 'reports':
        return <ReportsAnalytics userRole={user.role} />;
      case 'ai':
        return <AIModules userRole={user.role} />;
      case 'iot':
        return <IoTIntegration userRole={user.role} />;
      case 'notifications':
        return <Notifications userRole={user.role} />;
      case 'security':
        return <SecurityCompliance userRole={user.role} />;
      case 'settings':
        return <SettingsComponent userRole={user.role} />;
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.full_name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_patients || 0}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_doctors || 0}</p>
                <p className="text-sm text-gray-600">Active Doctors</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <UserCog className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_staff || 0}</p>
                <p className="text-sm text-gray-600">Staff Members</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</p>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setCurrentView('queue')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-center group"
                >
                  <ClipboardList className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Manage Queue</p>
                  <p className="text-xs text-gray-500 mt-1">{recentQueue.length} waiting</p>
                </button>
                <button
                  onClick={() => setCurrentView('appointments')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all text-center group"
                >
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Appointments</p>
                  <p className="text-xs text-gray-500 mt-1">Real-time schedule</p>
                </button>
                <button
                  onClick={() => setCurrentView('patients')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-center group"
                >
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Patients</p>
                  <p className="text-xs text-gray-500 mt-1">Registry access</p>
                </button>
                <button
                  onClick={() => setCurrentView('billing')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all text-center group"
                >
                  <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Revenue</p>
                  <p className="text-xs text-gray-500 mt-1">₹{stats?.total_revenue || 0} total</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Queue Activities</h2>
                <div className="space-y-3">
                  {recentQueue.length > 0 ? (
                    recentQueue.map((apt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{apt.patient?.full_name}</p>
                          <p className="text-sm text-gray-600">{apt.doctor?.full_name} • {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No active queue items</p>
                  )}
                </div>
                <button
                  onClick={() => setCurrentView('queue')}
                  className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Full Queue →
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Server Status</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Database</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Backup Status</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">AI Modules</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This feature is under development</p>
          </div>
        );
    }
  };

  if (loading && currentView === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Powering up your medical command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-600">Clinic Management</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {sidebarOpen && (
                    <span className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-2">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
