const express = require('express');
const Authentication = require('../middlewares/Authentication');
const InvoiceController = require('../controllers/InvoiceController');
const InvoiceValidation = require('../validations/Invoice.validation');
const Validation = require('../middlewares/Validation');
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(Authentication);

// Create Invoice
router.post(
    '/create',
    InvoiceValidation.CreateInvoice, // Validate request body
    Validation,
    InvoiceController.createInvoice
);

// Get All Invoices (with Search)
router.get('/all', 
    Validation,
 InvoiceController.getAllInvoices);

// Get Invoice by ID
router.get(
    '/:id',
    InvoiceValidation.Params_id,
    Validation,
    InvoiceController.getInvoiceById
);

// Update Invoice
router.patch(
    '/update/:id',
    InvoiceValidation.Params_id,
    InvoiceValidation.UpdateInvoice,
    Validation,
    InvoiceController.updateInvoice
);

// Approve Invoice (Status Change)
router.patch(
    '/approve/:id',
    roleMiddleware(['admin','manager']),
    InvoiceValidation.Params_id,
    InvoiceValidation.ApproveInvoice,
    Validation,
    InvoiceController.approveInvoice
);

// Delete Invoice
router.delete(
    '/delete/:id',
    InvoiceValidation.Params_id,
    Validation,
    InvoiceController.deleteInvoice
);



module.exports = router;