const { body, param } = require('express-validator');

class OrderValidation {
    static CreateOrder = [
        body('categoryType')
        .notEmpty().withMessage('Category Type is required')
        .isString().withMessage('Category Type must be a string'),

        body('category')
            .notEmpty().withMessage('Category is required')
            .isMongoId().withMessage('Invalid Category ID'),
        
        body('vendor')
            .notEmpty().withMessage('Vendor is required')
            .isMongoId().withMessage('Invalid Vendor ID'),
        
        body('quotationRefNo')
            .notEmpty().withMessage('Quotation Ref No is required')
            .isString().withMessage('Quotation Ref No must be a string'),
        
        body('quotationDate')
            .notEmpty().withMessage('Quotation Date is required')
            .isISO8601().withMessage('Quotation Date must be a valid date'),

        body('items')
            .isArray({ min: 1 }).withMessage('At least one item is required'),

        body('items.*.entryNo')
            .notEmpty().withMessage('Entry Number is required')
            .isNumeric().withMessage('Entry Number must be a number'),

        body('items.*.description')
            .notEmpty().withMessage('Description is required')
            .isString().withMessage('Description must be a string'),

        body('items.*.item')
            .notEmpty().withMessage('Item ID is required'),

        body('items.*.class')
            .notEmpty().withMessage('Item class is required')
            .isIn(['Chemicals', 'Books', 'Glasswares', 'Consumables', 'Equipments', 'Others'])
            .withMessage('Invalid Item Class'),

        body('items.*.quantity')
            .notEmpty().withMessage('Quantity is required')
            .isNumeric().withMessage('Quantity must be a number'),

        body('items.*.rate')
            .notEmpty().withMessage('Rate is required')
            .isNumeric().withMessage('Rate must be a number'),

        body('items.*.discount')
            .optional()
            .isNumeric().withMessage('Discount must be a number'),

        body('items.*.taxGST')
            .optional()
            .isNumeric().withMessage('Tax GST must be a number'),

        body('items.*.cost')
            .notEmpty().withMessage('Cost is required')
            .isNumeric().withMessage('Cost must be a number'),

            
        body('totalCost')
        .notEmpty().withMessage('Total Cost is required')
        .isNumeric().withMessage('Total Cost must be a number'),

        body('totalGST')
        .notEmpty().withMessage('Total GST is required')
        .isNumeric().withMessage('Total GST must be a number'),

        body('grandTotal')
        .notEmpty().withMessage('Grand total is required')
        .isNumeric().withMessage('Grand total must be a number'),
    ];

    // ✅ Validation for Updating an Order
    static UpdateOrder = [
        param('id').isMongoId().withMessage('Invalid Order ID'),

        body('status')
            .optional()
            .isIn(['Pending', 'Placed', 'Received', 'Approved', 'Rejected'])
            .withMessage('Invalid status value'),

        body('quotationDate')
            .optional()
            .isISO8601().withMessage('Quotation Date must be a valid date'),

        body('totalCost')
            .optional()
            .isNumeric().withMessage('Total Cost must be a number'),

        body('totalGST')
            .optional()
            .isNumeric().withMessage('Total GST must be a number'),

        body('grandTotal')
            .optional()
            .isNumeric().withMessage('Grand Total must be a number'),
    ];

    // ✅ Validation for Approving an Order
    static ApproveOrder = [
        param('id').isMongoId().withMessage('Invalid Order ID'),
        
        body('status')
            .notEmpty().withMessage('Status is required')
            .isIn(['Approved', 'Rejected'])
            .withMessage('Status must be Approved or Rejected'),

             
                   body("remark")
                .optional()
                .isString().withMessage("Remark must be a string if provided")
                .trim(),
    ];

    // ✅ Validation for Getting an Order by ID
    static Params_id = [
        param('id').isMongoId().withMessage('Provide a valid Order ID'),
    ];
}

module.exports = OrderValidation;
