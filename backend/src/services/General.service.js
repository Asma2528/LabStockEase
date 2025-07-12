const GeneralModel = require('../models/general.models');
const OrderModel = require('../models/order.models');
const { createNotification } = require("./Notification.service");
const UserModel = require("../models/user.models");

exports.generateCode = async (generalData) =>{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `GEN-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastGeneral = await GeneralModel.findOne({
        generalCode: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ generalCode: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastGeneral) {
      const lastNumber = parseInt(lastGeneral.generalCode.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

// Create a new general
exports.createGeneral = async (generalData) => {

    const user = await UserModel.findOne({ _id:generalData.createdBy });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    generalData.generalCode = await this.generateCode();
      // Assuming `faculty._id` is the ObjectId you need for `userId`
        const message = `A general has been created by ${user.name}`;
    
        try {
     // Assuming `itemId` refers to the created requisition's `_id`
     await createNotification({
      userId: user._id, // Use ObjectId instead of email
      title: "General Created", // Provide a title for the notification
      message: message,
      send_to: ["admin","manager"],
      type: "createGeneral",
        });
        } catch (error) {
          console.error("Error creating notification:", error);
        }

    return await GeneralModel.create(generalData);
};

exports.getAllGenerals = async (filters = {}) => {
    const query = {};

    // Apply filters based on search parameters
    if (filters.description) query.description = { $regex: filters.description, $options: 'i' };
    if (filters.generalCode) query.generalCode = { $regex: filters.generalCode, $options: 'i' };
    if (filters.fundingAgency) query.fundingAgency = { $regex: filters.fundingAgency, $options: 'i' };
    if (filters.generalStatus) query.generalStatus = filters.generalStatus;

    // Search by generalInCharge (assuming it's a reference to a User or Employee collection)
    if (filters.generalInCharge) {
        query.generalInCharge = { 
            $in: filters.generalInCharge.split(',').map(id => id.trim())  // Supports searching by multiple IDs
        };
    }

    // Search by generalDate (assumes filter format is "yyyy-mm-dd")
    if (filters.generalDate) {
        const date = new Date(filters.generalDate);
        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            query.generalDate = { $gte: startDate, $lte: endDate };
        } else {
            query.generalDate = date;
        }
    }

    // Fetch generals with necessary population
    const generals = await GeneralModel.find(query)
        .populate('generalInCharge', 'name email')
        .populate('createdBy', 'name')
        .lean();  // Convert to plain JavaScript object for safe modification

    // Optimize order fetch by pulling all orders in a single query
    const orderIds = generals.flatMap(general => general.generalProcurements);
    const orders = await OrderModel.find({ '_id': { $in: orderIds } }).select('orderNumber _id').lean();

    // Create a mapping of order ID to orderNumber
    const orderMap = new Map(orders.map(order => [order._id.toString(), order.orderNumber]));

    // Replace order IDs with order numbers in generalProcurements
    generals.forEach(general => {
        general.generalProcurements = general.generalProcurements.map(orderId => 
            orderMap.get(orderId.toString()) || 'Order Not Found'
        );
    });

    return generals;
};



// Get a general by ID
exports.getGeneralById = async (generalId) => {
    return await GeneralModel.findById(generalId).populate('generalInCharge', 'name email');
};

// Update a general
exports.updateGeneral = async (generalId, updateData) => {
    return await GeneralModel.findByIdAndUpdate(generalId, updateData, { new: true });
};

// Delete a general
exports.deleteGeneral = async (generalId) => {
    return await GeneralModel.findByIdAndDelete(generalId);
};
