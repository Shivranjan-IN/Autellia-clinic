const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const Clinic = require('../models/clinicModel');
const ResponseHandler = require('../utils/responseHandler');
const { validatePAN, validateIFSC, validateGSTIN } = require('../utils/validators');
const prisma = require('../config/database');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseStorage');

exports.googleAuth = (req, res, next) => {
  console.log('Google auth route hit');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'Google OAuth not configured',
      message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required'
    });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// Note: passport.authenticate is already called in the route before this controller
// The user is available in req.user after passport middleware runs
exports.googleAuthCallback = (req, res) => {
  const user = req.user;

  if (!user) {
    console.error('Google auth error: No user in request');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}?error=no_user`);
  }

  try {
    console.log('Google callback for user:', user.email, 'role:', user.role);

    // Create JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Redirect to base URL - frontend will handle role-based navigation
    const redirectPath = '';

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}${redirectPath}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }))}`);
  } catch (error) {
    console.error('Token generation error:', error);
    res.redirect('http://localhost:5173?error=token_generation_failed');
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    ResponseHandler.success(res, {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }, 'User data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return ResponseHandler.badRequest(res, 'Please provide full name, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return ResponseHandler.badRequest(res, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role: role || 'patient'
    });

    // Create token
    const token = jwt.sign(
      { id: newUser.user_id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: newUser.user_id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role.toLowerCase()
    };

    // If it's a patient, create a record in the patients table
    if (newUser.role === 'patient') {
      try {
        await prisma.patients.create({
          data: {
            patient_id: `PAT-${Date.now()}`,
            full_name: newUser.full_name,
            email: newUser.email,
            phone: newUser.mobile_number,
            user_id: newUser.user_id
          }
        });
      } catch (patientError) {
        console.error('Error creating patient profile:', patientError);
        // We continue as the user is still created, but logging this is important
      }
    }

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return ResponseHandler.badRequest(res, 'Please provide email and password');
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return ResponseHandler.unauthorized(res, 'Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return ResponseHandler.unauthorized(res, 'Invalid credentials');
    }

    // Create token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role.toLowerCase()
    };

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

exports.registerDoctor = async (req, res, next) => {
  try {
    const data = req.body;

    const {
      name,
      email,
      mobile,
      gender,
      dob,
      mciReg,
      councilName,
      regYear,
      degrees,
      university,
      gradYear,
      experience,
      specializations,
      languages,
      consultationModes,
      bankDetails,
      bio,
      password
    } = data;

    // Validate required fields
    if (!name || !email || !mobile || !password || !mciReg || !councilName || !regYear || !degrees || !university || !gradYear || !experience) {
      return ResponseHandler.badRequest(res, 'Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return ResponseHandler.badRequest(res, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      full_name: name,
      email,
      mobile_number: mobile,
      password_hash: hashedPassword,
      role: 'doctor'
    });

    // Create doctor record
    const doctorData = {
      full_name: name,
      date_of_birth: new Date(dob),
      mobile,
      email,
      medical_council_reg_no: mciReg,
      medical_council_name: councilName,
      registration_year: parseInt(regYear),
      qualifications: degrees,
      university_name: university,
      graduation_year: parseInt(gradYear),
      experience_years: parseInt(experience),
      bio: bio || '',
      bank_account_name: bankDetails?.accountName || '',
      bank_account_number: bankDetails?.accountNumber || '',
      ifsc_code: bankDetails?.ifsc || '',
      pan_number: bankDetails?.pan || '',
      gstin: bankDetails?.gstin || '',
      terms_accepted: true,
      declaration_accepted: true,
      user_id: newUser.user_id
    };

    // Validate bank details if provided
    if (bankDetails) {
      if (bankDetails.pan && !validatePAN(bankDetails.pan)) {
        return ResponseHandler.badRequest(res, 'Invalid PAN format');
      }
      if (bankDetails.ifsc && !validateIFSC(bankDetails.ifsc)) {
        return ResponseHandler.badRequest(res, 'Invalid IFSC format');
      }
      if (bankDetails.gstin && !validateGSTIN(bankDetails.gstin)) {
        return ResponseHandler.badRequest(res, 'Invalid GSTIN format');
      }
    }

    const newDoctor = await Doctor.create(doctorData);

    // Insert multi-value normalized data
    if (specializations) {
      await Doctor.insertSpecializations(newDoctor.id, specializations);
    }
    if (languages) {
      await Doctor.insertLanguages(newDoctor.id, languages);
    }
    if (consultationModes) {
      await Doctor.insertConsultationModes(newDoctor.id, consultationModes);
    }

    // Store uploaded documents in Supabase and save URL in database
    const documentFields = ['mciReg', 'degree', 'idProof', 'clinicLetter', 'signature'];
    for (const fieldName of documentFields) {
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        
        // Upload to Supabase
        const uploadResult = await uploadToSupabase(
          file.buffer,
          file.originalname,
          'doctors/documents'
        );

        if (uploadResult.success) {
          await prisma.doctor_documents.create({
            data: {
              doctor_id: newDoctor.id,
              document_type: fieldName,
              file_url: uploadResult.url,
              mime_type: file.mimetype,
              file_size: file.size
            }
          });
        } else {
          console.error(`Failed to upload ${fieldName} to Supabase:`, uploadResult.error);
        }
      }
    }

    // Mirror financial data to verification_details
    await prisma.verification_details.create({
      data: {
        doctor_id: newDoctor.id,
        account_name: bankDetails?.accountName || '',
        account_number: bankDetails?.accountNumber || '',
        ifsc_code: bankDetails?.ifsc || '',
        pan_number: bankDetails?.pan || '',
        gstin: bankDetails?.gstin || '',
        verification_type: 'DOCTOR'
      }
    });

    // Create token
    const token = jwt.sign(
      { id: newUser.user_id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: newUser.user_id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role.toLowerCase()
    };

    res.status(200).json({ token, user: userResponse, doctor: newDoctor });
  } catch (error) {
    next(error);
  }
};

exports.registerClinic = async (req, res, next) => {
  try {
    const {
      name,
      type,
      establishedYear,
      tagline,
      description,
      address,
      pinCode,
      city,
      state,
      mobile,
      email,
      website,
      medicalCouncilRegNo,
      bankDetails,
      services,
      facilities,
      paymentModes,
      bookingModes,
      password
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password || !address || !pinCode || !city || !state || !medicalCouncilRegNo) {
      return ResponseHandler.badRequest(res, 'Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return ResponseHandler.badRequest(res, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      full_name: name,
      email,
      mobile_number: mobile,
      password_hash: hashedPassword,
      role: 'clinic'
    });

    // Create clinic record - only include fields that exist in the database
    const clinicData = {
      clinic_name: name,
      establishment_year: establishedYear ? parseInt(establishedYear) : null,
      tagline: tagline || null,
      description: description || null,
      address,
      pin_code: pinCode,
      city,
      state,
      mobile,
      email,
      website: website || null,
      medical_council_reg_no: medicalCouncilRegNo,
      bank_account_name: bankDetails?.accountName || null,
      bank_account_number: bankDetails?.accountNumber || null,
      ifsc_code: bankDetails?.ifsc || null,
      pan_number: bankDetails?.pan || null,
      gstin: bankDetails?.gstin || null,
      terms_accepted: true,
      declaration_accepted: true,
      verification_status: 'pending',
      user_id: newUser.user_id
    };

    // Validate bank details if provided
    if (bankDetails) {
      if (bankDetails.pan && !validatePAN(bankDetails.pan)) {
        return ResponseHandler.badRequest(res, 'Invalid PAN format');
      }
      if (bankDetails.ifsc && !validateIFSC(bankDetails.ifsc)) {
        return ResponseHandler.badRequest(res, 'Invalid IFSC format');
      }
      if (bankDetails.gstin && !validateGSTIN(bankDetails.gstin)) {
        return ResponseHandler.badRequest(res, 'Invalid GSTIN format');
      }
    }

    console.log('Creating clinic with data:', JSON.stringify(clinicData, null, 2));

    const newClinic = await Clinic.create(clinicData);

    // Insert multi-value data
    if (services) await Clinic.insertServices(newClinic.id, services);
    if (facilities) await Clinic.insertFacilities(newClinic.id, facilities);
    if (paymentModes) await Clinic.insertPaymentModes(newClinic.id, paymentModes);
    if (bookingModes) await Clinic.insertBookingModes(newClinic.id, bookingModes);

    // Store uploaded documents in Supabase and save URL in database
    // Frontend sends: registration, license, idProof, gst
    const documentFieldMap = {
      'registration': 'registrationDocument',
      'license': 'licenseDocument', 
      'idProof': 'idProof',
      'gst': 'gstCertificate'
    };
    
    for (const [fieldName, mappedName] of Object.entries(documentFieldMap)) {
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        
        console.log(`Processing uploaded file: ${fieldName}`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        
        // Upload to Supabase
        const uploadResult = await uploadToSupabase(
          file.buffer,
          file.originalname,
          'clinic/documents'
        );

        if (uploadResult.success) {
          console.log(`✅ ${fieldName} uploaded successfully:`, uploadResult.url);
          
          // Save to clinic_document table
          await prisma.clinic_document.create({
            data: {
              clinic_id: newClinic.id,
              document_type: mappedName,
              file_url: uploadResult.url,
              mime_type: file.mimetype,
              file_size: file.size,
              file_name: file.originalname
            }
          });
          console.log(`✅ ${fieldName} saved to database`);
        } else {
          console.error(`❌ Failed to upload ${fieldName} to Supabase:`, uploadResult.error);
        }
      }
    }

    // Mirror financial data to verification_details
    await prisma.verification_details.create({
      data: {
        clinic_id: newClinic.id,
        account_name: bankDetails?.accountName || '',
        account_number: bankDetails?.accountNumber || '',
        ifsc_code: bankDetails?.ifsc || '',
        pan_number: bankDetails?.pan || '',
        gstin: bankDetails?.gstin || '',
        verification_type: 'CLINIC'
      }
    });

    // Create token
    const token = jwt.sign(
      { id: newUser.user_id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: newUser.user_id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role.toLowerCase()
    };

    ResponseHandler.success(res, { token, user: userResponse, clinic: newClinic }, 'Clinic registration successful');
  } catch (error) {
    console.error('Clinic registration error:', error);
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return ResponseHandler.badRequest(res, 'Email and OTP are required');
    }

    // For demo, accept OTP 123456
    if (otp === '123456') {
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return ResponseHandler.badRequest(res, 'User not found');
      }

      // Create token
      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      const userResponse = {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role.toLowerCase()
      };

      res.status(200).json({ token, user: userResponse });
    } else {
      return ResponseHandler.badRequest(res, 'Invalid OTP');
    }
  } catch (error) {
    next(error);
  }
};
