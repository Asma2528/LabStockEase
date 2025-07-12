const express = require('express');
const Authentication = require('../middlewares/Authentication');
const ProjectsController = require('../controllers/ProjectController');
const ProjectValidation = require('../validations/Project.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create Project
router.post(
    '/create',
    ProjectValidation.CreateProject,  // Validate request body
    Validation,
    ProjectsController.createProject
);

// Get All Projects (with Search)
router.get('/all', Validation, ProjectsController.getAllProjects);

// Get Project by ID
router.get(
    '/:id',
    ProjectValidation.Params_id,
    Validation,
    ProjectsController.getProjectById
);

// Update Project
router.patch(
    '/update/:id',
    ProjectValidation.Params_id,
    ProjectValidation.UpdateProject,
    Validation,
    ProjectsController.updateProject
);

// Delete Project
router.delete(
    '/delete/:id',
    ProjectValidation.Params_id,
    Validation,
    ProjectsController.deleteProject
);

module.exports = router;
