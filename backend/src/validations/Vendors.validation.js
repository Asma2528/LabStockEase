const { body, param } = require('express-validator');

class VendorValidation {
    // Validation for registering a new vendor
    static RegisterVendor = [
        body('name')
            .notEmpty().withMessage('Vendor name is required')
            .isString().withMessage('Vendor name must be a string'),
        body('email')
            .notEmpty().withMessage('Vendor email is required')
            .isString().withMessage('Vendor email must be a string'),
        body('contact_person')
            .notEmpty().withMessage('Contact person is required')
            .isString().withMessage('Contact person must be a string'),
        body('contact_no')
            .notEmpty().withMessage('Contact number is required')
            .isString().withMessage('Contact number must be a string'),
        body('classification')
            .notEmpty().withMessage('Classification is required')
            .isIn(['Capital', 'Consumables', 'Chemical', 'Glassware', 'Books', 'Others'])
            .withMessage('Classification must be one of the specified values'),
        body('tan_pan_no')
            .optional()
            .isString().withMessage('TAN/PAN number must be a string'),
        body('gst_no')
            .optional()
            .isString().withMessage('GST number must be a string'),
        body('grading')
            .notEmpty().withMessage('Vendor grading is required')
            .isIn(['A', 'B', 'C', 'D', 'E'])
            .withMessage('Grading must be one of A, B, C, D, E'),
        body('address')
            .notEmpty().withMessage('Address is required')
            .isString().withMessage('Address must be a string')
    ];

    // Validation for updating an existing vendor
    static UpdateVendor = [
        body('name')
            .optional()
            .isString().withMessage('Vendor name must be a string'),
        body('email')
            .optional()
            .isString().withMessage('Vendor email must be a string'),
        body('contact_person')
            .optional()
            .isString().withMessage('Contact person must be a string'),
        body('contact_no')
            .optional()
            .isString().withMessage('Contact number must be a string'),
        body('classification')
            .optional()
            .isIn(['Capital', 'Consumables', 'Chemical', 'Glassware', 'Books', 'Others'])
            .withMessage('Classification must be one of the specified values'),
        body('tan_pan_no')
            .optional()
            .isString().withMessage('TAN/PAN number must be a string'),
        body('gst_no')
            .optional()
            .isString().withMessage('GST number must be a string'),
        body('grading')
            .optional()
            .isIn(['A', 'B', 'C', 'D', 'E'])
            .withMessage('Grading must be one of A, B, C, D, E'),
        body('address')
            .optional()
            .isString().withMessage('Address must be a string')
    ];

    // Validation for getting a vendor by ID
    static Params_id = [
        param('id')
            .isMongoId().withMessage('Provide a valid Vendor ID')
    ];
}

module.exports = VendorValidation;
