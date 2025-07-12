const httpStatus = require('http-status');
const GeneralsService = require('../services/General.service');
const CatchAsync = require('../utils/CatchAsync');

// Create General
exports.createGeneral = CatchAsync(async (req, res) => {

     const userId = req.user.id;
    
        if (!userId) {
            console.error("User ID is missing in the request.");
            return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
        }


        const generalData = { ...req.body, createdBy: userId };
    
    const newGeneral = await GeneralsService.createGeneral(generalData);
    return res.status(httpStatus.CREATED).json({ msg: 'General created successfully', newGeneral });
});

// Get All Generals (with search)
exports.getAllGenerals = CatchAsync(async (req, res) => {
    const generals = await GeneralsService.getAllGenerals(req.query);
    return res.status(httpStatus.OK).json({ generals });
});

// Get General by ID
exports.getGeneralById = CatchAsync(async (req, res) => {
    const general = await GeneralsService.getGeneralById(req.params.id);
    if (!general) return res.status(httpStatus.NOT_FOUND).json({ msg: 'General not found' });
    return res.status(httpStatus.OK).json({ general });
});

// Update General
exports.updateGeneral = CatchAsync(async (req, res) => {
    const updatedGeneral = await GeneralsService.updateGeneral(req.params.id, req.body);
    return res.status(httpStatus.OK).json({ msg: 'General updated successfully', updatedGeneral });
});

// Delete General
exports.deleteGeneral = CatchAsync(async (req, res) => {
    await GeneralsService.deleteGeneral(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'General deleted successfully' });
});
