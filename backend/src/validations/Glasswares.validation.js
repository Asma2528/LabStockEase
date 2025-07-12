const { body, param } = require('express-validator');

class GlasswareValidation {
    /**
     * Validation for registering a new glassware item
     */
    static RegisterGlasswares = [
        body('item_name').notEmpty().withMessage('Item name cannot be empty'),
        body('company').optional().isString().withMessage('Company must be a string'),
        body('purpose').optional().isString().withMessage('Purpose must be a string'),
        body('min_stock_level').isInt({ gte: 0 }).withMessage('Minimum stock level must be a non-negative integer'),
        body('unit_of_measure').notEmpty().withMessage('Unit of measure cannot be empty'),
        body('description').optional().isString().withMessage('Description must be a string'),
    ];

    /**
     * Validation for restocking glassware inventory
     */
    static RestockGlasswares = [
        body('inward').notEmpty().withMessage('Inward reference is required'),
        body('glassware').isMongoId().withMessage('Invalid Glassware ID'),
        body('quantity_purchased').isInt({ gt: 0 }).withMessage('Quantity purchased must be a positive integer'),
        body('location').optional().isString().withMessage('Location must be a string'),
    ];

    /**
     * Validation for logging issued glassware
     */
    static LogIssuedQuantity = [
        body('request_model').isString().notEmpty().withMessage('Request Type is required'),
        body('request').notEmpty().withMessage('Request is required'),
        body('item_id')
            .isMongoId().withMessage('Item ID must be a valid MongoDB ID')
            .notEmpty().withMessage('Item ID is required'),
        body('issued_quantity')
            .isInt({ gte: 0 }).withMessage('Issued quantity must be a non-negative integer')
            .notEmpty().withMessage('Issued quantity is required'),
        body('returned_quantity')
            .optional().isInt({ gte: 0 }).withMessage('Returned quantity must be a non-negative integer'),
        body('lost_or_damaged_quantity')
            .optional().isInt({ gte: 0 }).withMessage('Lost or damaged quantity must be a non-negative integer'),
        body('date_issued')
            .isISO8601().withMessage('Issued date must be a valid date'),
        body('date_returned')
            .optional().isISO8601().withMessage('Returned date must be a valid date'),
        body('user_email')
            .isEmail().withMessage('User email must be a valid email')
            .notEmpty().withMessage('User email is required'),
    ];


    
    static LogUpdateIssuedQuantity = [
        body('request_model').isString().optional(),
        body('request').optional(),
        body('item_id')
            .isMongoId().withMessage('Item ID must be a valid MongoDB ID')
            .notEmpty().withMessage('Item ID is required'),
        body('issued_quantity')
            .isInt({ gte: 0 }).withMessage('Issued quantity must be a non-negative integer')
            .optional(),
        body('returned_quantity')
            .optional().isInt({ gte: 0 }).withMessage('Returned quantity must be a non-negative integer'),
        body('lost_or_damaged_quantity')
            .optional().isInt({ gte: 0 }).withMessage('Lost or damaged quantity must be a non-negative integer'),
        body('date_issued')
            .isISO8601().withMessage('Issued date must be a valid date'),
        body('date_returned')
            .optional().isISO8601().withMessage('Returned date must be a valid date'),
    ];



    /**
     * Validation for ID parameters
     */
    static Params_id = [
        param('id').isMongoId().withMessage('Provide a valid ID')
    ];
}

module.exports = GlasswareValidation;
