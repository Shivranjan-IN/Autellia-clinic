import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

// Core Pages
import { Home } from "../public/Home";
import { LoginPage as Login } from "../auth/Login";
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

// Patient Portal Components
import { PatientPortal } from "../patient/PatientPortal";
import { DoctorDashboard } from "../doctor/DoctorDashboard";
import { ClinicDashboard } from "../clinic/ClinicDashboard";
import { ReceptionDashboard } from "../staff/reception/ReceptionDashboard";
import { NurseDashboard } from "../staff/nurse/NurseDashboard";
import { LabDashboard } from "../staff/lab/LabDashboard";
import { PharmacyDashboard } from "../staff/pharmacy/PharmacyDashboard";
import { AdminDashboard } from "../admin/AdminDashboard";
import { ClinicProfile } from "../clinic/ClinicProfile";
import { AppointmentManagement } from "../clinic/AppointmentManagement";
import { PatientManagement } from "../clinic/PatientManagement";
import { DoctorManagement } from "../doctor/DoctorManagement";
import { StaffManagement } from "../staff/StaffManagement";
import { BillingPayments } from "../clinic/BillingPayments";
import { PharmacyInventory } from "../clinic/PharmacyInventory";
import { LabDiagnostics } from "../clinic/LabDiagnostics";
import { PrescriptionRecords } from "../clinic/PrescriptionRecords";
import { QueueManagement } from "../clinic/QueueManagement";
import { ReportsAnalytics } from "../clinic/ReportsAnalytics";
import { IoTIntegration } from "../clinic/IoTIntegration";
import { AIModules } from "../public/AIModules";
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


export const AppRouter: React.FC = () => {
    const { user, login, logout, loading } = useAuth();
    const { currentView, navigateTo } = useNavigation();

    // Debug logging
    console.log("🔄 AppRouter render:", {
        currentView,
        user,
        loading,
        userRole: user?.role,
        isDashboardView: currentView === "dashboard",
        hasUser: !!user,
        shouldShowDashboard: currentView === "dashboard" && !!user
    });

    // Auto-redirect authenticated users from home to dashboard
    React.useEffect(() => {
        if (!loading && user && currentView === "home") {
            console.log("🔀 Auto-redirecting authenticated user to dashboard");
            navigateTo("dashboard");
        }
    }, [user, loading, currentView, navigateTo]);

    const handleLoginRequired = () => {
        alert("Please login to continue");
        navigateTo("login");
    };

    const handleRegister = (role: "doctor" | "clinic") => {
        if (role === "clinic") {
            navigateTo("register-clinic");
        } else if (role === "doctor") {
            navigateTo("register-doctor");
        }
    };

    const handleRegistrationComplete = () => {
        alert("Registration completed successfully! Welcome to your dashboard.");
        navigateTo("dashboard");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }

    // --- Render Logic ---

    // 1. Core Public Pages
    if (currentView === "home") return <Home onGetStarted={() => navigateTo("login")} onNavigate={navigateTo} />;
    if (currentView === "login") return <Login onLogin={login} onBack={() => navigateTo("home")} onRegister={handleRegister} />;

    if (currentView === "register-clinic") return <ClinicRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
    if (currentView === "register-doctor") return <DoctorRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;

    // Feature Pages
    if (currentView === "features") return <Features onNavigate={navigateTo} />;
    if (currentView === "how-it-works") return <HowItWorks onNavigate={navigateTo} />;
    if (currentView === "pricing") return <Pricing onNavigate={navigateTo} />;
    if (currentView === "ai-features") return <AIFeatures onNavigate={navigateTo} />;
    if (currentView === "medicine") return <Medicine onNavigate={navigateTo} user={user} onLoginRequired={handleLoginRequired} />;
    if (currentView === "healthcare") return <Healthcare onNavigate={navigateTo} />;
    if (currentView === "doctor-consult") return <DoctorConsult onNavigate={navigateTo} />;
    if (currentView === "lab-tests") return <LabTests onNavigate={navigateTo} />;
    if (currentView === "plus") return <Plus onNavigate={navigateTo} />;
    if (currentView === "health-insights") return <HealthInsights onNavigate={navigateTo} />;
    if (currentView === "offers") return <Offers onNavigate={navigateTo} />;
    if (currentView === "contact") return <Contact onNavigate={navigateTo} />;

    // Cart placeholder
    if (currentView === "cart") {
        alert("Cart page component needs to be created");
        return <Home onGetStarted={() => navigateTo("login")} onNavigate={navigateTo} />;
    }

    // 2. Secured / Dashboard Views
    // Patient Specific Views (when drilled down from dashboard)
    if (currentView === "patient-book-appointment") return <BookAppointment user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-appointments") return <MyAppointments user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-prescriptions") return <MyPrescriptions user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-reports") return <MyReports user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-billing") return <MyBilling user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-profile") return <PatientProfile user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-medicine-store") return <MedicineStore user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-video-consult") return <VideoConsultation user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "patient-ai-tools") return <AIHealthTools user={user} onBack={() => navigateTo("dashboard")} />;

    // Clinic Management Views
    if (currentView === "clinic-appointments") return <AppointmentManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-patients") return <PatientManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-doctors") return <DoctorManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-staff") return <StaffManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-billing") return <BillingPayments user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-pharmacy") return <PharmacyInventory user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-lab") return <LabDiagnostics user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-prescriptions") return <PrescriptionRecords user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-queue") return <QueueManagement user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-reports") return <ReportsAnalytics user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-iot") return <IoTIntegration user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-ai") return <AIModules user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-security") return <SecurityCompliance user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-settings") return <Settings user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-notifications") return <Notifications user={user} onBack={() => navigateTo("dashboard")} />;
    if (currentView === "clinic-profile") return <ClinicProfile user={user} onBack={() => navigateTo("dashboard")} />;

    // Main Role Dashboards (explicit views)
    if (currentView === "patient-dashboard" && user) return <PatientPortal user={user} onLogout={logout} />;
    if (currentView === "doctor-dashboard" && user) return <DoctorDashboard user={user} />;
    if (currentView === "clinic-dashboard" && user) return <ClinicDashboard user={user} />;
    if (currentView === "reception-dashboard" && user) return <ReceptionDashboard user={user} />;
    if (currentView === "nurse-dashboard" && user) return <NurseDashboard user={user} />;
    if (currentView === "lab-dashboard" && user) return <LabDashboard user={user} />;
    if (currentView === "pharmacy-dashboard" && user) return <PharmacyDashboard user={user} />;
    if (currentView === "admin-dashboard" && user) return <AdminDashboard user={user} />;

    // Generic "dashboard" view -> Route based on Role
    if (currentView === "dashboard" && user) {
        switch (user.role?.toLowerCase()) {
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
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                        <p className="text-gray-600">You do not have permission to access this dashboard. Role: {user.role}</p>
                        <button onClick={() => navigateTo("home")} className="mt-4 text-blue-600 hover:underline">Return Home</button>
                    </div>
                );
        }
    }

    // Default Fallback
    return <Home onGetStarted={() => navigateTo("login")} onNavigate={navigateTo} />;
};
