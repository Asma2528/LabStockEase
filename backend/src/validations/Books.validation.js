const { body, param } = require('express-validator');

class BooksValidation {
    /**
     * Validation for registering a new book
     */
    static RegisterBooks = [
        body('item_name').notEmpty().withMessage('Item Name cannot be empty'),
        body('author').notEmpty().withMessage('Author cannot be empty'),
        body('publisher').notEmpty().withMessage('Publisher cannot be empty'),
        body('edition').optional().isString().withMessage('Edition must be a string'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('location').notEmpty().withMessage('Location cannot be empty'),
    ];

    /**
     * Validation for restocking books
     */
    static RestockBook = [
        body('inward').notEmpty().withMessage('Inward reference is required'),
        body('quantity_purchased').isInt({ gt: 0 }).withMessage('Quantity purchased must be a positive integer'),
    ];


    static LogIssuedQuantity = [
        body('request_model').isString().notEmpty().withMessage('Request Type is required'),
        body('request').notEmpty().withMessage('Request is required'),
        body('item_id')
            .isMongoId().withMessage('Item ID must be a valid MongoDB ID')
            .notEmpty().withMessage('Item ID is required'),
        body('issued_quantity')
            .isInt({ gte: 0 }).withMessage('Issued quantity must be a non-negative integer')
            .notEmpty().withMessage('Issued quantity is required'),
        body('date_issued')
            .isISO8601().withMessage('Issued date must be a valid date')
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
        body('date_issued')
            .isISO8601().withMessage('Issued date must be a valid date'),

    ];

    /**
     * Validation for ID parameters
     */
    static Params_id = [
        param('id').isMongoId().withMessage('Provide a valid ID')
    ];
}

module.exports = BooksValidation;
