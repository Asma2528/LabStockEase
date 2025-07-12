const ProjectModel = require('../models/project.models');
const OrderModel = require('../models/order.models');
const { createNotification } = require("./Notification.service");
const UserModel = require("../models/user.models");

exports.generateCode = async (projectData) =>{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `P-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastProject = await ProjectModel.findOne({
        projectCode: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ projectCode: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastProject) {
      const lastNumber = parseInt(lastProject.projectCode.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

// Create a new project
exports.createProject = async (projectData) => {

    const user = await UserModel.findOne({ _id:projectData.createdBy });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    projectData.projectCode = await this.generateCode();
      // Assuming `faculty._id` is the ObjectId you need for `userId`
        const message = `A project has been created by ${user.name}`;
    
        try {
     // Assuming `itemId` refers to the created requisition's `_id`
     await createNotification({
      userId: user._id, // Use ObjectId instead of email
      title: "Project Created", // Provide a title for the notification
      message: message,
      send_to: ["admin","manager"],
      type: "createProject",
        });
        } catch (error) {
          console.error("Error creating notification:", error);
        }

    return await ProjectModel.create(projectData);
};

exports.getAllProjects = async (filters = {}) => {
    const query = {};

    // Apply filters based on search parameters
    if (filters.description) query.description = { $regex: filters.description, $options: 'i' };
    if (filters.projectCode) query.projectCode = { $regex: filters.projectCode, $options: 'i' };
    if (filters.fundingAgency) query.fundingAgency = { $regex: filters.fundingAgency, $options: 'i' };
    if (filters.projectStatus) query.projectStatus = filters.projectStatus;

    // Search by projectInCharge (assuming it's a reference to a User or Employee collection)
    if (filters.projectInCharge) {
        query.projectInCharge = { 
            $in: filters.projectInCharge.split(',').map(id => id.trim())  // Supports searching by multiple IDs
        };
    }

    // Search by projectDate (assumes filter format is "yyyy-mm-dd")
    if (filters.projectDate) {
        const date = new Date(filters.projectDate);
        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            query.projectDate = { $gte: startDate, $lte: endDate };
        } else {
            query.projectDate = date;
        }
    }

    // Fetch projects with necessary population
    const projects = await ProjectModel.find(query)
        .populate('projectInCharge', 'name email')
        .populate('createdBy', 'name')
        .lean();  // Convert to plain JavaScript object for safe modification

    // Optimize order fetch by pulling all orders in a single query
    const orderIds = projects.flatMap(project => project.projectProcurements);
    const orders = await OrderModel.find({ '_id': { $in: orderIds } }).select('orderNumber _id').lean();

    // Create a mapping of order ID to orderNumber
    const orderMap = new Map(orders.map(order => [order._id.toString(), order.orderNumber]));

    // Replace order IDs with order numbers in projectProcurements
    projects.forEach(project => {
        project.projectProcurements = project.projectProcurements.map(orderId => 
            orderMap.get(orderId.toString()) || 'Order Not Found'
        );
    });

    return projects;
};



// Get a project by ID
exports.getProjectById = async (projectId) => {
    return await ProjectModel.findById(projectId).populate('projectInCharge', 'name email');
};

// Update a project
exports.updateProject = async (projectId, updateData) => {
    return await ProjectModel.findByIdAndUpdate(projectId, updateData, { new: true });
};

// Delete a project
exports.deleteProject = async (projectId) => {
    return await ProjectModel.findByIdAndDelete(projectId);
};
