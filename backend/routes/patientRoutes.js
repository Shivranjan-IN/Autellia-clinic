const express = require('express');
const { check } = require('express-validator');
const patientController = require('../controllers/patientController');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/profile', patientController.getPatientProfile);
router.get('/dashboard/stats', patientController.getDashboardStats);
router.put('/profile', patientController.updatePatientProfile);
// Use memory upload for profile photos (stores binary in database)
router.post('/profile/photo', upload.single('profile_photo'), patientController.uploadProfilePhoto);

router.post(
    '/',
    [
        authorize('admin', 'clinic', 'receptionist', 'doctor'),
        check('patient_id', 'Patient ID is required').not().isEmpty(),
        check('full_name', 'Name is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty(),
        validate
    ],
    patientController.createPatient
);

router.get('/', patientController.getAllPatients);

router.get('/:id', patientController.getPatientById);

router.put(
    '/:id',
    [
        authorize('admin', 'receptionist', 'doctor'),
        validate
    ],
    patientController.updatePatient
);

router.delete(
    '/:id',
    authorize('admin'),
    patientController.deletePatient
);

// Get patient profile photo from database
router.get('/profile/photo/:patientId', patientController.getProfilePhoto);

// AI Insight routes
router.post('/ai/explain-report', patientController.explainReport);
router.post('/ai/explain-prescription', patientController.explainPrescription);

module.exports = router;
