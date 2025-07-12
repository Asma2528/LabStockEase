const { body, param } = require('express-validator');

class ProjectValidation {
    // Validation for creating a project
    static CreateProject = [
        body('description')
        .isString().withMessage('Description must be a string'),
        body('projectDate')
            .notEmpty().withMessage('Project Date is required')
            .isISO8601().withMessage('Project Date must be a valid date'),
        body('sanctionDate')
            .notEmpty().withMessage('Sanction Date is required')
            .isISO8601().withMessage('Sanction Date must be a valid date'),
        body('projectPeriod')
            .notEmpty().withMessage('Project Period is required')
            .isString().withMessage('Project Period must be a string'),
        body('fundingAgency')
            .notEmpty().withMessage('Funding Agency is required')
            .isString().withMessage('Funding Agency must be a string'),
        body('projectCost')
            .notEmpty().withMessage('Project Cost is required')
            .isNumeric().withMessage('Project Cost must be a number'),
        body('fundStatus')
            .notEmpty().withMessage('Fund Status is required')
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('projectInCharge')
            .notEmpty().withMessage('Project InCharge is required')
            .isString().withMessage('Project InCharge must be a string'),
        body('projectStatus')
            .notEmpty().withMessage('Project Status is required')
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Project Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('projectProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Project Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for updating a project
    static UpdateProject = [
        body('fundStatus')
            .optional()
            .isIn(['Pending', 'Approved', 'Released', 'Completed'])
            .withMessage('Fund Status must be one of Pending, Approved, Released, Completed'),
        body('projectStatus')
            .optional()
            .isIn(['Ongoing', 'Completed', 'On Hold', 'Cancelled'])
            .withMessage('Project Status must be one of Ongoing, Completed, On Hold, Cancelled'),
        body('projectProcurements')
            .optional()  // It can be an empty array or not provided
            .isArray().withMessage('Project Procurements must be an array')
            .custom((value) => {
                // Check if all elements in the array are valid ObjectIds
                if (value && !value.every(item => mongoose.Types.ObjectId.isValid(item))) {
                    throw new Error('Each procurement must be a valid MongoDB ObjectId');
                }
                return true;
            })
    ];

    // Validation for getting a project by ID
    static Params_id = [
        param('id')
            .isMongoId().withMessage('Provide a valid Project ID')
    ];
}

module.exports = ProjectValidation;
