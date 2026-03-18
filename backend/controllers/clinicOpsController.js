const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

// Requirement 8: Prescription & Medical Records
exports.getPrescriptions = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const prescriptions = await prisma.prescriptions.findMany({
            where: { clinic_id: clinicId },
            include: { doctor: true, patient: true, medicines: true, lab_tests: true }
        });

        ResponseHandler.success(res, prescriptions, 'Medical records decrypted and retrieved');
    } catch (error) {
        next(error);
    }
};

// Requirement 9: Lab & Diagnostics
exports.getLabs = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const labs = await prisma.lab_test_types.findMany({
            where: { clinic_id: clinicId }
        });
        ResponseHandler.success(res, labs, 'Diagnostic protocols retrieved');
    } catch (error) {
        next(error);
    }
};

exports.addLab = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { test_name, price, tat_hours } = req.body;

        const newLab = await prisma.lab_test_types.create({
            data: {
                clinic_id: clinicId,
                test_name,
                price,
                tat_hours
            }
        });

        ResponseHandler.created(res, newLab, 'Diagnostic node established');
    } catch (error) {
        next(error);
    }
};

exports.getLabOrders = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const orders = await prisma.lab_orders.findMany({
            where: { clinic_id: clinicId },
            include: {
                patient: true,
                doctor: true,
                lab_test_types: true,
                lab_test_results: true
            },
            orderBy: { order_date: 'desc' }
        });
        ResponseHandler.success(res, orders, 'Lab orders synchronized');
    } catch (error) {
        next(error);
    }
};

exports.createLabOrder = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { patient_id, doctor_id, test_type_id, priority, notes } = req.body;

        const labOrderId = `LAB-${Date.now()}`;

        // Fetch test type for price
        const testType = await prisma.lab_test_types.findUnique({
            where: { test_type_id: parseInt(test_type_id) }
        });

        const newOrder = await prisma.lab_orders.create({
            data: {
                lab_order_id: labOrderId,
                patient_id,
                doctor_id: parseInt(doctor_id),
                test_type_id: parseInt(test_type_id),
                priority: priority || 'Normal',
                notes,
                clinic_id: clinicId,
                status: 'pending',
                price: testType?.price || 0
            }
        });

        ResponseHandler.created(res, newOrder, 'Lab order protocol initiated');
    } catch (error) {
        next(error);
    }
};

// Requirement 10: Billing & Payments
exports.getBilling = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const invoices = await prisma.invoices.findMany({
            where: { clinic_id: clinicId },
            include: {
                patient: true,
                appointments: { include: { doctor: true } },
                invoice_items: true,
                invoice_payments: true
            },
            orderBy: { invoice_date: 'desc' }
        });
        ResponseHandler.success(res, invoices, 'Financial ledger synchronized');
    } catch (error) {
        next(error);
    }
};

