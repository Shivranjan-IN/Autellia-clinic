/**
 * Clinic AI Controller
 * Uses Google Gemini via Genkit for all AI modules.
 * No OpenAI dependency required.
 */
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

// Lazy-load genkit ai instance to avoid TypeScript/ESM issues in CJS context
let _ai = null;
const getAI = async () => {
    if (!_ai) {
        const m = await import('../ai/genkit.ts');
        _ai = m.ai || m.default?.ai || m.default;
        console.log('AI Instance loaded, generate method type:', typeof _ai?.generate);
    }
    return _ai;
};

const gemini = async (prompt) => {
    const ai = await getAI();
    if (!ai || typeof ai.generate !== 'function') {
        throw new Error('AI instance not properly initialized or missing generate method.');
    }
    const { text } = await ai.generate({ prompt });
    return text;
};

// ─── 1. Predictive Workload Planner ─────────────────────────────────────────
exports.predictWorkload = async (req, res, next) => {
    try {
        const { clinic_id } = req.query;
        let appointments = [];
        try {
            appointments = await prisma.appointments.findMany({
                where: clinic_id ? { clinic_id: parseInt(clinic_id) } : {},
                select: { appointment_date: true, appointment_time: true, status: true },
                take: 100
            });
        } catch { /* table may not match schema exactly */ }

        const promptData = appointments.length
            ? appointments.map(a => `${a.appointment_date || ''} ${a.appointment_time || ''}`).join(', ')
            : 'No past appointments found. Assume a standard clinic with 9 AM–6 PM hours.';

        const prediction = await gemini(
            `You are an AI workload predictor for a medical clinic. Based on the following past appointment data, identify the top 3 busiest hours of the day and suggest how many staff (doctors, nurses, receptionists) to allocate for each slot. Also forecast tomorrow's expected load.\n\nPast appointment data: ${promptData}`
        );
        ResponseHandler.success(res, { prediction }, 'Workload predicted');
    } catch (error) {
        next(error);
    }
};

// ─── 2. Virtual Receptionist (Chatbot) ──────────────────────────────────────
exports.chatbot = async (req, res, next) => {
    try {
        const { message, language } = req.body;
        const lang = language === 'Hindi' ? 'Hindi' : 'English';
        const reply = await gemini(
            `You are a polite and helpful Virtual Receptionist for a medical clinic. Answer ONLY in ${lang}. Clinic hours: Monday–Saturday, 9 AM–6 PM. Specialties: General Medicine, Dental, Cardiology, Orthopedics, Pediatrics. Be concise.\n\nPatient says: "${message}"`
        );
        ResponseHandler.success(res, { reply }, 'Chatbot responded');
    } catch (error) {
        next(error);
    }
};

// ─── 3. AI Symptom Checker ───────────────────────────────────────────────────
exports.checkSymptoms = async (req, res, next) => {
    try {
        const { symptoms } = req.body;
        const analysis = await gemini(
            `You are an AI clinical assistant. Analyze these symptoms and provide:
1. Possible conditions (3–5)
2. Urgency level: Low / Medium / Emergency
3. Recommended specialist
4. Brief home advice

IMPORTANT: Add clear disclaimer that this is NOT a medical diagnosis.

Symptoms: ${symptoms}`
        );
        ResponseHandler.success(res, { analysis }, 'Symptoms analyzed');
    } catch (error) {
        next(error);
    }
};

// ─── 4. Prescription Generator ───────────────────────────────────────────────
exports.generatePrescription = async (req, res, next) => {
    try {
        const { diagnosis, patientAge, patientWeight, allergies } = req.body;
        const prescription = await gemini(
            `You are an AI assisting a licensed doctor in writing a prescription. Generate a structured suggestion.\n\nDiagnosis: ${diagnosis}\nPatient Age: ${patientAge}\nWeight: ${patientWeight} kg\nAllergies: ${allergies || 'None'}\n\nInclude: medicine name, dosage, frequency, duration, drug interaction warnings, and alternatives. Add the disclaimer: "For doctor's use only. Not for self-medication."`
        );
        ResponseHandler.success(res, { prescription }, 'Prescription generated');
    } catch (error) {
        next(error);
    }
};

