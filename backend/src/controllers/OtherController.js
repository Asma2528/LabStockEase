const httpStatus = require('http-status');
const OthersService = require('../services/Other.service');
const CatchAsync = require('../utils/CatchAsync');

// Create Other
exports.createOther = CatchAsync(async (req, res) => {

     const userId = req.user.id;
    
        if (!userId) {
            console.error("User ID is missing in the request.");
            return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
        }


        const otherData = { ...req.body, createdBy: userId };
    
    const newOther = await OthersService.createOther(otherData);
    return res.status(httpStatus.CREATED).json({ msg: 'Other created successfully', newOther });
});

// Get All Others (with search)
exports.getAllOthers = CatchAsync(async (req, res) => {
    const others = await OthersService.getAllOthers(req.query);
    return res.status(httpStatus.OK).json({ others });
});

// Get Other by ID
exports.getOtherById = CatchAsync(async (req, res) => {
    const other = await OthersService.getOtherById(req.params.id);
    if (!other) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Other not found' });
    return res.status(httpStatus.OK).json({ other });
});

// Update Other
exports.updateOther = CatchAsync(async (req, res) => {
    const updatedOther = await OthersService.updateOther(req.params.id, req.body);
    return res.status(httpStatus.OK).json({ msg: 'Other updated successfully', updatedOther });
});

// Delete Other
exports.deleteOther = CatchAsync(async (req, res) => {
    await OthersService.deleteOther(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Other deleted successfully' });
});
