const PracticalModel = require('../models/practical.models');
const OrderModel = require('../models/order.models');
const { createNotification } = require("./Notification.service");
const UserModel = require("../models/user.models");

exports.generateCode = async (practicalData) =>{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `PR-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastPractical = await PracticalModel.findOne({
        practicalCode: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ practicalCode: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastPractical) {
      const lastNumber = parseInt(lastPractical.practicalCode.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

// Create a new practical
exports.createPractical = async (practicalData) => {

    const user = await UserModel.findOne({ _id:practicalData.createdBy });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    practicalData.practicalCode = await this.generateCode();
      // Assuming `faculty._id` is the ObjectId you need for `userId`
        const message = `A practical has been created by ${user.name}`;
    
        try {
     // Assuming `itemId` refers to the created requisition's `_id`
     await createNotification({
      userId: user._id, // Use ObjectId instead of email
      title: "Practical Created", // Provide a title for the notification
      message: message,
      send_to: ["admin","manager"],
      type: "createPractical",
        });
        } catch (error) {
          console.error("Error creating notification:", error);
        }

    return await PracticalModel.create(practicalData);
};

exports.getAllPracticals = async (filters = {}) => {
    const query = {};

    // Apply filters based on search parameters
    if (filters.description) query.description = { $regex: filters.description, $options: 'i' };
    if (filters.practicalCode) query.practicalCode = { $regex: filters.practicalCode, $options: 'i' };
    if (filters.fundingAgency) query.fundingAgency = { $regex: filters.fundingAgency, $options: 'i' };
    if (filters.practicalStatus) query.practicalStatus = filters.practicalStatus;

    // Search by practicalInCharge (assuming it's a reference to a User or Employee collection)
    if (filters.practicalInCharge) {
        query.practicalInCharge = { 
            $in: filters.practicalInCharge.split(',').map(id => id.trim())  // Supports searching by multiple IDs
        };
    }

    // Search by practicalDate (assumes filter format is "yyyy-mm-dd")
    if (filters.practicalDate) {
        const date = new Date(filters.practicalDate);
        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            query.practicalDate = { $gte: startDate, $lte: endDate };
        } else {
            query.practicalDate = date;
        }
    }

    // Fetch practicals with necessary population
    const practicals = await PracticalModel.find(query)
        .populate('practicalInCharge', 'name email')
        .populate('createdBy', 'name')
        .lean();  // Convert to plain JavaScript object for safe modification

    // Optimize order fetch by pulling all orders in a single query
    const orderIds = practicals.flatMap(practical => practical.practicalProcurements);
    const orders = await OrderModel.find({ '_id': { $in: orderIds } }).select('orderNumber _id').lean();

    // Create a mapping of order ID to orderNumber
    const orderMap = new Map(orders.map(order => [order._id.toString(), order.orderNumber]));

    // Replace order IDs with order numbers in practicalProcurements
    practicals.forEach(practical => {
        practical.practicalProcurements = practical.practicalProcurements.map(orderId => 
            orderMap.get(orderId.toString()) || 'Order Not Found'
        );
    });

    return practicals;
};



// Get a practical by ID
exports.getPracticalById = async (practicalId) => {
    return await PracticalModel.findById(practicalId).populate('practicalInCharge', 'name email');
};

// Update a practical
exports.updatePractical = async (practicalId, updateData) => {
    return await PracticalModel.findByIdAndUpdate(practicalId, updateData, { new: true });
};

// Delete a practical
exports.deletePractical = async (practicalId) => {
    return await PracticalModel.findByIdAndDelete(practicalId);
};
