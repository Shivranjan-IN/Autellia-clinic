const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// ── Public route: no auth required, no token validation ──────────────────────
// Explicitly bypass any token sent by the client so that a patient with a
// token that has role=null does NOT trigger a 403 from a downstream authorize().
router.get('/public', (req, res, next) => {
    // Strip the Authorization header so protect() is never tempted to validate it
    delete req.headers.authorization;
    next();
}, doctorController.getAllDoctors);

// ── Protected routes (valid JWT required) ────────────────────────────────────
router.use(protect);

// Accessible by ALL authenticated roles (patient, doctor, clinic, admin, etc.)
router.get('/', doctorController.getAllDoctors);

// Clinic and Doctor Registration (Clinic Admin can register doctors)
router.post('/register', authorize('clinic'), doctorController.registerDoctor);

// Doctor & Clinic only routes below
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
