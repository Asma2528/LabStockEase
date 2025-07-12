const InwardsModel = require('../models/inwards.models'); 
const VendorModel = require('../models/vendors.models');
const InvoiceModel = require('../models/invoice.models');
const ChemicalsModel = require('../models/chemicals.models');
const BooksModel = require('../models/books.models');
const GlasswaresModel = require('../models/glasswares.models');
const ConsumablesModel = require('../models/consumables.models');
const EquipmentsModel = require('../models/equipments.models');
const OthersModel = require('../models/others.models');
const UserModel = require("../models/user.models");

const { createNotification } = require("./Notification.service");
const mongoose = require('mongoose');

// Function to get vendor ID from code or ObjectID
const getVendorId = async (vendorIdentifier) => {
    let vendor;
    if (mongoose.Types.ObjectId.isValid(vendorIdentifier)) {
        vendor = await VendorModel.findById(vendorIdentifier);
    } else {
        vendor = await VendorModel.findOne({ code: vendorIdentifier });
    }
    if (!vendor) throw new Error(`Vendor with identifier ${vendorIdentifier} not found`);
    return vendor._id;
};

// Function to get invoice ID from ObjectID
const getInvoiceId = async (invoiceId) => {
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        throw new Error(`Invalid Invoice ID: ${invoiceId}`);
    }
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`);
    return invoice._id;
};

const getItemDetails = async (itemId, itemClass) => {
    const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
    };

    console.log(itemClass)

    const ItemModel = modelMap[itemClass];
    if (!ItemModel) throw new Error(`Invalid item class: ${itemClass}`);

    const item = await ItemModel.findById(itemId).select('item_code item_name description');
    return item || null; // Return null if item not found
};


// Function to get item ID based on item class
const getItemId = async (itemCode, itemClass) => {
    const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
    };

    const ItemModel = modelMap[itemClass];
    if (!ItemModel) throw new Error(`Invalid item class: ${itemClass}`);

    let item;
    if (mongoose.Types.ObjectId.isValid(itemCode)) {
        item = await ItemModel.findById(itemCode);
    } 
    if (!item) {
        item = await ItemModel.findOne({ item_code: itemCode });
    }

    if (!item) throw new Error(`Item with code ${itemCode} not found in class ${itemClass}`);

    return item._id;
};

const generateCode = async()=> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `INW-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastInward = await InwardsModel.findOne({
      inward_code: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ inward_code: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastInward) {
      const lastNumber = parseInt(lastInward.inward_code.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

// ✅ Create an Inward Entry
exports.createInward = async (inwardData) => {
    // Process vendor
    inwardData.vendor = await getVendorId(inwardData.vendor);
    
    // Process item
    inwardData.item = await getItemId(inwardData.item, inwardData.class);

    // Process invoice
    inwardData.invoice = await getInvoiceId(inwardData.invoice);
    inwardData.inward_code = await generateCode();
    // Create inward entry
    const inward = await InwardsModel.create(inwardData);

    // Send Notification
    const user = await UserModel.findById(inwardData.createdBy);
    if (!user) {
        throw new Error("User not found");
    }

    const message = `An inward entry has been created by ${user.name}`;
    try {
        await createNotification({
            userId: user._id,
            title: "Inward Created",
            message: message,
            send_to: ["admin", "manager"],
            type: "createInward",
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }

    return inward;
};



exports.getAllInwards = async (filters = {}) => {
    const query = {};

    // Vendor Code Search (Case-Insensitive)
    if (filters.vendorCode) {
        const vendor = await VendorModel.findOne({ code: { $regex: `^${filters.vendorCode}$`, $options: 'i' } });
        if (!vendor) return []; // No matching vendor, return empty array
        query.vendor = vendor._id;
    }

    // Item Code Search (Case-Insensitive)
    if (filters.itemCode) {  
        const modelMap = {
            'Chemicals': ChemicalsModel,
            'Books': BooksModel,
            'Glasswares': GlasswaresModel,
            'Consumables': ConsumablesModel,
            'Equipments': EquipmentsModel,
            'Others': OthersModel,
        };
    
        let item = null;
    
        // Search for the item in all models
        for (const [className, Model] of Object.entries(modelMap)) {
            item = await Model.findOne({ item_code: { $regex: `^${filters.itemCode}$`, $options: 'i' } });
            if (item) {
                query.item = item._id;
                query.class = className; // Store the class if needed
                break; // Stop searching if item is found
            }
        }
    
        if (!item) return []; // No matching item, return empty array
    }
    

    // Bill No Search (Exact Match, but Convert to Number if Needed)
    if (filters.billNo && !isNaN(filters.billNo)) {
        const invoice = await InvoiceModel.findOne({ billNo: Number(filters.billNo) });

        if (!invoice) return []; // No matching invoice, return empty array
        query.invoice = invoice._id;
    }

    // Filter by Class (Case-Insensitive)
    if (filters.class) {
        query.class = { $regex: `^${filters.class}$`, $options: 'i' };
    }

    // Filter by Created At (Date)
    if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        query.createdAt = {
            $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
            $lte: new Date(date.setHours(23, 59, 59, 999)) // End of the day
        };
    }

    // Fetch inwards
    const inwards = await InwardsModel.find(query)
        .populate('vendor', 'name code')
        .populate('createdBy', 'name')
        .populate('invoice', 'billNo billDate')
        .lean(); // Convert to plain objects

        // Fetch full item details dynamically
        await Promise.all(inwards.map(async (inward) => {
            if (inward.class && inward.item) {
            console.log(inward.class)
            inward.item = await getItemDetails(inward.item, inward.class);
        }
    }));

  

    return inwards;
};





// ✅ Update an Inward Entry
exports.updateInward = async (inwardId, updateData) => {
    const inward = await InwardsModel.findById(inwardId);
    if (!inward) throw new Error('Inward entry not found');

    // Update vendor if provided
    if (updateData.vendor) {
        const vendor = await VendorModel.findOne({ code: updateData.vendor });
        if (!vendor) throw new Error(`Vendor with code ${updateData.vendor} not found`);
        updateData.vendor = vendor._id;
    }
    // Update item if provided
    if (updateData.item) {
        updateData.item = await getItemId(updateData.item, updateData.class);
    }

    // Update invoice if provided
    if (updateData.invoice) {
        const invoice = await InvoiceModel.findOne({ billNo: updateData.invoice });
        if (!invoice) throw new Error(`Invoice with bill number ${updateData.invoice} not found`);
        updateData.invoice = invoice._id;
    }

    return await InwardsModel.findByIdAndUpdate(inwardId, updateData, { new: true });
};

// ✅ Delete an Inward Entry
exports.deleteInward = async (inwardId) => {
    const inward = await InwardsModel.findById(inwardId);
    if (!inward) throw new Error('Inward entry not found');

    return await InwardsModel.findByIdAndDelete(inwardId);
};