exports.searchBillingPatients = async (req, res, next) => {
    try {
        const { query } = req.query;
        const clinicId = req.user.clinic_id;

        if (!query) {
            return ResponseHandler.badRequest(res, 'Search query is required');
        }

        // Search for patients by email or phone
        const emailMatches = await prisma.emails.findMany({
            where: { email: { contains: query } },
            select: { user_id: true }
        });

        const phoneMatches = await prisma.contact_numbers.findMany({
            where: { phone_number: { contains: query } },
            select: { user_id: true }
        });

        const userIds = new Set([
            ...emailMatches.map(e => e.user_id),
            ...phoneMatches.map(p => p.user_id)
        ].filter(Boolean));

        const patients = await prisma.patients.findMany({
            where: {
                OR: [
                    { user_id: { in: Array.from(userIds) } },
                    { full_name: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                users: {
                    include: {
                        emails: true,
                        contact_numbers: true
                    }
                }
            }
        });

        // For each patient, get their latest prescription from THIS clinic
        const results = await Promise.all(patients.map(async (p) => {
            const latestPrescription = await prisma.prescriptions.findFirst({
                where: {
                    patient_id: p.patient_id,
                    clinic_id: clinicId
                },
                orderBy: { created_at: 'desc' },
                include: {
                    doctor: true,
                    medicines: { include: { medicines: true } },
                    lab_tests: { include: { lab_test_types: true } }
                }
            });

            return {
                patient_id: p.patient_id,
                full_name: p.full_name,
                email: p.users?.emails?.[0]?.email,
                phone: p.users?.contact_numbers?.[0]?.phone_number,
                latest_prescription: latestPrescription
            };
        }));

        ResponseHandler.success(res, results, 'Billing patients retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createInvoice = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { patient_id, appointment_id, services, discount, payment_mode, paid_amount } = req.body;

        const invoiceId = `INV-${Date.now()}`;
        const totalAmount = services.reduce((sum, s) => sum + (parseFloat(s.rate) * parseInt(s.quantity)), 0);

        const newInvoice = await prisma.invoices.create({
            data: {
                invoice_id: invoiceId,
                patient_id,
                appointment_id,
                clinic_id: clinicId,
                total_amount: totalAmount,
                discount: parseFloat(discount) || 0,
                status: (parseFloat(paid_amount) >= (totalAmount - (parseFloat(discount) || 0))) ? 'paid' : (parseFloat(paid_amount) > 0 ? 'partial' : 'pending'),
                invoice_items: {
                    create: services.map(s => ({
                        service_name: s.name,
                        quantity: parseInt(s.quantity),
                        rate: parseFloat(s.rate),
                        amount: parseFloat(s.rate) * parseInt(s.quantity)
                    }))
                }
            }
        });

        if (parseFloat(paid_amount) > 0) {
            await prisma.invoice_payments.create({
                data: {
                    invoice_id: invoiceId,
                    payment_mode: payment_mode || 'cash',
                    paid_amount: parseFloat(paid_amount)
                }
            });
        }

        ResponseHandler.created(res, newInvoice, 'Invoice generated and recorded');
    } catch (error) {
        next(error);
    }
};

exports.updateInvoiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, payment_mode, paid_amount } = req.body;

        if (paid_amount > 0) {
            await prisma.invoice_payments.create({
                data: {
                    invoice_id: id,
                    payment_mode: payment_mode || 'cash',
                    paid_amount: parseFloat(paid_amount)
                }
            });
        }

        const updated = await prisma.invoices.update({
            where: { invoice_id: id },
            data: { status }
        });

        ResponseHandler.success(res, updated, 'Payment records updated');
    } catch (error) {
        next(error);
    }
};

// Requirement 11: Pharmacy & Inventory
exports.getMedicines = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const medicines = await prisma.medicines.findMany({
            where: { clinic_id: clinicId }
        });
        ResponseHandler.success(res, medicines, 'Inventory scanning complete');
    } catch (error) {
        next(error);
    }
};

exports.addMedicine = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const {
            medicine_id,
            medicine_name,
            category,
            manufacturer,
            batch_number,
            expiry_date,
            stock_quantity,
            min_stock,
            purchase_price,
            mrp,
            storage_location
        } = req.body;

        const newMedicine = await prisma.medicines.create({
            data: {
                medicine_id: medicine_id || `MED-${Date.now()}`,
                medicine_name,
                category,
                manufacturer: manufacturer || null,
                batch_number: batch_number || null,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
                stock_quantity: parseInt(stock_quantity) || 0,
                min_stock: min_stock ? parseInt(min_stock) : null,
                purchase_price: purchase_price ? parseFloat(purchase_price) : null,
                mrp: mrp ? parseFloat(mrp) : null,
                storage_location: storage_location || null,
                clinic_id: clinicId
            }
        });

        ResponseHandler.created(res, newMedicine, 'Medicine added to inventory');
    } catch (error) {
        next(error);
    }
};
exports.getNotifications = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;

        // Requirement 13: Notifications
        // Fetch notifications for this clinic. Since notifications table doesn't have clinic_id,
        // we might check notifications linked to this clinic's user_id or specific categories.
        // For now, let's fetch system-wide notifications that might be relevant or 
        // filter by a custom logic if we had a mapping.

        // BETTER: Fetch notifications where the recipient contact matches clinic email/mobile
        const clinic = await prisma.clinics.findUnique({ where: { id: clinicId } });

        const notifications = await prisma.notifications.findMany({
            where: {
                recipients: {
                    some: {
                        OR: [
                            { recipient_contact: clinic.email },
                            { recipient_contact: clinic.mobile }
                        ]
                    }
                }
            },
            include: { recipients: true },
            orderBy: { created_at: 'desc' }
        });

        ResponseHandler.success(res, notifications, 'Neural notification stream synchronized');
    } catch (error) {
        next(error);
    }
};
