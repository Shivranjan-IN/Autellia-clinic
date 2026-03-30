const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');\n\n// Public doctor list for booking (no auth required)\nrouter.get('/public', doctorController.getAllDoctors);

// Protected routes (auth required)\nrouter.use(protect);

// Routes accessible by both patients and doctors (like fetching the doctor list)
router.get('/', doctorController.getAllDoctors);

// Clinic and Doctor Registration (Clinic Admin can register doctors)
router.post('/register', authorize('clinic'), doctorController.registerDoctor);

// Other doctor-specific routes require 'doctor' role
router.use(authorize('doctor', 'clinic'));

// Patient Management
router.get('/patients', doctorController.getDoctorPatients);
router.delete('/patients/:id', doctorController.deleteDoctorPatient);

// Appointment Management
router.get('/appointments', doctorController.getDoctorAppointments);
router.post('/appointments', doctorController.createDoctorAppointment);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Prescription Management
router.get('/prescriptions', doctorController.getDoctorPrescriptions);
router.post('/prescriptions', doctorController.createDoctorPrescription);

// Dashboard Stats
router.get('/stats', doctorController.getDoctorStats);

// Profile Management
router.get('/profile', doctorController.getDoctorProfile);
router.put('/profile', doctorController.updateDoctorProfile);

module.exports = router;
