const { body, param } = require('express-validator');

class InwardValidation {
    // ✅ Validation for Creating an Inward
    static CreateInward = [

        // Validation for each item in the array
        body('class')
            .isIn(['Chemicals', 'Books', 'Glasswares', 'Consumables', 'Equipments', 'Others'])
            .withMessage('Invalid class type'),

        body('item')
            .isMongoId()
            .withMessage('Invalid item ID'),

        body('description')
            .isString()
            .notEmpty()
            .withMessage('Description is required'),

        body('grade')
            .optional()
            .isIn(["AR", "LR", "GR", "COM", "HPLC"])
            .withMessage('Invalid grade'),

            body('casNo')
            .optional()
            .isString()
            .withMessage('CAS No must be a string'),
        

        body('quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),

        body('unit')
            .isIn(["Nos", "ml", "L", "kg", "g", "Box"])
            .withMessage('Invalid unit'),

        body('thClass')
            .optional()
            .isIn([
                "E - Explosive",
                "O - Oxidizing",
                "F - Flammable",
                "F+ - Extremely Flammable",
                "T - Toxic",
                "T+ - Very Toxic",
                "Xn - Harmful",
                "Xi - Irritant",
                "C - Carcinogen",
                "Ter - Teratogen",
                "Mut - Mutagen"
            ])
            .withMessage('Invalid TH Class'),

        body('vendor')
            .isMongoId()
            .withMessage('Invalid Vendor ID'),

        body('invoice')
            .isMongoId()
            .withMessage('Invalid Invoice ID'),

    ];

    // ✅ Validation for Updating an Inward
    static UpdateInward = [
        param('id').isMongoId().withMessage('Provide a valid Inward ID'),


        body('class')
            .optional()
            .isIn(['Chemicals', 'Books', 'Glasswares', 'Consumables', 'Equipments', 'Others'])
            .withMessage('Invalid class type'),

        body('item')
            .optional(),

        body('description')
            .optional()
            .isString()
            .notEmpty()
            .withMessage('Description is required'),

        body('grade')
            .optional()
            .isIn(["AR", "LR", "GR", "COM", "HPLC"])
            .withMessage('Invalid grade'),
            body('casNo')
            .optional()
            .isString()
            .withMessage('CAS No must be a string'),
        
        

        body('quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),

        body('unit')
            .optional()
            .isIn(["Nos", "ml", "L", "kg", "g", "Box"])
            .withMessage('Invalid unit'),

        body('thClass')
            .optional()
            .isIn([
                "E - Explosive",
                "O - Oxidizing",
                "F - Flammable",
                "F+ - Extremely Flammable",
                "T - Toxic",
                "T+ - Very Toxic",
                "Xn - Harmful",
                "Xi - Irritant",
                "C - Carcinogen",
                "Ter - Teratogen",
                "Mut - Mutagen"
            ])
            .withMessage('Invalid TH Class'),

        body('vendor')
            .optional(),

        body('invoice')
            .optional(),

    ];

    // ✅ Validation for Getting an Inward by ID
    static Params_id = [
        param('id').isMongoId().withMessage('Provide a valid Inward ID'),
    ];
}

module.exports = InwardValidation;
