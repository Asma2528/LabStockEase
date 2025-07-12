const httpStatus = require('http-status');
const ProjectsService = require('../services/Project.service');
const CatchAsync = require('../utils/CatchAsync');

// Create Project
exports.createProject = CatchAsync(async (req, res) => {

     const userId = req.user.id;
    
        if (!userId) {
            console.error("User ID is missing in the request.");
            return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
        }


        const projectData = { ...req.body, createdBy: userId };
    
    const newProject = await ProjectsService.createProject(projectData);
    return res.status(httpStatus.CREATED).json({ msg: 'Project created successfully', newProject });
});

// Get All Projects (with search)
exports.getAllProjects = CatchAsync(async (req, res) => {
    const projects = await ProjectsService.getAllProjects(req.query);
    return res.status(httpStatus.OK).json({ projects });
});

// Get Project by ID
exports.getProjectById = CatchAsync(async (req, res) => {
    const project = await ProjectsService.getProjectById(req.params.id);
    if (!project) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Project not found' });
    return res.status(httpStatus.OK).json({ project });
});

// Update Project
exports.updateProject = CatchAsync(async (req, res) => {
    const updatedProject = await ProjectsService.updateProject(req.params.id, req.body);
    return res.status(httpStatus.OK).json({ msg: 'Project updated successfully', updatedProject });
});

// Delete Project
exports.deleteProject = CatchAsync(async (req, res) => {
    await ProjectsService.deleteProject(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Project deleted successfully' });
});
