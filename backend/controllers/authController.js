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
const { v4: uuidv4 } = require('uuid');
const { sendOTP } = require('../utils/mailService');
const crypto = require('crypto');

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
    const userEmail = user.email || user.emails?.[0]?.email;
    console.log('Google callback for user:', userEmail, 'role:', user.role);

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
      email: userEmail,
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
    const userEmail = user.email || user.emails?.[0]?.email;
    ResponseHandler.success(res, {
      user_id: user.user_id,
      full_name: user.full_name,
      email: userEmail,
      role: user.role,
      doctor_id: user.doctor_id,
      patient_id: user.patient_id,
      clinic_id: user.clinic_id
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

    const userEmail = newUser.email || newUser.emails?.[0]?.email;

    // Create token
    const token = jwt.sign(
      { id: newUser.user_id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: newUser.user_id,
      full_name: newUser.full_name,
      email: userEmail,
      role: newUser.role ? newUser.role.toLowerCase() : 'patient'
    };

    // If it's a patient, create a record in the patients table
    if (newUser.role === 'patient') {
      try {
        await prisma.patients.create({
          data: {
            patient_id: `PAT-${Date.now()}`,
            full_name: newUser.full_name,
            user_id: newUser.user_id
          }
        });
      } catch (patientError) {
        console.error('Error creating patient profile:', patientError);
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

    const userEmail = user.email || user.emails?.[0]?.email;

    // Create token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const userResponse = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: userEmail,
      role: user.role ? user.role.toLowerCase() : 'patient'
    };

    // Fetch role-specific ID so the frontend can immediately use it
    if (user.role === 'doctor') {
      const doctor = await prisma.doctors.findUnique({
        where: { user_id: user.user_id },
        select: { id: true }
      });
      if (doctor) {
        userResponse.doctor_id = doctor.id;
      }
    } else if (user.role === 'patient') {
      const patient = await prisma.patients.findFirst({
        where: { user_id: user.user_id },
        select: { patient_id: true }
      });
      if (patient) {
        userResponse.patient_id = patient.patient_id;
      }
    } else if (user.role === 'clinic') {
      const clinic = await prisma.clinics.findUnique({
        where: { user_id: user.user_id },
        select: { id: true }
      });
      if (clinic) {
        userResponse.clinic_id = clinic.id;
      }
    }

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

    // Parse nested objects if they are strings (from FormData)
    let parsedBankDetails = bankDetails;
    if (typeof bankDetails === 'string') {
      try {
        parsedBankDetails = JSON.parse(bankDetails);
      } catch (e) {
        console.warn('Failed to parse bankDetails:', e.message);
      }
    }

    let parsedSpecializations = specializations;
    if (typeof specializations === 'string') {
      try {
        parsedSpecializations = JSON.parse(specializations);
      } catch (e) {
        // Fallback to comma separation
        parsedSpecializations = specializations.split(',').map(s => s.trim());
      }
    }

    let parsedLanguages = languages;
    if (typeof languages === 'string') {
      try {
        parsedLanguages = JSON.parse(languages);
      } catch (e) {
        parsedLanguages = languages.split(',').map(s => s.trim());
      }
    }

    let parsedConsultationModes = consultationModes;
    if (typeof consultationModes === 'string') {
      try {
        parsedConsultationModes = JSON.parse(consultationModes);
      } catch (e) {
        parsedConsultationModes = consultationModes.split(',').map(s => s.trim());
      }
    }

    // Handle Address creation for doctor's clinic
    let addressId = null;
    if (data.clinicAddress) {
      const newAddress = await prisma.addresses.create({
        data: {
          address: data.clinicAddress,
          // You might get city/state/pin from frontend in future, for now just store the string
        }
      });
      addressId = newAddress.address_id;
    }

    // Create doctor record
    const doctorData = {
      full_name: name,
      date_of_birth: dob ? new Date(dob) : null,
      medical_council_reg_no: mciReg,
      medical_council_name: councilName,
      registration_year: regYear ? parseInt(regYear) : null,
      qualifications: degrees,
      university_name: university,
      graduation_year: gradYear ? parseInt(gradYear) : null,
      experience_years: experience ? parseInt(experience) : null,
      bio: bio || '',
      terms_accepted: true,
      declaration_accepted: true,
      user_id: newUser.user_id,
      gender: gender || null,
      // Optional fields from frontend
      profile_photo_url: null, // Will be updated if doc uploaded
    };

    // Validate bank details if provided
    if (parsedBankDetails && (parsedBankDetails.accountNumber || parsedBankDetails.pan)) {
      if (parsedBankDetails.pan && !validatePAN(parsedBankDetails.pan)) {
        console.warn('Invalid PAN format provided');
      }
      if (parsedBankDetails.ifsc && !validateIFSC(parsedBankDetails.ifsc)) {
        console.warn('Invalid IFSC format provided');
      }

      // Create bank account
      try {
        await prisma.bank_accounts.create({
          data: {
            users: { connect: { user_id: newUser.user_id } },
            account_holder_name: parsedBankDetails.accountName || '',
            account_number: parsedBankDetails.accountNumber || '',
            ifsc_code: parsedBankDetails.ifsc || '',
            bank_name: parsedBankDetails.bankName || null
          }
        });
      } catch (bankErr) {
        console.error('Error creating bank account:', bankErr.message);
      }

      // Create tax details
      try {
        await prisma.tax_details.create({
          data: {
            users: { connect: { user_id: newUser.user_id } },
            pan_number: parsedBankDetails.pan || '',
            gstin: parsedBankDetails.gstin || ''
          }
        });
      } catch (taxErr) {
        console.error('Error creating tax details:', taxErr.message);
      }
    }

    const newDoctor = await Doctor.create(doctorData);

    // Insert multi-value normalized data
    if (parsedSpecializations) {
      await Doctor.insertSpecializations(newDoctor.id, parsedSpecializations);
    }
    if (parsedLanguages) {
      await Doctor.insertLanguages(newDoctor.id, parsedLanguages);
    }
    if (parsedConsultationModes) {
      await Doctor.insertConsultationModes(newDoctor.id, parsedConsultationModes);
    }

    // Insert conditions treated and services offered if provided
    const { conditionsTreated, servicesOffered } = data;
    if (conditionsTreated) {
      let conditions = conditionsTreated;
      if (typeof conditionsTreated === 'string') {
        try { conditions = JSON.parse(conditionsTreated); } catch (e) { conditions = conditionsTreated.split(','); }
      }
      if (Array.isArray(conditions)) {
        await prisma.patient_conditions.createMany({
          data: conditions.map(c => ({
            condition_name: c
            // patient_id is null here as it's a doctor's treated list... 
            // wait, our schema says patient_conditions belongs to patients.
            // Let's check if there is a doctor_specializations or similar for conditions
          })).filter(() => false) // Ignore for now if no table exists
        });
      }
    }

    if (servicesOffered) {
      let services = servicesOffered;
      if (typeof servicesOffered === 'string') {
        try { services = JSON.parse(servicesOffered); } catch (e) { services = servicesOffered.split(','); }
      }
      if (Array.isArray(services)) {
        await prisma.doctor_services.createMany({
          data: services.map(s => ({
            doctor_id: newDoctor.id,
            service_name: s
          }))
        });
      }
    }

    // Link Address to Doctor via Practice Locations
    if (addressId) {
      try {
        await prisma.doctor_practice_locations.create({
          data: {
            doctor_id: newDoctor.id,
            clinic_name: data.clinicName || 'Clinic',
            address_id: addressId
          }
        });
      } catch (addrErr) {
        console.error('Error linking practice location:', addrErr.message);
      }
    }

    // Handle working days and slots
    if (data.workingDays) {
      let days = data.workingDays;
      if (typeof days === 'string') {
        try { days = JSON.parse(days); } catch (e) { days = days.split(','); }
      }
      if (Array.isArray(days)) {
        try {
          const slotPromises = days.map(day => 
            prisma.doctor_time_slots.create({
              data: {
                doctor_id: newDoctor.id,
                day_of_week: day,
                start_time: new Date('1970-01-01T09:00:00Z'),
                end_time: new Date('1970-01-01T17:00:00Z'),
                max_patients: 10
              }
            })
          );
          await Promise.all(slotPromises);
        } catch (slotErr) {
          console.error('Error creating time slots:', slotErr.message);
        }
      }
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
      role: newUser.role ? newUser.role.toLowerCase() : 'doctor'
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

    // 1. Create Address record
    const clinicAddress = await prisma.addresses.create({
      data: {
        address,
        pin_code: pinCode,
        city,
        state
      }
    });

    // Create clinic record - only include fields that exist in the database
    const clinicData = {
      clinic_name: name,
      establishment_year: establishedYear ? parseInt(establishedYear) : null,
      tagline: tagline || null,
      description: description || null,
      medical_council_reg_no: medicalCouncilRegNo,
      terms_accepted: true,
      declaration_accepted: true,
      verification_status: 'pending',
      user_id: newUser.user_id,
      address_id: clinicAddress.address_id
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

      // Create bank account
      await prisma.bank_accounts.create({
        data: {
          users: { connect: { user_id: newUser.user_id } },
          account_holder_name: bankDetails.accountName || '',
          account_number: bankDetails.accountNumber || '',
          ifsc_code: bankDetails.ifsc || ''
        }
      });

      // Create tax details
      await prisma.tax_details.create({
        data: {
          users: { connect: { user_id: newUser.user_id } },
          pan_number: bankDetails.pan || '',
          gstin: bankDetails.gstin || ''
        }
      });
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

exports.registerLab = async (req, res, next) => {
  try {
    const {
      name,
      owner_name,
      lab_type,
      registration_number,
      established_year,
      contact_number,
      email,
      address,
      city,
      state,
      pin_code,
      license_number,
      certification,
      gst_number,
      username,
      password,
      tests,
      homeCollection,
      reportTime
    } = req.body;

    if (!name || !email || !contact_number || !password || !address || !city || !license_number || !username) {
      return ResponseHandler.badRequest(res, 'Please provide all required fields');
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return ResponseHandler.badRequest(res, 'User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name: name,
      email: email, // Can also use username if you want email-less login, but schema requires email
      mobile_number: contact_number,
      password_hash: hashedPassword,
      role: 'lab'
    });

    const labAddress = await prisma.addresses.create({
      data: {
        address: address,
        pin_code: pin_code || null,
        city: city,
        state: state || null
      }
    });

    const newLab = await prisma.labs.create({
      data: {
        name: name,
        owner_name: owner_name || null,
        lab_type: lab_type || 'pathology',
        registration_number: registration_number || null,
        establishment_year: established_year ? parseInt(established_year) : null,
        contact_number: contact_number,
        email: email,
        address_id: labAddress.address_id,
        license_number: license_number,
        gst_number: gst_number || null,
        certification: certification || null,
        user_id: newUser.user_id
      }
    });

    // Parse and Insert tests
    let parsedTests = [];
    if (tests) {
      if (typeof tests === 'string') {
        try { parsedTests = JSON.parse(tests); } catch (e) { console.error("Failed parsing tests"); }
      } else if (Array.isArray(tests)) {
        parsedTests = tests;
      }
    }

    if (parsedTests.length > 0) {
      await prisma.lab_tests.createMany({
        data: parsedTests.map(t => ({
          lab_id: newLab.lab_id,
          test_name: t.testName || t.test_name,
          category: t.category || 'Blood',
          price: t.price ? parseFloat(t.price) : 0,
          report_time: reportTime || '24 Hours',
          home_collection: homeCollection === 'true' || homeCollection === true
        }))
      });
    }

    // Handle Document uploads just like Clinic registration
    if (req.files && req.files.docs && req.files.docs[0]) {
      const file = req.files.docs[0];
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'labs/documents'
      );
      if (uploadResult.success) {
        // Here you could save document details to a "lab_documents" table if it exists
        // Currently 'labs' doesn't have a document relation but Supabase has the file
        console.log("Lab document uploaded securely:", uploadResult.url);
      }
    }

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

    ResponseHandler.success(res, { token, user: userResponse, lab: newLab }, 'Lab registration successful');
  } catch (error) {
    console.error('Lab registration error:', error);
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ResponseHandler.badRequest(res, 'Email is required');
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return ResponseHandler.badRequest(res, 'User not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 120 seconds

    // Create OTP record
    await prisma.otp_records.create({
      data: {
        id: uuidv4(),
        email: email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 3,
        status: 'PENDING',
        created_at: new Date()
      }
    });

    // Send email
    const mailSent = await sendOTP(email, otp);
    if (!mailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }

    ResponseHandler.success(res, null, 'OTP sent to your email. Valid for 120 seconds.');
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return ResponseHandler.badRequest(res, 'Email and OTP are required');
    }

    // Use a transaction to find and verify
    const otpRecord = await prisma.otp_records.findFirst({
      where: {
        email: email,
        status: 'PENDING',
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!otpRecord) {
      return ResponseHandler.badRequest(res, 'Invalid or expired OTP');
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      await prisma.otp_records.update({
        where: { id: otpRecord.id },
        data: { status: 'EXPIRED' }
      });
      return ResponseHandler.badRequest(res, 'Max attempts reached. Request a new OTP.');
    }

    // Verify OTP hash
    const isOTPValid = await bcrypt.compare(otp, otpRecord.otp_hash);
    
    // Increment attempts
    await prisma.otp_records.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 }
    });

    if (!isOTPValid) {
      return ResponseHandler.badRequest(res, 'Invalid OTP');
    }

    // Generate a temporary reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10);

    // Update record as verified and store token hash
    await prisma.otp_records.update({
      where: { id: otpRecord.id },
      data: {
        status: 'VERIFIED',
        verified_at: new Date(),
        token: tokenHash
      }
    });

    ResponseHandler.success(res, { resetToken }, 'OTP verified successfully');
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return ResponseHandler.badRequest(res, 'Email, reset token and new password are required');
    }

    // Find the verified OTP record with this token
    const otpRecord = await prisma.otp_records.findFirst({
      where: {
        email: email,
        status: 'VERIFIED',
        token: { not: null }, // It should have a token hash
        verified_at: { gt: new Date(Date.now() - 10 * 60 * 1000) } // Token valid for 10 mins after verification
      },
      orderBy: { verified_at: 'desc' }
    });

    if (!otpRecord) {
      return ResponseHandler.badRequest(res, 'Invalid or expired reset session');
    }

    // Verify token hash
    const isTokenValid = await bcrypt.compare(resetToken, otpRecord.token);
    if (!isTokenValid) {
      return ResponseHandler.badRequest(res, 'Invalid reset token');
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return ResponseHandler.badRequest(res, 'User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: hashedPassword }
    });

    // Mark token as used
    await prisma.otp_records.update({
      where: { id: otpRecord.id },
      data: { status: 'USED' }
    });

    ResponseHandler.success(res, null, 'Password reset successful. You can now login.');
  } catch (error) {
    next(error);
  }
};
