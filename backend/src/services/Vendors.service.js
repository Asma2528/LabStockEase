const VendorModel = require('../models/vendors.models');

exports.generateCode = async () =>{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `V-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastVendor = await VendorModel.findOne({
        code: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ code: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastVendor) {
      const lastNumber = parseInt(lastVendor.code.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }


// Create a new vendor
exports.createVendor = async (vendorData) => {

    vendorData.code = await this.generateCode();

    const newVendor = new VendorModel(vendorData);
    return await newVendor.save();
};

// Service: Get all vendors with filtering
exports.getAllVendors = async (filters = {}) => {
    const query = {};
    
    // Apply filters based on the search parameters
    if (filters.code) query.code = { $regex: filters.code, $options: 'i' };
    if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
    if (filters.contact_person) query.contact_person = { $regex: filters.contact_person, $options: 'i' };
    if (filters.classification) query.classification = filters.classification;
    if (filters.grading) query.grading = filters.grading;

    return await VendorModel.find(query);
};




// Update a vendor by ID
exports.updateVendor = async (vendorId, updateData) => {
    return await VendorModel.findByIdAndUpdate(vendorId, updateData, { new: true });
};

// Delete a vendor by ID
exports.deleteVendor = async (vendorId) => {
    return await VendorModel.findByIdAndDelete(vendorId);
};
