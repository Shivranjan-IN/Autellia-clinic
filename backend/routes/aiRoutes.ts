import { Router } from 'express';
import { handleTTS, handleChat, analyzeSymptoms, analyzeDocument, scanPrescription } from '../controllers/genkitController';

const router = Router();

/**
 * @route   POST /api/ai/analyze-symptoms
 * @desc    Analyze patient symptoms
 * @access  Public
 */
router.post('/analyze-symptoms', analyzeSymptoms);

/**
 * @route   POST /api/ai/analyze-document
 * @desc    Analyze medical report or X-ray/Scan
 * @access  Public
 */
router.post('/analyze-document', analyzeDocument);

/**
 * @route   POST /api/ai/scan-prescription
 * @desc    Scan prescription and extract medicine names
 * @access  Public
 */
router.post('/scan-prescription', scanPrescription);

/**
 * @route   POST /api/ai/tts
 * @desc    Convert text to speech (English/Hindi)
 * @access  Public
 */
router.post('/tts', handleTTS);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat follow-up for AI analysis
 * @access  Public
 */
router.post('/chat', handleChat);

export default router;
