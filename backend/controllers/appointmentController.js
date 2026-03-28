const Appointment = require('../models/appointmentModel');
const ResponseHandler = require('../utils/responseHandler');

exports.getPatientAppointments = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found in session');
        }
        const appointments = await Appointment.findByPatient(patientId);
        ResponseHandler.success(res, appointments, 'Patient appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingPatientAppointments = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found in session');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointments = await Appointment.findUpcomingByPatient(patientId, today);
        ResponseHandler.success(res, appointments, 'Upcoming patient appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_date } = req.body;

        if (!patient_id || !doctor_id || !appointment_date) {
            return ResponseHandler.badRequest(res, 'Missing required parameters for appointment');
        }

        // Generate unique appointment ID
        const generateAppointmentID = () => {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const random = String(Math.floor(Math.random() * 9000) + 1000);
            return `APT-${year}${month}${day}-${hours}${minutes}-${random}`;
        };

        const appointment_id = generateAppointmentID();

        // Parse the appointment_date string to Date object for Prisma (treat as UTC date at midnight)
        const [year, month, day] = appointment_date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed in Date constructor

        // Handle appointment_time - convert to full ISO-8601 datetime string for Prisma
        let appointmentTime = req.body.appointment_time;
        console.log('DEBUG: Raw appointment_time:', appointmentTime, 'Type:', typeof appointmentTime);

        let timeForValidation = appointmentTime;
        if (appointmentTime) {
            // If time is like "15:30:00", convert to full datetime string
            // Force conversion for any time-like string
            if (appointmentTime.includes(':')) {
                // Extract hours:minutes:seconds
                const parts = appointmentTime.split(':');
                const hours = parts[0]?.padStart(2, '0') || '00';
                const minutes = parts[1]?.padStart(2, '0') || '00';
                const seconds = parts[2]?.padStart(2, '0') || '00';

                timeForValidation = `${hours}:${minutes}:${seconds}`;
                appointmentTime = `1970-01-01T${hours}:${minutes}:${seconds}.000Z`;
                console.log('DEBUG: Converted appointment_time:', appointmentTime);
            }
        }

        // 1. Time Slot Validation: Minimum 1 hour after current time
        const now = new Date();
        const selectedDateTime = new Date(utcDate);
        if (timeForValidation) {
            const [h, m, s] = timeForValidation.split(':').map(Number);
            selectedDateTime.setUTCHours(h, m, s || 0, 0);
        }

        const allowedBookingTime = new Date(now.getTime() + 60 * 60 * 1000);
        if (selectedDateTime < allowedBookingTime) {
            return ResponseHandler.badRequest(res, 'Appointment must be booked at least 1 hour in advance');
        }

        // 2. Check for Conflicts (Doctor or Patient already booked at this time)
        const conflict = await Appointment.findConflictingAppointment(doctor_id, patient_id, appointment_date, req.body.appointment_time);
        if (conflict) {
            const isDoctorConflict = conflict.doctor_id === Number(doctor_id);
            const message = isDoctorConflict 
                ? 'This slot is already booked for the doctor. Please choose another time.' 
                : 'You already have another appointment booked at this time. Please choose another time.';
            return ResponseHandler.badRequest(res, message);
        }

        const appointmentData = {
            appointment_id,
            patient_id: req.body.patient_id,
            doctor_id: parseInt(req.body.doctor_id),
            appointment_date: utcDate,
            appointment_time: appointmentTime,
            appointment_type: req.body.type,
            mode: req.body.mode,
            status: req.body.status || 'scheduled',
            consult_duration: req.body.consult_duration || 30,
            earnings: req.body.earnings || 500,
            reason_for_visit: req.body.reason_for_visit || null
        };

        const newAppointment = await Appointment.create(appointmentData);
        ResponseHandler.created(res, newAppointment, 'Appointment created successfully');
    } catch (error) {
        console.error('Error in createAppointment:', error);
        next(error);
    }
};

