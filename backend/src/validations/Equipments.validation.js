const { body, param } = require('express-validator');

class EquipmentsValidation {
    static RegisterEquipments = [
        body('item_name').notEmpty().withMessage('Item name cannot be empty'),
        body('manual').notEmpty().withMessage('Manual cannot be empty'),
        body('model_number').optional().isString().withMessage('Model number must be a string'),
        body('serial_number').optional().isString().withMessage('Serial number must be a string'),
        body('company').notEmpty().withMessage('Company/Brand cannot be empty'),
        body('purpose').optional().isString().withMessage('Purpose must be a string'),
        body('min_stock_level').isInt({ gte: 0 }).withMessage('Minimum stock level must be a non-negative integer'),
        body('unit_of_measure').notEmpty().withMessage('Unit of measure cannot be empty'),
        body('description').optional().isString().withMessage('Description must be a string'),
    ];

    static RestockEquipment = [
        body('inward').notEmpty().withMessage('Inward is required'),
        body('equipment').optional().isMongoId().withMessage('Invalid Equipment ID'),
        body('quantity_purchased').isInt({ gt: 0 }).withMessage('Quantity purchased must be a positive integer'),
        body('expiration_date').optional().isISO8601().withMessage('Expiration date must be a valid date'),
        body('location').optional().isString().withMessage('Location must be a string'),
        body('maintenance_date').optional().isISO8601().withMessage('Maintenance date must be a valid date'),
        body('maintenance_details').optional().isString().withMessage('Maintenance details must be a string'),
    ];

    static LogIssuedQuantity = [
        body('request_model').isString().notEmpty().withMessage('Request Type is required'),
        body('request').notEmpty().withMessage('Request is required'),
        body('item')
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


    static Params_id = [
        param('id').isMongoId().withMessage('Provide a valid ID')
    ];
}

module.exports = EquipmentsValidation;
