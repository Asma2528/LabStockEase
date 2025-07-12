const httpStatus = require('http-status');
const InwardsService = require('../services/Inwards.service');
const CatchAsync = require('../utils/CatchAsync');

// ✅ Create Inward (Auto-Generates `inwardNumber`)
exports.createInward = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error("User ID is missing in the request.");
        return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const inwardData = { ...req.body, createdBy: userId };
    const newInward = await InwardsService.createInward(inwardData);

    return res.status(httpStatus.CREATED).json({ msg: 'Inward created successfully', newInward });
});

// ✅ Get All Inwards (with Search & Filters)
exports.getAllInwards = CatchAsync(async (req, res) => {
    const inwards = await InwardsService.getAllInwards(req.query);
    return res.status(httpStatus.OK).json({ inwards });
});

// ✅ Get Inward by ID
exports.getInwardById = CatchAsync(async (req, res) => {
    const inward = await InwardsService.getInwardById(req.params.id);
    if (!inward) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Inward not found' });
    return res.status(httpStatus.OK).json({ inward });
});

// ✅ Update Inward (Prevents Editing `inwardNumber`)
exports.updateInward = CatchAsync(async (req, res) => {
    const updatedInward = await InwardsService.updateInward(req.params.id, req.body);
    if (!updatedInward) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Inward not found' });
    return res.status(httpStatus.OK).json({ msg: 'Inward updated successfully', updatedInward });
});



// ✅ Delete Inward
exports.deleteInward = CatchAsync(async (req, res) => {
    await InwardsService.deleteInward(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Inward deleted successfully' });
});
