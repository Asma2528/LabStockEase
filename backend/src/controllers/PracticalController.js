const httpStatus = require('http-status');
const PracticalsService = require('../services/Practical.service');
const CatchAsync = require('../utils/CatchAsync');

// Create Practical
exports.createPractical = CatchAsync(async (req, res) => {

     const userId = req.user.id;
    
        if (!userId) {
            console.error("User ID is missing in the request.");
            return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
        }


        const practicalData = { ...req.body, createdBy: userId };
    
    const newPractical = await PracticalsService.createPractical(practicalData);
    return res.status(httpStatus.CREATED).json({ msg: 'Practical created successfully', newPractical });
});

// Get All Practicals (with search)
exports.getAllPracticals = CatchAsync(async (req, res) => {
    const practicals = await PracticalsService.getAllPracticals(req.query);
    return res.status(httpStatus.OK).json({ practicals });
});

// Get Practical by ID
exports.getPracticalById = CatchAsync(async (req, res) => {
    const practical = await PracticalsService.getPracticalById(req.params.id);
    if (!practical) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Practical not found' });
    return res.status(httpStatus.OK).json({ practical });
});

// Update Practical
exports.updatePractical = CatchAsync(async (req, res) => {
    const updatedPractical = await PracticalsService.updatePractical(req.params.id, req.body);
    return res.status(httpStatus.OK).json({ msg: 'Practical updated successfully', updatedPractical });
});

// Delete Practical
exports.deletePractical = CatchAsync(async (req, res) => {
    await PracticalsService.deletePractical(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Practical deleted successfully' });
});
