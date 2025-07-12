const express = require('express');
const Authentication = require('../middlewares/Authentication');
const PracticalsController = require('../controllers/PracticalController');
const PracticalValidation = require('../validations/Practical.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create Practical
router.post(
    '/create',
    PracticalValidation.CreatePractical,  // Validate request body
    Validation,
    PracticalsController.createPractical
);

// Get All Practicals (with Search)
router.get('/all', Validation, PracticalsController.getAllPracticals);

// Get Practical by ID
router.get(
    '/:id',
    PracticalValidation.Params_id,
    Validation,
    PracticalsController.getPracticalById
);

// Update Practical
router.patch(
    '/update/:id',
    PracticalValidation.Params_id,
    PracticalValidation.UpdatePractical,
    Validation,
    PracticalsController.updatePractical
);

// Delete Practical
router.delete(
    '/delete/:id',
    PracticalValidation.Params_id,
    Validation,
    PracticalsController.deletePractical
);

module.exports = router;
