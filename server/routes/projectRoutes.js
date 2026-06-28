const express = require('express');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', roleCheck('Administrator', 'ProjectLead'), createProject);
router.put('/:id', roleCheck('Administrator', 'ProjectLead'), updateProject);
router.delete('/:id', roleCheck('Administrator'), deleteProject);

module.exports = router;
