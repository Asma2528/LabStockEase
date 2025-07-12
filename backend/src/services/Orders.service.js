const OrderModel = require('../models/order.models');
const ProjectModel = require('../models/project.models');
const VendorModel = require('../models/vendors.models');
const ChemicalModel = require('../models/chemicals.models');
const Consumables = require("../models/consumables.models");
const Others = require("../models/others.models");
const Glasswares = require("../models/glasswares.models");
const Books = require("../models/books.models");
const { createNotification } = require("./Notification.service");
const UserModel = require("../models/user.models");
const mongoose = require('mongoose');;
const PracticalModel = require('../models/practical.models');
const OtherModel = require('../models/other.models');
const GeneralModel = require('../models/general.models');

// Map categoryType to corresponding model
const categoryModelMap = {
  Project: ProjectModel,
  Practical: PracticalModel,
  General: GeneralModel,
  Other: OtherModel,
};

const getCategoryId = async (codeOrId, categoryType) => {
  const model = categoryModelMap[categoryType];
  if (!model) throw new Error(`Invalid categoryType: ${categoryType}`);

  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(codeOrId)) {
    const category = await model.findById(codeOrId);
    if (!category) throw new Error(`Category with id ${codeOrId} not found in ${categoryType}`);
    return category._id;
  }

  // Use the correct code field
  const codeFieldMap = {
    General: 'generalCode',
    Project: 'projectCode',
    Practical: 'practicalCode',
    Other: 'otherCode',
  };

  const codeField = codeFieldMap[categoryType];
  if (!codeField) throw new Error(`No code field defined for categoryType: ${categoryType}`);

  const category = await model.findOne({ [codeField]: codeOrId });
  if (!category) throw new Error(`Category with code ${codeOrId} not found in ${categoryType}`);

  console.log(category._id)
  return category._id;
};

const getVendorId = async (vendorIdentifier) => {
  let vendor;

  // Check if the identifier is a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(vendorIdentifier)) {
    vendor = await VendorModel.findById(vendorIdentifier);
  } else {
    vendor = await VendorModel.findOne({ code: vendorIdentifier });
  }

  if (!vendor) throw new Error(`Vendor with identifier ${vendorIdentifier} not found`);
  return vendor._id;
};


const getItemId = async (itemCode, itemClass) => {
  const modelMap = {
    'Chemicals': require('../models/chemicals.models'),
    'Equipments': require('../models/equipments.models'),
    'Glasswares': require('../models/glasswares.models'),
    'Others': require('../models/others.models'),
    'Books': require('../models/books.models'),
    'Consumables': require('../models/consumables.models'),
  };

  const ItemModel = modelMap[itemClass];
  if (!ItemModel) throw new Error(`Invalid item class: ${itemClass}`);

  const item = await ItemModel.findOne({ item_code: itemCode });
  if (!item) throw new Error(`Item with code ${itemCode} not found in class ${itemClass}`);

  return item._id;
};

exports.generateCode = async () => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const prefix = `PO-${year}${month}-`;

    // Find the last PO number for this month
    const lastOrder = await OrderModel.findOne({
      poNumber: { $regex: `^${prefix}` }
    }).sort({ poNumber: -1 });

    let nextNumber = 1;

    if (lastOrder) {
      const lastPo = lastOrder.poNumber;
      const lastNumberPart = parseInt(lastPo.split("-")[2], 10); // "001"
      nextNumber = lastNumberPart + 1;
    }

    const formattedNumber = String(nextNumber).padStart(3, "0");
    return `${prefix}${formattedNumber}`;
  } catch (error) {
    console.error("Error generating PO number:", error);
    throw error;
  }
};

