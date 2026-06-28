// server/routes/requestRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getRequests, getMyRequests, getPendingApprovals, getRequest,
  createRequest, approveRequest, rejectRequest, allocateRequest,
  confirmCheckout, returnRequest, cancelRequest, markOverdue
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);

const APPROVERS = ['Administrator', 'ResourceManager', 'ProjectLead'];

const createValidation = [
  body('asset').notEmpty().withMessage('Asset is required'),
  body('quantityRequested').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('expectedReturnDate').isISO8601().withMessage('Valid return date required')
];

router.get('/',          roleCheck('Administrator', 'ResourceManager'), getRequests);
router.get('/my',        getMyRequests);
router.get('/approvals', roleCheck(...APPROVERS), getPendingApprovals);
router.get('/:id',       getRequest);

router.post('/',             createValidation, createRequest);
router.put('/:id/approve',   roleCheck(...APPROVERS), approveRequest);
router.put('/:id/reject',    roleCheck(...APPROVERS), rejectRequest);
router.put('/:id/allocate',  roleCheck('Administrator', 'ResourceManager'), allocateRequest);
router.put('/:id/checkout',  roleCheck('Administrator', 'ResourceManager'), confirmCheckout);
router.put('/:id/return',    roleCheck('Administrator', 'ResourceManager'), returnRequest);
router.put('/:id/cancel',    cancelRequest);
router.put('/:id/overdue',   roleCheck('Administrator', 'ResourceManager'), markOverdue);

module.exports = router;
