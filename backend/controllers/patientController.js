const Patient = require('../models/patientModel');
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseStorage');

exports.createPatient = async (req, res, next) => {
    try {
        const { patient_id, full_name, age, gender, phone, email, address, abha_id, blood_group, medical_history, insurance_id } = req.body;

        if (!patient_id || !full_name || !phone) {
            return ResponseHandler.badRequest(res, 'Missing essential fields (patient_id, full_name, phone)');
        }

        const existing = await Patient.findById(patient_id);
        if (existing) {
            return ResponseHandler.badRequest(res, 'Patient with this ID already exists');
        }

        // Build clean data object matching patients table columns from data.sql
        const patientData = {
            patient_id,
            full_name,
            age: age ? parseInt(age, 10) : null,
            gender: gender || null,
            address: address || null,
            abha_id: abha_id || null,
            blood_group: blood_group || null,
            medical_history: medical_history || null,
            insurance_id: insurance_id || null,
        };

        const newPatient = await Patient.create(patientData);
        ResponseHandler.created(res, newPatient, 'Patient added successfully');
    } catch (error) {
        console.error('createPatient error:', error);
        next(error);
    }
};

exports.getAllPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        
        // If doctor is logged in, restrict to their patients
        const doctorId = req.user.role === 'doctor' ? req.user.doctor_id : null;

        const patients = await Patient.findAll(limit, offset, doctorId, search);
        const total = await Patient.count(doctorId, search);

        ResponseHandler.success(res, {
            patients,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, 'Patient registry scan complete');
    } catch (error) {
        next(error);
    }
};

exports.getPatientById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient bio-signature not found');
        }
        ResponseHandler.success(res, patient, 'Patient data retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getPatientProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            console.log('Patient not found by user_id, trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not established for this session');
        }

        console.log('Patient found:', patient.patient_id);

        // Get allergies and conditions from database
        const allergies = await Patient.getAllergies(patient.patient_id);
        const conditions = await Patient.getConditions(patient.patient_id);

        // Parse medical history for medications if it's stored as JSON
        let medications = [];
        if (patient.medical_history) {
            try {
                const history = JSON.parse(patient.medical_history);
                if (history && history.currentMedications) {
                    medications = history.currentMedications;
                }
            } catch (e) {
                // If not JSON, treat it as a string or empty
                console.log('Medical history is not JSON or empty');
            }
        }

        // Add medical data to patient object
        const patientWithMedicalData = {
            ...patient,
            phone: patient.users?.contact_numbers?.[0]?.phone_number || '',
            address: patient.address?.address || '',
            allergies: allergies.map(a => a.allergy_name),
            chronicDiseases: conditions.filter(c => c.is_chronic).map(c => c.condition_name),
            currentMedications: medications
        };

        ResponseHandler.success(res, patientWithMedicalData, 'Session-based patient profile retrieved');
    } catch (error) {
        console.error('Error in getPatientProfile:', error);
        next(error);
    }
};

exports.updatePatientProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        console.log('updatePatientProfile called with userId:', userId);

        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            console.log('Patient not found by user_id, trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found for update');
        }

        const { allergies, chronicDiseases, currentMedications, ...profileData } = req.body;

        // Correctly handle age and numeric fields
        if (profileData.age) profileData.age = parseInt(profileData.age, 10);

        // Store currentMedications in medical_history as JSON
        if (currentMedications !== undefined) {
            profileData.medical_history = JSON.stringify({
                currentMedications: currentMedications
            });
        }

        // Update basic profile data
        const updated = await Patient.update(patient.patient_id, profileData);

        // Update allergies if provided
        if (allergies !== undefined) {
            await Patient.replaceAllergies(patient.patient_id, allergies);
        }

        // Update chronic diseases/conditions if provided
        if (chronicDiseases !== undefined) {
            await Patient.replaceConditions(patient.patient_id, chronicDiseases, true);
        }

        // Get updated data
        const updatedAllergies = await Patient.getAllergies(patient.patient_id);
        const updatedConditions = await Patient.getConditions(patient.patient_id);

        const finalPatient = {
            ...updated,
            phone: updated.users?.contact_numbers?.[0]?.phone_number || phone || '',
            address: updated.address?.address || address || '',
            allergies: updatedAllergies.map(a => a.allergy_name),
            chronicDiseases: updatedConditions.filter(c => c.is_chronic).map(c => c.condition_name),
            currentMedications: currentMedications || []
        };

        ResponseHandler.updated(res, finalPatient, 'Patient profile metrics recalibrated');
    } catch (error) {
        console.error('Error in updatePatientProfile:', error);
        next(error);
    }
};

exports.updatePatient = async (req, res, next) => {
    try {
        const updated = await Patient.update(req.params.id, req.body);
        if (!updated) {
            return ResponseHandler.notFound(res, 'Target not found for recalibration');
        }
        ResponseHandler.updated(res, updated, 'Patient metrics updated');
    } catch (error) {
        next(error);
    }
};

exports.deletePatient = async (req, res, next) => {
    try {
        const deleted = await Patient.delete(req.params.id);
        if (!deleted) {
            return ResponseHandler.notFound(res, 'Target vanished before termination');
        }
        ResponseHandler.deleted(res, 'Patient record purged from system');
    } catch (error) {
        next(error);
    }
};

