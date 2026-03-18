const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Controllers
const clinicController = require('../controllers/clinicController');
const clinicPatientController = require('../controllers/clinicPatientController');
const clinicStaffController = require('../controllers/clinicStaffController');
const clinicOpsController = require('../controllers/clinicOpsController');

// All clinic routes require 'clinic' role protection
router.use(protect);
router.use(authorize('clinic'));

// 1 & 2. Admin Dashboard & Profile
router.get('/profile', clinicController.getProfile);
router.put('/profile', clinicController.updateProfile);

// 3. Patient Management
router.get('/patients/search', clinicPatientController.searchPatient);
router.get('/patients/today', clinicPatientController.getTodayPatients);
router.get('/patients/upcoming', clinicPatientController.getUpcomingPatients);
router.get('/patients/completed', clinicPatientController.getCompletedPatients);
router.get('/patients', clinicPatientController.getAllPatients);
router.post('/patients', clinicPatientController.addPatient);

// 4. Appointment Management
router.get('/appointments', clinicPatientController.getAppointments);
router.post('/appointments', clinicPatientController.createAppointment);
router.post('/appointments/book', clinicPatientController.bookAppointment);
router.put('/appointments/:id', clinicPatientController.updateAppointment);
router.patch('/appointments/:id/status', clinicPatientController.updateAppointmentStatus);
router.delete('/appointments/:id', clinicPatientController.deleteAppointment);

// Clinic Doctors list (for booking dropdown)
router.get('/doctors/list', clinicPatientController.getClinicDoctors);

// 5. Queue Management
router.get('/queue', clinicPatientController.getQueue);

// 6. Doctor Management
router.get('/doctors', clinicStaffController.getDoctors);
router.post('/doctors', clinicStaffController.addDoctor);
router.delete('/doctors/:id', clinicStaffController.removeDoctor);

// 7. Staff Management
router.get('/staff', clinicStaffController.getStaff);
router.post('/staff', clinicStaffController.addStaff);
router.put('/staff/:id', clinicStaffController.updateStaff);
router.delete('/staff/:id', clinicStaffController.deleteStaff);

// 8. Prescription & Medical Records
router.get('/prescriptions', clinicOpsController.getPrescriptions);

// 9. Lab & Diagnostics
router.get('/labs', clinicOpsController.getLabs);
router.post('/labs', clinicOpsController.addLab);
router.get('/labs/orders', clinicOpsController.getLabOrders);
router.post('/labs/orders', clinicOpsController.createLabOrder);

// 10. Billing & Payments
router.get('/billing', clinicOpsController.getBilling);
router.get('/billing/patients/search', clinicOpsController.searchBillingPatients);
router.post('/billing', clinicOpsController.createInvoice);
router.put('/billing/:id', clinicOpsController.updateInvoiceStatus);

// 11. Pharmacy & Inventory
router.get('/medicines', clinicOpsController.getMedicines);
router.post('/medicines', clinicOpsController.addMedicine);

// 12. Reports & Analytics
router.get('/reports', clinicController.getReports);

// 13. Notifications
router.get('/notifications', clinicOpsController.getNotifications);

// 14. Settings
router.get('/settings', clinicController.getSettings);
router.put('/settings', clinicController.updateSettings);

module.exports = router;
