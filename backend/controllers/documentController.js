const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const Patient = require('../models/patientModel');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseStorage');

async function getPatientId(req) {
    if (req.user.patient_id) return req.user.patient_id;

    const userId = req.user.user_id;
    let patient = await prisma.patients.findFirst({ where: { user_id: userId } });
    if (!patient && req.user.email) {
        patient = await prisma.patients.findFirst({ where: { email: req.user.email } });
    }
    return patient ? patient.patient_id : null;
}

// Upload document - stores file in Supabase and URL in database
exports.uploadDocument = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        if (!req.file) {
            return ResponseHandler.badRequest(res, 'No file uploaded');
        }

        const { document_type } = req.body;
        
        // Upload to Supabase storage
        const uploadResult = await uploadToSupabase(
            req.file.buffer,
            req.file.originalname,
            'patients/documents'
        );

        if (!uploadResult.success) {
            console.error('Supabase upload failed:', uploadResult.error);
            return ResponseHandler.serverError(res, 'Failed to upload file to storage');
        }

        // Store file URL in database
        const document = await prisma.patient_documents.create({
            data: {
                patient_id,
                document_type: document_type || 'Other',
                file_url: uploadResult.url,
                mime_type: req.file.mimetype,
                file_size: req.file.size,
                file_name: req.file.originalname
            }
        });

        ResponseHandler.created(res, {
            id: document.id,
            file_name: document.file_name,
            file_url: document.file_url,
            document_type: document.document_type,
            mime_type: document.mime_type,
            file_size: document.file_size,
            uploaded_at: document.uploaded_at
        }, 'Document uploaded successfully');
    } catch (error) {
        next(error);
    }
};

// Get all documents for the authenticated patient - return file_url
exports.getMyDocuments = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        // Return metadata including file_url
        const documents = await prisma.patient_documents.findMany({
            where: { patient_id },
            select: {
                id: true,
                file_name: true,
                file_url: true,
                document_type: true,
                mime_type: true,
                file_size: true,
                uploaded_at: true
            },
            orderBy: { uploaded_at: 'desc' }
        });

        ResponseHandler.success(res, documents, 'Documents retrieved successfully');
    } catch (error) {
        next(error);
    }
};

// View a document - redirect to Supabase URL
exports.getDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);
        
        const document = await prisma.patient_documents.findFirst({
            where: { 
                id: parseInt(id),
                patient_id: patient_id
            }
        });

        if (!document || !document.file_url) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Redirect to the Supabase URL
        res.redirect(document.file_url);
    } catch (error) {
        next(error);
    }
};

// Download document - redirect to Supabase URL for download
exports.downloadDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);
        
        const document = await prisma.patient_documents.findFirst({
            where: { 
                id: parseInt(id),
                patient_id: patient_id
            }
        });

        if (!document || !document.file_url) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Redirect to Supabase URL with download disposition
        res.redirect(document.file_url);
    } catch (error) {
        next(error);
    }
};

// Delete a document
exports.deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);

        const doc = await prisma.patient_documents.findUnique({ where: { id: parseInt(id) } });
        if (!doc || doc.patient_id !== patient_id) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Delete from Supabase if file_url exists
        if (doc.file_url) {
            await deleteFromSupabase(doc.file_url);
        }

        await prisma.patient_documents.delete({ where: { id: parseInt(id) } });

        ResponseHandler.success(res, null, 'Document deleted');
    } catch (error) {
        next(error);
    }
};

