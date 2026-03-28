const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');

// All lab routes require authentication
router.use(protect);

// Patient gets their own lab orders
router.get('/my-orders', labController.getMyOrders);

// Lab Dashboard Routes (Exclusive to Lab Admins/Staff)
router.get('/profile', authorize('lab'), labController.getLabProfile);
router.get('/dashboard-stats', authorize('lab'), labController.getDashboardStats);
router.get('/inventory', authorize('lab'), labController.getInventory);
router.post('/inventory', authorize('lab'), labController.saveInventory);
router.get('/staff', authorize('lab'), labController.getStaff);
router.get('/bookings', authorize('lab'), labController.getLabBookings);
router.get('/connections', authorize('lab'), labController.getClinicConnections);

router.route('/')
    .get(labController.getOrders)
    .post(authorize('doctor', 'admin', 'clinic'), labController.createOrder);

router.get('/test-types', labController.getTestTypes);

router.route('/:id')
    .get(labController.getOrderById)
    .put(authorize('doctor', 'admin', 'clinic', 'lab'), labController.updateStatus)
    .delete(authorize('admin', 'clinic'), labController.deleteOrder);

module.exports = router;