exports.getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.findAll();
        ResponseHandler.success(res, appointments, 'Scheduled encounters retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return ResponseHandler.notFound(res, 'Encounter coordinates not found');
        }
        ResponseHandler.success(res, appointment, 'Rendezvous details accessed');
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID is required');
        }

        const appointments = await Appointment.findByPatient(patientId);

        ResponseHandler.success(res, appointments, 'Patient appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingAppointments = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID is required');
        }

        // Get today's date at start of day in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.findUpcomingByPatient(patientId, today);

        const response = {
            count: appointments.length,
            appointments: appointments
        };

        ResponseHandler.success(res, response, 'Upcoming appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getDoctorAppointments = async (req, res, next) => {
    try {
        const doctor_id = req.user.doctor_id || req.query.doctor_id;
        if (!doctor_id) {
            return ResponseHandler.badRequest(res, 'Doctor ID is required');
        }

        // Data isolation: ensure doctor can only see their own appointments
        if (req.user.role === 'doctor' && req.user.doctor_id && req.user.doctor_id.toString() !== doctor_id.toString()) {
            return ResponseHandler.forbidden(res, 'Access denied to other doctor\'s appointments');
        }

        const filters = {
            doctor_id,
            type: req.query.type, // 'all', 'in-clinic', 'online'
            dateFilter: req.query.dateFilter, // 'today', 'yesterday', 'tomorrow', 'custom'
            from: req.query.from,
            to: req.query.to
        };

        const appointments = await Appointment.findDoctorAppointments(filters);
        ResponseHandler.success(res, appointments, 'Doctor appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.startAppointment = async (req, res, next) => {
    try {
        const { appointment_id } = req.body;
        if (!appointment_id) return ResponseHandler.badRequest(res, 'Appointment ID required');

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) return ResponseHandler.notFound(res, 'Appointment not found');

        // Check if doctor owns this appointment
        if (appointment.doctor_id.toString() !== req.user.doctor_id.toString()) {
            return ResponseHandler.forbidden(res, 'You are not authorized to start this appointment');
        }

        const updated = await Appointment.updateStatus(appointment_id, 'in_progress');
        ResponseHandler.success(res, updated, 'Appointment started');
    } catch (error) {
        next(error);
    }
};

exports.updateStatusFromPost = async (req, res, next) => {
    try {
        const { appointment_id, status } = req.body;
        if (!appointment_id || !status) return ResponseHandler.badRequest(res, 'Appointment ID and status required');

        const updated = await Appointment.updateStatus(appointment_id, status);
        ResponseHandler.updated(res, updated, 'Appointment status updated');
    } catch (error) {
        next(error);
    }
};

exports.rescheduleAppointment = async (req, res, next) => {
    try {
        const { appointment_id, appointment_date, appointment_time } = req.body;
        console.log('RESCHEDULE REQUEST:', { appointment_id, appointment_date, appointment_time });
        
        if (!appointment_id || !appointment_date || !appointment_time) {
            return ResponseHandler.badRequest(res, 'Missing reschedule parameters');
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            return ResponseHandler.notFound(res, 'Appointment not found');
        }

        // Standardize date and time for comparison and storage
        const [year, month, day] = appointment_date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        
        let formattedTime = appointment_time;
        if (appointment_time.includes('AM') || appointment_time.includes('PM')) {
            const [time, modifier] = appointment_time.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }

        console.log('FORMATTED FOR DB:', { utcDate, formattedTime });

        // Check for conflicts (excluding the current appointment itself)
        const conflict = await Appointment.findConflictingAppointment(appointment.doctor_id, appointment.patient_id, appointment_date, formattedTime);
        
        if (conflict && conflict.appointment_id !== appointment_id) {
            console.log('CONFLICT DETECTED:', conflict);
            const isDoctorConflict = conflict.doctor_id === Number(appointment.doctor_id);
            const message = isDoctorConflict 
                ? 'This slot is already booked for the doctor. Please choose another time.' 
                : 'You already have another appointment booked at this time. Please choose another time.';
            return ResponseHandler.badRequest(res, message);
        }

        const timeForDB = `1970-01-01T${formattedTime}.000Z`;

        const updateData = {
            appointment_date: utcDate,
            appointment_time: timeForDB,
            status: 'scheduled'
        };

        const updated = await Appointment.update(appointment_id, updateData);
        console.log('RESCHEDULE SUCCESS:', updated);
        ResponseHandler.updated(res, updated, 'Appointment rescheduled');
    } catch (error) {
        console.error('Error in rescheduleAppointment:', error);
        next(error);
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Appointment.delete(id);
        ResponseHandler.success(res, null, 'Appointment deleted');
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) return ResponseHandler.badRequest(res, 'Status update required');

        const updated = await Appointment.updateStatus(req.params.id, status);
        if (!updated) {
            return ResponseHandler.notFound(res, 'Appointment not found');
        }
        ResponseHandler.updated(res, updated, 'Appointment status updated');
    } catch (error) {
        next(error);
    }
};

exports.getBookedSlots = async (req, res, next) => {
    try {
        const { doctorId, date } = req.params;
        const { patientId } = req.query;
        if (!doctorId || !date) return ResponseHandler.badRequest(res, 'Doctor ID and date are required');

        const bookedSlots = await Appointment.getBookedSlots(doctorId, date, patientId);
        ResponseHandler.success(res, { bookedSlots }, 'Booked time slots retrieved successfully');
    } catch (error) {
        next(error);
    }
};
