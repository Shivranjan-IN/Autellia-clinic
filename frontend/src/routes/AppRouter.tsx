import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

// Core Pages
import { Home } from "../public/Home";
import { LoginPage as Login } from "../auth/Login";
import { ForgotPassword } from "../auth/ForgotPassword";
import { Features } from "../public/Features";
import { HowItWorks } from "../public/HowItWorks";
import { Pricing } from "../public/Pricing";
import { AIFeatures } from "../public/AIFeatures";
import { Healthcare } from "../public/Healthcare";
import { MedicineEnhanced as Medicine } from "../public/MedicineEnhanced";
import { TelemedicineConsultationEnhanced as DoctorConsult } from "../doctor/TelemedicineConsultationEnhanced";
import { LabTests } from "../public/LabTests";
import { Plus } from "../public/Plus";
import { HealthInsights } from "../public/HealthInsights";
import { Offers } from "../public/Offers";
import { Contact } from "../public/Contact";

// Registration Components
import { ClinicRegistration } from "../clinic/ClinicRegistration";
import { DoctorRegistration } from "../doctor/DoctorRegistration";
import { LabRegistration } from "../lab/LabRegistration";

// Patient Portal Components
import { PatientPortal } from "../patient/PatientPortal";
import { DoctorDashboard } from "../doctor/DoctorDashboard";
import { ClinicDashboard } from "../clinic/ClinicDashboard";
import { ReceptionDashboard } from "../staff/reception/ReceptionDashboard";
import { NurseDashboard } from "../staff/nurse/NurseDashboard";
import { LabDashboard } from "../lab/LabDashboard";
import { PharmacyDashboard } from "../staff/pharmacy/PharmacyDashboard";
import { AdminDashboard } from "../admin/AdminDashboard";
import { ClinicProfile } from "../clinic/ClinicProfile";
import { AppointmentManagement } from "../clinic/AppointmentManagement";
import { PatientManagement } from "../clinic/PatientManagement";
import { StaffManagement } from "../staff/StaffManagement";
import { BillingPayments } from "../clinic/BillingPayments";
import { PharmacyInventory } from "../clinic/PharmacyInventory";
import { LabDiagnostics } from "../clinic/LabDiagnostics";
import { PrescriptionRecords } from "../clinic/PrescriptionRecords";
import { QueueManagement } from "../clinic/QueueManagement";
import { ReportsAnalytics } from "../clinic/ReportsAnalytics";
import { IoTIntegration } from "../clinic/IoTIntegration";
import { SecurityCompliance } from "../clinic/SecurityCompliance";
import { Settings } from "../clinic/Settings";
import { Notifications } from "../clinic/Notifications";

// Patient Portal Views (Sub-components)
import { BookAppointment } from "../patient/BookAppointment";
import { MyAppointments } from "../patient/MyAppointments";
import { MyPrescriptions } from "../patient/MyPrescriptions";
import { MyReports } from "../patient/MyReports";
import { MyBilling } from "../patient/MyBilling";
import { PatientProfile } from "../patient/PatientProfile";
import { MedicineStore } from "../patient/MedicineStore";
import { VideoConsultation } from "../patient/VideoConsultation";
import { AIHealthTools } from "../patient/AIHealthTools";
import { XrayAnalysisPage } from "../patient/XrayAnalysisPage";