// ─── 5. Health Record Summarizer ─────────────────────────────────────────────
exports.summarizeRecord = async (req, res, next) => {
    try {
        const { record_text } = req.body;
        const summary = await gemini(
            `Summarize this patient health record into:\n1. A 2–3 sentence overview\n2. Key health insights (bullet points)\n3. A timeline of major events if dates are present\n\nRecord:\n${record_text}`
        );
        ResponseHandler.success(res, { summary }, 'Record summarized');
    } catch (error) {
        next(error);
    }
};

// ─── 6. Document Scanner (AI Vision Analysis) ────────────────────────────────
// Note: Frontend now sends to /api/ai/analyze-document (Genkit) directly.
// This endpoint also works as fallback for text-only documents.
exports.scanDocument = async (req, res, next) => {
    try {
        const text = req.body?.text || '';
        const structuredData = await gemini(
            `Extract structured data from this medical document text. Return: Patient Name, Date, Diagnosis, Medicines prescribed (name + dosage + frequency), and any lab values.\n\nText:\n${text}`
        );
        ResponseHandler.success(res, { rawText: text, structuredData }, 'Document scanned');
    } catch (error) {
        next(error);
    }
};

// ─── 7. Treatment Recommendation ─────────────────────────────────────────────
exports.recommendTreatment = async (req, res, next) => {
    try {
        const { symptoms, history } = req.body;
        const recommendation = await gemini(
            `You are a clinical decision support AI. Using standard clinical guidelines, suggest treatment options.\n\nSymptoms: ${symptoms}\nPatient History: ${history || 'Not provided'}\n\nInclude: first-line treatments, lifestyle advice, red flags. End with: "Disclaimer: This is for clinical reference only. Not a replacement for a licensed doctor's judgment."`
        );
        ResponseHandler.success(res, { recommendation }, 'Treatment recommended');
    } catch (error) {
        next(error);
    }
};

// ─── 8. Feedback Sentiment Analyzer ──────────────────────────────────────────
exports.analyzeFeedback = async (req, res, next) => {
    try {
        const { feedback } = req.body;
        const raw = await gemini(
            `Analyze this patient feedback and return ONLY valid JSON (no markdown):\n{ "sentiment": "Positive"|"Neutral"|"Negative", "score": 0-100, "key_topics": [], "summary": "", "actionable_improvements": [] }\n\nFeedback: "${feedback}"`
        );
        let analysis;
        try {
            const match = raw.match(/\{[\s\S]*\}/);
            analysis = match ? JSON.parse(match[0]) : { sentiment: 'Neutral', score: 50, key_topics: [], summary: raw, actionable_improvements: [] };
        } catch {
            analysis = { sentiment: 'Neutral', score: 50, key_topics: [], summary: raw, actionable_improvements: [] };
        }
        ResponseHandler.success(res, { analysis }, 'Feedback analyzed');
    } catch (error) {
        next(error);
    }
};

// ─── 9. Face Recognition Attendance (BETA) ───────────────────────────────────
exports.markFaceAttendance = async (req, res, next) => {
    try {
        const { studentId, confidence } = req.body;
        // In production: integrate face-api.js / AWS Rekognition / Azure Face API
        // Store record in DB
        let dbRecord = null;
        try {
            dbRecord = await prisma.attendance?.create({
                data: {
                    staff_id: studentId,
                    check_in: new Date(),
                    method: 'face',
                    confidence: parseFloat(confidence) || 0.95
                }
            });
        } catch { /* attendance table may not exist yet */ }

        ResponseHandler.success(res, {
            status: 'Marked',
            studentId,
            timestamp: new Date().toISOString(),
            confidence: parseFloat(confidence) || 0.95,
            dbStored: !!dbRecord
        }, 'Attendance marked');
    } catch (error) {
        next(error);
    }
};