exports.createOrder = async (orderData) => {
  // Step 1: Map category & vendor
  orderData.category = await getCategoryId(orderData.category, orderData.categoryType);
  orderData.vendor = await getVendorId(orderData.vendor);

  // Step 2: Resolve item ObjectIds
  for (let item of orderData.items) {
    item.item = await getItemId(item.item, item.class);
  }

  // Step 3: Generate PO number
  orderData.poNumber = await this.generateCode();

  // Step 4: Create order instance
  const order = new OrderModel(orderData);

  // ✅ Set virtual field (not stored in DB)
  if (orderData.orderNumberKey) {
    order.orderNumberKeyVirtual = orderData.orderNumberKey.trim();
  }

  // Step 5: Save order
  await order.save();

  // Step 6: Push order into category's procurements
  const categoryModel = categoryModelMap[orderData.categoryType];
  if (categoryModel) {
    const procurementField = `${orderData.categoryType.toLowerCase()}Procurements`;
    await categoryModel.findByIdAndUpdate(orderData.category, {
      $push: { [procurementField]: order._id }
    });
  }

  // Step 7: Send notification
  const user = await UserModel.findById(orderData.createdBy);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  await createNotification({
    userId: user._id,
    title: 'Order Created',
    message: `An order has been created by ${user.name}`,
    send_to: ['admin', 'manager'],
    type: 'createOrder'
  });

  return order;
};




exports.getOrderId = async (query) => {
  return await OrderModel.findOne(query);
};

exports.getAllOrders = async (filters = {}) => {
  const query = {};

  if (filters.orderNumber) query.orderNumber = new RegExp(filters.orderNumber, 'i');
  if (filters.poNumber) query.poNumber = new RegExp(filters.poNumber, 'i');
  if (filters.status) query.status = filters.status;
  if (filters.quotationDate) query.quotationDate = new Date(filters.quotationDate);
  if (filters.createdAt) query.createdAt = { $gte: new Date(filters.createdAt) };
  if (filters.class) {
    query.items = { $elemMatch: { class: filters.class } };
  }
  if (filters.categoryType) {
    query.categoryType = filters.categoryType;
    if (filters.categoryCode) {
      query.category = await getCategoryId(filters.categoryCode, filters.categoryType);
    }
  }

  const orders = await OrderModel.find(query)
    .populate('vendor', 'code name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name')
    .populate({
      path: 'items.item',
      select: 'item_code description'
    });

  // Enrich with categoryCode
  const enrichedOrders = await Promise.all(orders.map(async (order) => {
    const model = categoryModelMap[order.categoryType];
    let categoryCode = null;

    if (model && order.category) {
      const category = await model.findById(order.category);

      const codeFieldMap = {
        General: 'generalCode',
        Project: 'projectCode',
        Practical: 'practicalCode',
        Other: 'otherCode',
      };

      const codeField = codeFieldMap[order.categoryType];
      if (category && codeField) {
        categoryCode = category[codeField];
      }
    }

    return { ...order.toObject(), categoryCode };
  }));



  return enrichedOrders;
};

exports.updateOrder = async (orderId, updateData) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error('Order not found');

  if ('orderNumber' in updateData) {
    delete updateData.orderNumber;
  }

  // Update category if changed
  if (updateData.category && updateData.categoryType) {
    const oldModel = categoryModelMap[order.categoryType];
    const newModel = categoryModelMap[updateData.categoryType];

    const oldCategoryId = order.category;
    updateData.category = await getCategoryId(updateData.category, updateData.categoryType);

    // Ensure dynamic procurement field update based on categoryType
    const oldProcurementField = `${order.categoryType.toLowerCase()}Procurements`;
    const newProcurementField = `${updateData.categoryType.toLowerCase()}Procurements`;

    if (oldModel) {
      // Remove order from old category's procurement array
      await oldModel.findByIdAndUpdate(oldCategoryId, {
        $pull: { [oldProcurementField]: orderId }
      });
    }
    if (newModel) {
      // Add order to new category's procurement array
      await newModel.findByIdAndUpdate(updateData.category, {
        $push: { [newProcurementField]: orderId }
      });
    }
  }

  if (updateData.vendor) {
    updateData.vendor = await getVendorId(updateData.vendor);
  }

  if (updateData.items) {
    for (let item of updateData.items) {
      item.item = await getItemId(item.item, item.class);
    }
  }

  // Update the order and return the updated document
  return await OrderModel.findByIdAndUpdate(orderId, updateData, { new: true });
};




exports.approveOrder = async (orderId, status, approvedBy, remark) => {
  return await OrderModel.findByIdAndUpdate(
    orderId,
    { status, approvedBy, remark },
    { new: true }
  );
};

exports.deleteOrder = async (orderId) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error('Order not found');

  const projectId = order.project;

  // Remove order ID from project's procurements
  await ProjectModel.findByIdAndUpdate(projectId, {
    $pull: { projectProcurements: orderId }
  });

  return await OrderModel.findByIdAndDelete(orderId);
};
