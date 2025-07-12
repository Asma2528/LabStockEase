const express = require('express');
const Authentication = require('../middlewares/Authentication');
const OthersController = require('../controllers/OtherController');
const OtherValidation = require('../validations/Other.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create Other
router.post(
    '/create',
    OtherValidation.CreateOther,  // Validate request body
    Validation,
    OthersController.createOther
);

// Get All Others (with Search)
router.get('/all', Validation, OthersController.getAllOthers);

// Get Other by ID
router.get(
    '/:id',
    OtherValidation.Params_id,
    Validation,
    OthersController.getOtherById
);

// Update Other
router.patch(
    '/update/:id',
    OtherValidation.Params_id,
    OtherValidation.UpdateOther,
    Validation,
    OthersController.updateOther
);

// Delete Other
router.delete(
    '/delete/:id',
    OtherValidation.Params_id,
    Validation,
    OthersController.deleteOther
);

module.exports = router;
