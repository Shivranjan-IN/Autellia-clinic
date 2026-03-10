const express = require('express');
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// Get all documents for the authenticated patient
router.get('/', documentController.getMyDocuments);

// Upload a new document (stores binary in database)
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// View a document inline (in browser)
router.get('/:id', documentController.getDocument);

// Download a document as attachment
router.get('/:id/download', documentController.downloadDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
