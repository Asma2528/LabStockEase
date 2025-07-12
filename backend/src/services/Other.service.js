const OtherModel = require('../models/other.models');
const OrderModel = require('../models/order.models');
const { createNotification } = require("./Notification.service");
const UserModel = require("../models/user.models");

exports.generateCode = async (otherData) =>{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `OTH-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastOther = await OtherModel.findOne({
        otherCode: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ otherCode: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastOther) {
      const lastNumber = parseInt(lastOther.otherCode.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

// Create a new other
exports.createOther = async (otherData) => {

    const user = await UserModel.findOne({ _id:otherData.createdBy });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    otherData.otherCode = await this.generateCode();
      // Assuming `faculty._id` is the ObjectId you need for `userId`
        const message = `A other has been created by ${user.name}`;
    
        try {
     // Assuming `itemId` refers to the created requisition's `_id`
     await createNotification({
      userId: user._id, // Use ObjectId instead of email
      title: "Other Created", // Provide a title for the notification
      message: message,
      send_to: ["admin","manager"],
      type: "createOther",
        });
        } catch (error) {
          console.error("Error creating notification:", error);
        }

    return await OtherModel.create(otherData);
};

exports.getAllOthers = async (filters = {}) => {
    const query = {};

    // Apply filters based on search parameters
    if (filters.description) query.description = { $regex: filters.description, $options: 'i' };
    if (filters.otherCode) query.otherCode = { $regex: filters.otherCode, $options: 'i' };
    if (filters.fundingAgency) query.fundingAgency = { $regex: filters.fundingAgency, $options: 'i' };
    if (filters.otherStatus) query.otherStatus = filters.otherStatus;

    // Search by otherInCharge (assuming it's a reference to a User or Employee collection)
    if (filters.otherInCharge) {
        query.otherInCharge = { 
            $in: filters.otherInCharge.split(',').map(id => id.trim())  // Supports searching by multiple IDs
        };
    }

    // Search by otherDate (assumes filter format is "yyyy-mm-dd")
    if (filters.otherDate) {
        const date = new Date(filters.otherDate);
        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            query.otherDate = { $gte: startDate, $lte: endDate };
        } else {
            query.otherDate = date;
        }
    }

    // Fetch others with necessary population
    const others = await OtherModel.find(query)
        .populate('otherInCharge', 'name email')
        .populate('createdBy', 'name')
        .lean();  // Convert to plain JavaScript object for safe modification

    // Optimize order fetch by pulling all orders in a single query
    const orderIds = others.flatMap(other => other.otherProcurements);
    const orders = await OrderModel.find({ '_id': { $in: orderIds } }).select('orderNumber _id').lean();

    // Create a mapping of order ID to orderNumber
    const orderMap = new Map(orders.map(order => [order._id.toString(), order.orderNumber]));

    // Replace order IDs with order numbers in otherProcurements
    others.forEach(other => {
        other.otherProcurements = other.otherProcurements.map(orderId => 
            orderMap.get(orderId.toString()) || 'Order Not Found'
        );
    });

    return others;
};



// Get a other by ID
exports.getOtherById = async (otherId) => {
    return await OtherModel.findById(otherId).populate('otherInCharge', 'name email');
};

// Update a other
exports.updateOther = async (otherId, updateData) => {
    return await OtherModel.findByIdAndUpdate(otherId, updateData, { new: true });
};

// Delete a other
exports.deleteOther = async (otherId) => {
    return await OtherModel.findByIdAndDelete(otherId);
};
