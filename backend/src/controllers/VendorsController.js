const httpStatus = require('http-status');
const VendorsService = require('../services/Vendors.service');
const CatchAsync = require('../utils/CatchAsync');


// Create a new Vendor
exports.createVendor = CatchAsync(async (req, res) => {
    const newVendor = await VendorsService.createVendor(req.body);
    return res.status(httpStatus.CREATED).json({ msg: 'Vendor created successfully', newVendor });
});

// Controller: Get all vendors with optional filtering
exports.getAllVendors = CatchAsync(async (req, res) => {
    const vendors = await VendorsService.getAllVendors(req.query);
    return res.status(httpStatus.OK).json({ vendors });
});



// Update a Vendor
exports.updateVendor = CatchAsync(async (req, res) => {
    const updatedVendor = await VendorsService.updateVendor(req.params.id, req.body);
    if (!updatedVendor) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Vendor not found' });
    return res.status(httpStatus.OK).json({ msg: 'Vendor updated successfully', updatedVendor });
});

// Delete a Vendor
exports.deleteVendor = CatchAsync(async (req, res) => {
    await VendorsService.deleteVendor(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Vendor deleted successfully' });
});
