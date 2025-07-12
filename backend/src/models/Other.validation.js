const { body, param } = require('express-validator');

class OtherValidation {
    // Validation for creating a other
    static CreateOther = [
        body('description')
        .isString().withMessage('Description must be a string'),
        body('otherDate')
            .isISO8601().withMessage('Other Date must be a valid date'),
        body('sanctionDate')
            .isISO8601().withMessage('Sanction Date must be a valid date'),
        body('otherPeriod')
            .isString().withMessage('Other Period must be a string'),
        body('fundingAgency')
            .isString().withMessage('Funding Agency must be a string'),
        body('otherCost')
            .isNumeric().withMessage('Other Cost must be a number'),
        body('fundStatus')
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('otherInCharge')
            .isString().withMessage('Other InCharge must be a string'),
        body('otherStatus')
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Other Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('otherProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Other Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for updating a other
    static UpdateOther = [
        body('fundStatus')
            .optional()
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('otherStatus')
            .optional()
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Other Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('otherProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Other Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for getting a other by ID
    static Params_id = [
        param('id')
            .isMongoId().withMessage('Provide a valid Other ID')
    ];
}

module.exports = OtherValidation;
