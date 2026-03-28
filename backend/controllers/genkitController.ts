import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/responseHandler';
import { ai } from '../ai/genkit';
import { z } from 'genkit';
import { getHindiAudio } from '@/ai/flows/hindi-xray-analysis';
import { getEnglishAudio, chatWithEnglishXrayBot } from '@/ai/flows/english-xray-analysis';
import { chatWithXrayBot } from '@/ai/flows/hindi-xray-analysis';

// ----------------------------------------------------------------------------
// 1. Analyze Symptoms
// ----------------------------------------------------------------------------

const SymptomsOutputSchema = z.object({
    possibleConditions: z.array(z.string()).describe("List of possible medical conditions."),
    severityLevel: z.enum(['Low', 'Medium', 'High']).describe("Overall estimated severity based on symptoms."),
    recommendedSpecialist: z.string().describe("The type of doctor or specialist to visit."),
    basicAdvice: z.string().describe("Non-diagnostic advice or immediate home care tips."),
});

// ----------------------------------------------------------------------------
// 1.5. Scan Prescription
// ----------------------------------------------------------------------------

const PrescriptionScanOutputSchema = z.object({
    medicines: z.array(z.string()).describe("List of medicine names extracted from the prescription."),
});


export const analyzeSymptoms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symptoms, language = 'en' } = req.body;
        if (!symptoms) {
            return (ResponseHandler as any).badRequest(res, 'Symptoms text is required');
        }

        const systemPrompt = language === 'hi' 
            ? `आप एक मेडिकल असिस्टेंट हैं। दिए गए लक्षणों (symptoms) का विश्लेषण करें और केवल JSON फॉर्मेट में आउटपुट दें। 
               ध्यान रहे: यह निदान (diagnosis) नहीं है। मरीज को हमेशा डॉक्टर से सलाह लेनी चाहिए।
               JSON में possibleConditions, severityLevel (Low/Medium/High), recommendedSpecialist और basicAdvice शामिल करें।`
            : `You are an AI medical assistant. Analyze the following symptoms and respond ONLY in valid JSON.
               Disclaimer: This is not a diagnosis. Always recommend consulting a real doctor.
               Include possibleConditions, severityLevel (Low/Medium/High), recommendedSpecialist, and basicAdvice.`;

        const { output } = await ai.generate({
            prompt: `Symptoms: ${symptoms}\n\n${systemPrompt}`,
            output: { schema: SymptomsOutputSchema },
        });

        (ResponseHandler as any).success(res, output, 'Symptoms analyzed successfully');
    } catch (error) {
        next(error);
    }
};

// ----------------------------------------------------------------------------
// 2. Analyze Document / X-Ray / Scan
// ----------------------------------------------------------------------------

const DocumentAnalysisOutputSchema = z.object({
    explanation: z.string().describe("Simple overall explanation of the document or scan."),
    abnormalValues: z.array(z.string()).describe("List of abnormal values, flagged items, or worrying visual signs."),
    summary: z.string().describe("A very short plain language summary for the patient."),
    riskIndicators: z.array(z.string()).describe("Potentially risky findings or indicators (e.g., High Blood Sugar, Fracture detected)."),
    suggestedNextSteps: z.array(z.string()).describe("Actionable advice or next steps to take."),
});

export const analyzeDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileDataUri, documentText, fileType, language = 'en' } = req.body;

        if (!fileDataUri && !documentText) {
            return (ResponseHandler as any).badRequest(res, 'Either fileDataUri (image/pdf) or documentText is required');
        }

        const languageInstruction = language === 'hi' 
            ? 'पूरी रिपोर्ट और स्पष्टीकरण हिंदी भाषा में दें (Respond entirely in Hindi).'
            : 'Respond entirely in English.';

        let parts: any[] = [{ text: `You are an expert medical document and scan analyzer. Analyze the provided ${fileType || 'document/scan'} and extract findings into JSON format. ${languageInstruction} Find abnormal values, risk indicators, and provide a plain language summary.` }];

        if (documentText) {
            parts.push({ text: `Document text extracted:\n${documentText}` });
        }
        if (fileDataUri) {
            // Note: Data URI includes 'data:image/jpeg;base64,...'
            parts.push({ media: { url: fileDataUri } });
        }

        const { output } = await ai.generate({
            prompt: parts,
            output: { schema: DocumentAnalysisOutputSchema },
        });

        (ResponseHandler as any).success(res, output, 'Medical document analyzed successfully');
    } catch (error) {
        next(error);
    }
};

export const scanPrescription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileDataUri } = req.body;

        if (!fileDataUri) {
            return (ResponseHandler as any).badRequest(res, 'Prescription image (fileDataUri) is required');
        }

        const systemPrompt = `You are a world-class pharmacist and expert in medical calligraphy and prescription decoding. 
        Your task is to scan the provided image (which could be a handwritten or typed prescription) and extract every single medicine or pharmaceutical product mentioned.

        Guidelines:
        1. Be extremely thorough. Even if a word is partially legible, try to identify if it's a known medicine using your vast clinical database.
        2. Look for common medicine formats: Name (e.g. Amoxicillin), Strength (e.g. 500mg), Form (e.g. Tab/Cap), and Frequency (e.g. TDS/1-0-1).
        3. Extract the full product name including strength if possible (e.g., "Paracetamol 500mg").
        4. Focus on identifying brand names or generic names of tablets, syrups, injections, and ointments.
        5. If you see lists of items starting with symbols like #, Rx, or numbers, these are likely medicines.
        
        Respond ONLY in valid JSON with a "medicines" array containing the strings of detected medicine names.
        If absolutely no medical terms are found, return an empty array.`;

        const { output } = await ai.generate({
            prompt: [
                { text: systemPrompt },
                { media: { url: fileDataUri } }
            ],
            output: { schema: PrescriptionScanOutputSchema },
        });

        console.log("Prescription extraction result:", output);
        (ResponseHandler as any).success(res, output, 'Prescription scanned successfully');
    } catch (error) {
        next(error);
    }
};



// ----------------------------------------------------------------------------
// 3. Text to Speech
// ----------------------------------------------------------------------------
export const handleTTS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, language = 'en' } = req.body;
        if (!text) {
            return (ResponseHandler as any).badRequest(res, 'Text is required for TTS');
        }

        let audioDataUri;
        if (language === 'hi') {
            audioDataUri = await getHindiAudio(text);
        } else {
            audioDataUri = await getEnglishAudio(text);
        }

        (ResponseHandler as any).success(res, { audioDataUri }, 'Audio generated');
    } catch (error) {
        next(error);
    }
};

// ----------------------------------------------------------------------------
// 4. Chat Follow-up
// ----------------------------------------------------------------------------
export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prompt, history = [], language = 'en' } = req.body;
        if (!prompt) {
            return (ResponseHandler as any).badRequest(res, 'Prompt is required for chat');
        }

        let response;
        if (language === 'hi') {
            response = await chatWithXrayBot({ prompt, history });
        } else {
            response = await chatWithEnglishXrayBot({ prompt, history });
        }

        (ResponseHandler as any).success(res, { response }, 'Chat response generated');
    } catch (error) {
        next(error);
    }
};
