const httpStatus = require('http-status');
const InvoiceService = require('../services/Invoice.service');
const CatchAsync = require('../utils/CatchAsync');

// ✅ Create Invoice (Auto-Generates `invoiceNumber`)
exports.createInvoice = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error("User ID is missing in the request.");
        return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const invoiceData = { ...req.body, createdBy: userId };
    const newInvoice = await InvoiceService.createInvoice(invoiceData);

    return res.status(httpStatus.CREATED).json({ msg: 'Invoice created successfully', newInvoice });
});

// ✅ Get All Invoices (with Search & Filters)
exports.getAllInvoices = CatchAsync(async (req, res) => {
    const invoices = await InvoiceService.getAllInvoices(req.query);
    return res.status(httpStatus.OK).json({ invoices });
});

// ✅ Get Invoice by ID
exports.getInvoiceById = CatchAsync(async (req, res) => {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Invoice not found' });
    return res.status(httpStatus.OK).json({ invoice });
});

// ✅ Update Invoice (Prevents Editing `invoiceNumber`)
exports.updateInvoice = CatchAsync(async (req, res) => {
    const updatedInvoice = await InvoiceService.updateInvoice(req.params.id, req.body);
    if (!updatedInvoice) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Invoice not found' });
    return res.status(httpStatus.OK).json({ msg: 'Invoice updated successfully', updatedInvoice });
});

// ✅ Approve Invoice (Change Status & Set `approvedBy`)
exports.approveInvoice = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error("User ID is missing in the request.");
        return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const approvedInvoice = await InvoiceService.approveInvoice(req.params.id, req.body.status, userId,req.body.remark);
    return res.status(httpStatus.OK).json({ msg: 'Invoice status updated', approvedInvoice });
});

// ✅ Delete Invoice
exports.deleteInvoice = CatchAsync(async (req, res) => {

    await InvoiceService.deleteInvoice(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Invoice deleted successfully' });
});


 