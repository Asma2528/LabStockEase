const express = require('express');
const Authentication = require('../middlewares/Authentication');
const GeneralsController = require('../controllers/GeneralController');
const GeneralValidation = require('../validations/General.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create General
router.post(
    '/create',
    GeneralValidation.CreateGeneral,  // Validate request body
    Validation,
    GeneralsController.createGeneral
);

// Get All Generals (with Search)
router.get('/all', Validation, GeneralsController.getAllGenerals);

// Get General by ID
router.get(
    '/:id',
    GeneralValidation.Params_id,
    Validation,
    GeneralsController.getGeneralById
);

// Update General
router.patch(
    '/update/:id',
    GeneralValidation.Params_id,
    GeneralValidation.UpdateGeneral,
    Validation,
    GeneralsController.updateGeneral
);

// Delete General
router.delete(
    '/delete/:id',
    GeneralValidation.Params_id,
    Validation,
    GeneralsController.deleteGeneral
);

module.exports = router;
