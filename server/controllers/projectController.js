const Project = require('../models/Project');

// @route   GET /api/v1/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('lead', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true, data: { projects }, message: 'Projects fetched', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/projects
// @access  Administrator | ProjectLead
const createProject = async (req, res, next) => {
  try {
    const { name, description, lead, members } = req.body;
    const project = await Project.create({ name, description, lead, members });
    return res.status(201).json({
      success: true, data: { project }, message: 'Project created', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/v1/projects/:id
// @access  Administrator | ProjectLead
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) {
      return res.status(404).json({
        success: false, data: null, message: 'Project not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: { project }, message: 'Project updated', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/v1/projects/:id
// @access  Administrator
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false, data: null, message: 'Project not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: null, message: 'Project deleted', error: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
