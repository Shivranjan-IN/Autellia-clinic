const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// User registration
router.post('/register', authController.register);

// Doctor registration - use memory upload for storing files in database
router.post('/register/doctor', upload.fields([
  { name: 'mciReg', maxCount: 1 },
  { name: 'degree', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'clinicLetter', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), authController.registerDoctor);

// Clinic registration - use memory upload for storing files in Supabase
router.post('/register/clinic', upload.fields([
  { name: 'registration', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'gst', maxCount: 1 }
]), authController.registerClinic);

// Email/password login
router.post('/login', authController.login);

// Google OAuth routes - use passport.authenticate directly in routes
const passport = require('passport');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/?error=auth_failed' }),
    authController.googleAuthCallback
);

// Get current user
router.get('/me', protect, authController.getCurrentUser);

// Verify OTP
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
