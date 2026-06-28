// server/routes/checkoutRoutes.js
const express = require('express');
const { getCheckouts, getActiveCheckouts, getOverdueCheckouts, getCheckout, returnCheckout, scanOverdue } = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);

const RM = ['Administrator', 'ResourceManager'];

router.get('/',              roleCheck(...RM), getCheckouts);
router.get('/active',        getActiveCheckouts);
router.get('/overdue',       roleCheck(...RM), getOverdueCheckouts);
router.put('/scan-overdue',  roleCheck(...RM), scanOverdue);
router.get('/:id',           getCheckout);
router.put('/:id/return',    roleCheck(...RM), returnCheckout);

module.exports = router;
