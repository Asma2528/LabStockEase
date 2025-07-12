const { body, param } = require('express-validator');

class PracticalValidation {
    // Validation for creating a practical
    static CreatePractical = [
        body('description')
        .isString().withMessage('Description must be a string'),
        body('practicalDate')
            .isISO8601().withMessage('Practical Date must be a valid date'),
        body('sanctionDate')
            .isISO8601().withMessage('Sanction Date must be a valid date'),
        body('practicalPeriod')
            .isString().withMessage('Practical Period must be a string'),
        body('fundingAgency')
            .isString().withMessage('Funding Agency must be a string'),
        body('practicalCost')
            .isNumeric().withMessage('Practical Cost must be a number'),
        body('fundStatus')
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('practicalInCharge')
            .isString().withMessage('Practical InCharge must be a string'),
        body('practicalStatus')
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Practical Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('practicalProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Practical Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for updating a practical
    static UpdatePractical = [
        body('fundStatus')
            .optional()
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('practicalStatus')
            .optional()
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Practical Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('practicalProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Practical Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for getting a practical by ID
    static Params_id = [
        param('id')
            .isMongoId().withMessage('Provide a valid Practical ID')
    ];
}

module.exports = PracticalValidation;
