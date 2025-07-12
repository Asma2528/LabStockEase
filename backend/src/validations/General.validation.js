const { body, param } = require('express-validator');

class GeneralValidation {
    // Validation for creating a general
    static CreateGeneral = [
          body('description')
                .isString().withMessage('Description must be a string'),
        body('generalDate')
            .isISO8601().withMessage('General Date must be a valid date'),
        body('sanctionDate')
            .isISO8601().withMessage('Sanction Date must be a valid date'),
        body('generalPeriod')
            .isString().withMessage('General Period must be a string'),
            body('description')
            .isString().withMessage('Description must be a string'),
        body('fundingAgency')
            .isString().withMessage('Funding Agency must be a string'),
        body('generalCost')
            .isNumeric().withMessage('General Cost must be a number'),
        body('fundStatus')
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('generalInCharge')
            .isString().withMessage('General InCharge must be a string'),
        body('generalStatus')
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('General Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('generalProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('General Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for updating a general
    static UpdateGeneral = [
        body('fundStatus')
            .optional()
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('generalStatus')
            .optional()
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('General Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('generalProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('General Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for getting a general by ID
    static Params_id = [
        param('id')
            .isMongoId().withMessage('Provide a valid General ID')
    ];
}

module.exports = GeneralValidation;
