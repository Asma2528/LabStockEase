const InvoiceModel = require('../models/invoice.models');
const OrderService = require('./Orders.service');
const { createNotification } = require('./Notification.service');
const UserModel = require('../models/user.models');
const mongoose = require('mongoose');
const OrderModel = require('../models/order.models');

const getOrderId = async (filters) => {
    const { poNumber, orderNumber } = filters;

    const query = {};
    if (poNumber) {
        query.poNumber = { $regex: new RegExp(poNumber, 'i') }; // Proper case-insensitive regex
    }
    if (orderNumber) {
        query.orderNumber = { $regex: new RegExp(orderNumber, 'i') };
    }

    console.log("Searching order with:", query);  // Debug log
    const order = await OrderModel.findOne(query); // Use `OrderModel.findOne` directly

    if (!order) {
        throw new Error('Order not found with the provided poNumber or orderNumber');
    }
    return order;
};


// Create an Invoice
exports.createInvoice = async (invoiceData) => {
    // Fetch order ID based on provided orderNumber or poNumber
    const order = await getOrderId(invoiceData);

    // Ensure that the invoiceStatus is set to "Pending" if not provided
    const invoiceDataWithStatus = {
        ...invoiceData,
        status: invoiceData.status || "Pending", // Default to "Pending" if no status is provided
    };

    // Prepare invoice data and create the invoice
    const newInvoice = await InvoiceModel.create({
        ...invoiceDataWithStatus, // Use the updated data with the "Pending" status
        order: order._id,  // Link to the order
    });

    // Create notification for invoice creation
    const user = await UserModel.findById(invoiceData.createdBy);
    if (user) {
        const message = `Invoice for Bill Number ${newInvoice.billNo} has been created for Order ${order.orderNumber}`;
        await createNotification({
            userId: user._id,
            title: "Invoice Created",
            message,
            send_to: ["admin", "manager"],  // Send notifications to specific roles
            type: "createInvoice",
        });
    }

    return newInvoice;
};

// Approve an Invoice
// Approve an Invoice
exports.approveInvoice = async (invoiceId, status, userId,remark) => {


    // Update invoice status and approvedBy field
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        { status: status, approvedBy: userId, approved_at: new Date(),remark:remark },
        { new: true }
    );

    if (!updatedInvoice) {
        throw new Error('Invoice not found');
    }

    // Fetch the order linked to the invoice
    const order = await OrderModel.findById(updatedInvoice.order); 

    if (!order) {
        throw new Error('Order not found for this invoice');
    }

    // Create notification for invoice approval
    const user = await UserModel.findById(userId);
    if (user) {
        const message = `Invoice for Bill Number ${updatedInvoice.billNo} for Order ${order.orderNumber} has been ${updatedInvoice.status}.`;
        await createNotification({
            userId: user._id,
            title: `Invoice ${updatedInvoice.status}`,
            message,
            send_to: ["admin", "manager"],
            type: "approveInvoice",
        });
    }

    return updatedInvoice;
};

exports.getAllInvoices = async (filters = {}) => {
    const matchStage = {};

    // Direct invoice filters
    if (filters.billNo) {
        matchStage.billNo = Number(filters.billNo);
    }

    if (filters.status) {
        matchStage.status = filters.status;
    }

    if (filters.billDate) {
        const parsedDate = new Date(filters.billDate);
        if (!isNaN(parsedDate)) {
            matchStage.billDate = {
                $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
                $lte: new Date(parsedDate.setHours(23, 59, 59, 999))
            };
        }
    }

    const pipeline = [
        { $match: matchStage },

        // Lookup Order
        {
            $lookup: {
                from: 'orders',
                localField: 'order',
                foreignField: '_id',
                as: 'order'
            }
        },
        { $unwind: '$order' },

        // Lookup Vendor inside Order
        {
            $lookup: {
                from: 'vendors',
                localField: 'order.vendor',
                foreignField: '_id',
                as: 'order.vendor'
            }
        },
        { $unwind: '$order.vendor' },

        // Filter by vendor name, poNumber, or orderNumber
        {
            $match: {
                ...(filters.vendorName && {
                    'order.vendor.name': {
                        $regex: filters.vendorName,
                        $options: 'i'
                    }
                }),
                ...(filters.orderNumber && {
                    'order.orderNumber': {
                        $regex: filters.orderNumber,
                        $options: 'i'
                    }
                }),
                ...(filters.poNumber && {
                    'order.poNumber': {
                        $regex: filters.poNumber,
                        $options: 'i'
                    }
                })
            }
        },

        // Lookup createdBy
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },

        // Lookup approvedBy
        {
            $lookup: {
                from: 'users',
                localField: 'approvedBy',
                foreignField: '_id',
                as: 'approvedBy'
            }
        },
        { $unwind: { path: '$approvedBy', preserveNullAndEmptyArrays: true } },

        // Optional: project final result shape
        {
            $project: {
                billNo: 1,
                billDate: 1,
                invoiceAmount: 1,
                status: 1,
                approved_at: 1,
                comment: 1,
                remark: 1,
                createdAt: 1,
                updatedAt: 1,
                'order._id': 1,
                'order.orderNumber': 1,
                'order.poNumber': 1,
                'order.vendor._id': 1,
                'order.vendor.name': 1,
                'createdBy._id': 1,
                'createdBy.name': 1,
                'approvedBy._id': 1,
                'approvedBy.name': 1
            }
        }
    ];

    const invoices = await InvoiceModel.aggregate(pipeline);

    return invoices;
};


// exports.getAllInvoices = async (filters = {}) => {
//     const query = {};

//     if (filters.billNo) {
//         query.billNo = filters.billNo;
//     }
//     if (filters.status) {
//         query.status = filters.status;
//     }
//     if (filters.billDate) {
//         const parsedDate = new Date(filters.billDate);
//         if (!isNaN(parsedDate)) {
//             query.billDate = { 
//                 $gte: new Date(parsedDate.setHours(0, 0, 0, 0)), 
//                 $lte: new Date(parsedDate.setHours(23, 59, 59, 999)) 
//             };
//         }
//     }

//     let invoices = await InvoiceModel.find(query)
//         .populate('order', 'orderNumber poNumber')
//         .populate('createdBy', 'name')
//         .populate('approvedBy', 'name');

//     // ✅ Apply filtering after population
//     if (filters.orderNumber || filters.poNumber) {
//         invoices = invoices.filter(invoice => {
//             const order = invoice.order;
//             return order && (
//                 (!filters.orderNumber || order.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) &&
//                 (!filters.poNumber || order.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase()))
//             );
//         });
//     }

//     return invoices;
// };



exports.getInvoiceById = async (invoiceId) => {
    const invoice = await InvoiceModel.findById(invoiceId)
        .populate('order', 'orderNumber poNumber')
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name');
    
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
};

// Update Invoice (Prevents editing invoiceNumber)
exports.updateInvoice = async (invoiceId, updateData) => {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    if ('billNo' in updateData) {
        delete updateData.billNo; // Prevent editing the billNo
    }

    // Update invoice fields
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(invoiceId, updateData, { new: true });
    return updatedInvoice;
};

// Delete Invoice
exports.deleteInvoice = async (invoiceId) => {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    // Delete the invoice
    await InvoiceModel.findByIdAndDelete(invoiceId);
    return { message: 'Invoice deleted successfully' };
};
