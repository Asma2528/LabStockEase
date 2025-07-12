const express = require('express');
const Authentication = require('../middlewares/Authentication');
const InwardsController = require('../controllers/InwardsController');
const InwardsValidation = require('../validations/Inwards.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create Inward
router.post(
    '/create',
    InwardsValidation.CreateInward, // Validate request body
    Validation,
    InwardsController.createInward
);

// Get All Inwards (with Search)
router.get('/all', 
    Validation,
 InwardsController.getAllInwards);

// Get Inward by ID
router.get(
    '/:id',
    InwardsValidation.Params_id,
    Validation,
    InwardsController.getInwardById
);

// Update Inward
router.patch(
    '/update/:id',
    InwardsValidation.Params_id,
    InwardsValidation.UpdateInward,
    Validation,
    InwardsController.updateInward
);


// Delete Inward
router.delete(
    '/delete/:id',
    InwardsValidation.Params_id,
    Validation,
    InwardsController.deleteInward
);

module.exports = router;