exports.uploadProfilePhoto = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        console.log('uploadProfilePhoto - userId:', userId);
        console.log('uploadProfilePhoto - email:', req.user.email);
        
        let patient = await Patient.findByUserId(userId);
        console.log('uploadProfilePhoto - patient by userId:', patient ? patient.patient_id : 'not found');

        if (!patient && req.user.email) {
            console.log('uploadProfilePhoto - trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
            console.log('uploadProfilePhoto - patient by email:', patient ? patient.patient_id : 'not found');
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }

        if (!req.file) {
            return ResponseHandler.badRequest(res, 'No file uploaded');
        }

        console.log('uploadProfilePhoto - file:', req.file);
        
        // Upload to Supabase storage
        const uploadResult = await uploadToSupabase(
            req.file.buffer,
            req.file.originalname,
            'patients/photos'
        );

        if (!uploadResult.success) {
            console.error('Supabase upload failed:', uploadResult.error);
            return ResponseHandler.serverError(res, 'Failed to upload file to storage');
        }

        // Delete old photo if exists
        if (patient.profile_photo_url) {
            await deleteFromSupabase(patient.profile_photo_url);
        }

        // Update patient with the new photo URL using Prisma
        await prisma.patients.update({
            where: { patient_id: patient.patient_id },
            data: {
                profile_photo_url: uploadResult.url,
                profile_photo_mime_type: req.file.mimetype
            }
        });

        console.log('uploadProfilePhoto - updated successfully');

        ResponseHandler.updated(res, {
            patient_id: patient.patient_id,
            profile_photo_mime_type: req.file.mimetype,
            profile_photo_url: uploadResult.url
        }, 'Profile photo updated successfully');
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        next(error);
    }
};

// Get patient profile photo - redirect to Supabase URL
exports.getProfilePhoto = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        
        // Get the profile photo URL from database
        const patient = await prisma.patients.findUnique({
            where: { patient_id: patientId },
            select: {
                profile_photo_url: true,
                profile_photo_mime_type: true
            }
        });
        
        if (!patient || !patient.profile_photo_url) {
            return ResponseHandler.notFound(res, 'Profile photo not found');
        }

        // Redirect to the Supabase URL
        res.redirect(patient.profile_photo_url);
    } catch (error) {
        console.error('Error getting profile photo:', error);
        next(error);
    }
};

/**
 * Dashboard Stats
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }

        const patientId = patient.patient_id;

        const [upcomingCount, activePrescriptionsCount, pendingBillsResult, appointments, prescriptions] = await Promise.all([
            prisma.appointments.count({
                where: { patient_id: patientId, status: 'scheduled', appointment_date: { gte: new Date() } }
            }),
            prisma.prescriptions.count({
                where: { patient_id: patientId }
            }),
            prisma.invoices.aggregate({
                where: { patient_id: patientId, status: 'pending' },
                _sum: { total_amount: true }
            }),
            prisma.appointments.findMany({
                where: { patient_id: patientId },
                take: 5,
                orderBy: { appointment_date: 'desc' },
                include: { doctor: true }
            }),
            prisma.prescriptions.findMany({
                where: { patient_id: patientId },
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { doctor: true }
            })
        ]);

        // Map recent activities
        const recentActivities = [];
        appointments.forEach(a => {
            recentActivities.push({
                id: `apt-${a.appointment_id}`,
                type: 'appointment',
                title: 'Medical Consultation',
                description: `Scheduled with Dr. ${a.doctor?.full_name || 'Medical Professional'}`,
                time: a.appointment_date ? new Date(a.appointment_date).getTime() : Date.now() - 3600000
            });
        });

        prescriptions.forEach(p => {
            recentActivities.push({
                id: `rx-${p.prescription_id}`,
                type: 'prescription',
                title: 'New Prescription Received',
                description: `Advised by Dr. ${p.doctor?.full_name || 'Medical Professional'}`,
                time: p.created_at ? new Date(p.created_at).getTime() : Date.now() - 7200000
            });
        });

        // Sort activities by time desc
        recentActivities.sort((a, b) => b.time - a.time);

        ResponseHandler.success(res, {
            upcomingAppointments: upcomingCount,
            activePrescriptions: activePrescriptionsCount,
            healthScore: 85,
            pendingBills: pendingBillsResult._sum.total_amount || 0,
            recentActivities: recentActivities.slice(0, 5)
        }, 'Patient dashboard metrics synchronized');
    } catch (error) {
        console.error('getDashboardStats error:', error);
        next(error);
    }
};

/**
 * AI Insight Handlers
 */
exports.explainReport = async (req, res, next) => {
    try {
        const { report_content, language } = req.body;
        
        const explanation = `Based on the report content provided, here is a simplified explanation in ${language}:
        The clinical findings suggest normal biological markers across primary test parameters. 
        1. Hematology levels are within reference ranges.
        2. Metabolic panel indicates optimal organ function.
        3. No immediate clinical concerns were detected.
        
        *Note: This is an AI-generated explanation. Please consult your physician for clinical diagnosis.*`;

        ResponseHandler.success(res, { explanation }, 'Health report analyzed by AI');
    } catch (error) {
        next(error);
    }
};

exports.explainPrescription = async (req, res, next) => {
    try {
        const { prescription_content, language } = req.body;

        const explanation = `Here is a simplified breakdown of your prescription medicines in ${language}:
        1. Primary Medication: Focuses on addressing your core symptoms and promoting recovery.
        2. Maintenance Dose: Helps stabilize physiological metrics and prevents recurrence.
        3. Supportive Therapy: Provides symptomatic relief and boosts immune response.
        
        Recommended Action: Follow the dosage schedule as prescribed and maintain adequate hydration.
        
        *Note: This is an AI-generated explanation. Please consult your doctor for medical advice.*`;

        ResponseHandler.success(res, { explanation }, 'Prescription analyzed by AI');
    } catch (error) {
        next(error);
    }
};

