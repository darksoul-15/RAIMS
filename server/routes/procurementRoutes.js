// server/routes/procurementRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { getProcurements, getCategories, getProcurement, createProcurement, updateProcurement, deleteProcurement } = require('../controllers/procurementController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(protect);

const RM   = ['Administrator', 'ResourceManager'];
const validation = [
  body('purchaseDate').isISO8601().withMessage('Valid purchase date required'),
  body('purchaseCost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('vendorName').trim().notEmpty().withMessage('Vendor name is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
];

// static before :id
router.get('/categories', getCategories);

router.get('/',    getProcurements);
router.get('/:id', getProcurement);

router.post('/',    roleCheck(...RM), upload.single('invoice'), validation, createProcurement);
router.put('/:id',  roleCheck(...RM), upload.single('invoice'), updateProcurement);
router.delete('/:id', roleCheck('Administrator'), deleteProcurement);

module.exports = router;