export const AppRouter: React.FC = () => {
    const { user, login, logout, loading } = useAuth();
    const { currentView, navigateTo } = useNavigation();

    // Debug logging
    useEffect(() => {
        console.log("🚀 AppRouter: Component Mounted");
    }, []);

    console.log("🚀 AppRouter: Rendering. currentView:", currentView, "loading:", loading, "hasUser:", !!user);

    useEffect(() => {
        console.log("🔄 AppRouter: State Update", {
            currentView,
            userRole: user?.role,
            loading,
            hasUser: !!user
        });
    }, [currentView, user, loading]);

    // Auto-redirect authenticated users from home to dashboard
    useEffect(() => {
        if (!loading && user && currentView === "home") {
            console.log("🔀 AppRouter: Auto-redirecting to dashboard");
            navigateTo("dashboard");
        }
    }, [user, loading, currentView, navigateTo]);

    const handleLoginRequired = () => {
        alert("Please login to continue");
        navigateTo("login");
    };

    const handleRegister = (role: "doctor" | "clinic" | "lab") => {
        if (role === "clinic") {
            navigateTo("register-clinic");
        } else if (role === "doctor") {
            navigateTo("register-doctor");
        } else if (role === "lab") {
            navigateTo("register-lab");
        }
    };

    const handleRegistrationComplete = () => {
        alert("Registration completed successfully! Welcome to your dashboard.");
        navigateTo("dashboard");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Initializing E-Clinic...</p>
            </div>
        );
    }

    // --- Core Routing Logic ---

    // Public Authentication & Registration
    if (currentView === "login") return <Login onLogin={login} onBack={() => navigateTo("home")} onRegister={handleRegister} />;
    if (currentView === "forgot-password") return <ForgotPassword />;
    if (currentView === "register-clinic") return <ClinicRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
    if (currentView === "register-doctor") return <DoctorRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
    if (currentView === "register-lab") return <LabRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;

    // Public Feature Pages
    if (currentView === "features") return <Features onNavigate={navigateTo} />;
    if (currentView === "how-it-works") return <HowItWorks onNavigate={navigateTo} />;
    if (currentView === "pricing") return <Pricing onNavigate={navigateTo} />;
    if (currentView === "ai-features") return <AIFeatures onNavigate={navigateTo} />;
    if (currentView === "medicine") return <Medicine onNavigate={navigateTo} user={user} onLoginRequired={handleLoginRequired} />;
    if (currentView === "healthcare") return <Healthcare onNavigate={navigateTo} />;
    if (currentView === "doctor-consult") return <DoctorConsult onClose={() => navigateTo("dashboard")} />;
    if (currentView === "lab-tests") return <LabTests onNavigate={navigateTo} />;
    if (currentView === "plus") return <Plus onNavigate={navigateTo} />;
    if (currentView === "health-insights") return <HealthInsights onNavigate={navigateTo} />;
    if (currentView === "offers") return <Offers onNavigate={navigateTo} />;
    if (currentView === "contact") return <Contact onNavigate={navigateTo} />;

    // Patient Secured Views
    if (currentView === "patient-book-appointment") return <BookAppointment patient={user as any} />;
    if (currentView === "patient-appointments") return <MyAppointments patient={user as any} onNavigate={navigateTo as any} />;
    if (currentView === "patient-prescriptions") return <MyPrescriptions patient={user as any} />;
    if (currentView === "patient-reports") return <MyReports patient={user as any} />;
    if (currentView === "patient-billing") return <MyBilling patient={user as any} />;
    if (currentView === "patient-profile") return <PatientProfile patient={user as any} onProfileUpdate={() => {}} />;
    if (currentView === "patient-medicine-store") return <MedicineStore onNavigate={navigateTo as any} />;
    if (currentView === "patient-video-consult") return <VideoConsultation patient={user as any} />;
    if (currentView === "patient-ai-tools") return <AIHealthTools />;
    if (currentView === "patient-xray-analysis") return <XrayAnalysisPage user={user as any} onBack={() => navigateTo("dashboard")} />;

    // Clinic Management Views
    if (currentView === "clinic-appointments") return <AppointmentManagement userRole={user?.role as any} />;
    if (currentView === "clinic-doctors") return <DoctorRegistration onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-patients") return <PatientManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-staff") return <StaffManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-billing") return <BillingPayments userRole={user?.role as any} />;
    if (currentView === "clinic-pharmacy") return <PharmacyInventory userRole={user?.role as any} />;
    if (currentView === "clinic-lab") return <LabDiagnostics user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-prescriptions") return <PrescriptionRecords userRole={user?.role as any} />;
    if (currentView === "clinic-queue") return <QueueManagement userRole={user?.role as any} />;
    if (currentView === "clinic-reports") return <ReportsAnalytics userRole={user?.role as any} />;
    if (currentView === "clinic-iot") return <IoTIntegration userRole={user?.role as any} />;
    if (currentView === "clinic-security") return <SecurityCompliance userRole={user?.role as any} />;
    if (currentView === "clinic-settings") return <Settings userRole={user?.role as any} />;
    if (currentView === "clinic-notifications") return <Notifications userRole={user?.role as any} />;
    if (currentView === "clinic-profile") return <ClinicProfile user={user} onBack={() => navigateTo("dashboard")} />;

    // Main Role Dashboards (explicitly requested dashboards)
    if (currentView === "patient-dashboard" && user) return <PatientPortal user={user} onLogout={logout} />;
    if (currentView === "doctor-dashboard" && user) return <DoctorDashboard user={user} />;
    if (currentView === "clinic-dashboard" && user) return <ClinicDashboard user={user} />;
    if (currentView === "reception-dashboard" && user) return <ReceptionDashboard user={user} />;
    if (currentView === "nurse-dashboard" && user) return <NurseDashboard user={user} />;
    if (currentView === "lab-dashboard" && user) return <LabDashboard user={user} />;
    if (currentView === "pharmacy-dashboard" && user) return <PharmacyDashboard user={user} />;
    if (currentView === "admin-dashboard" && user) return <AdminDashboard user={user} />;

    // Role-based Routing (Generic "dashboard" view)
    if (currentView === "dashboard" && user) {
        const role = user.role?.toLowerCase();
        console.log("📋 Routing to dashboard for role:", role);
        switch (role) {
            case "patient": return <PatientPortal user={user} onLogout={logout} />;
            case "doctor": return <DoctorDashboard user={user} />;
            case "clinic": return <ClinicDashboard user={user} />;
            case "receptionist": return <ReceptionDashboard user={user} />;
            case "nurse": return <NurseDashboard user={user} />;
            case "lab": return <LabDashboard user={user} />;
            case "pharmacy": return <PharmacyDashboard user={user} />;
            case "admin": return <AdminDashboard user={user} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
                        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                            <h1 className="text-2xl font-black text-red-600 mb-2 uppercase">Access Restricted</h1>
                            <p className="text-slate-500 mb-6">Your account role ({user.role}) is not recognized. Please contact the administrator.</p>
                            <button 
                                onClick={() => navigateTo("home")} 
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Return to Homepage
                            </button>
                        </div>
                    </div>
                );
        }
    }

    // Default Fallback (usually Homepage)
    return <Home onGetStarted={() => navigateTo("login")} onNavigate={navigateTo} />;
};
