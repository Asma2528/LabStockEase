const express = require('express');
const Authentication = require('../middlewares/Authentication');
const VendorsController = require('../controllers/VendorsController');
const VendorValidation = require('../validations/Vendors.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);


router.post(
    '/create',
    VendorValidation.RegisterVendor, // Validate request body
    Validation, // General validation middleware
    VendorsController.createVendor
);


router.get(
    '/all',
    Validation,
    VendorsController.getAllVendors
);




router.patch(
    '/update/:id',
    VendorValidation.Params_id, // Validate ID parameter
    VendorValidation.UpdateVendor, // Validate request body
    Validation,
    VendorsController.updateVendor
);


router.delete(
    '/delete/:id',
    VendorValidation.Params_id, // Validate ID parameter
    Validation,
    VendorsController.deleteVendor
);

module.exports = router;
