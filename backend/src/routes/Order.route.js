const express = require('express');
const Authentication = require('../middlewares/Authentication');
const OrdersController = require('../controllers/OrdersController');
const OrderValidation = require('../validations/Order.validation');
const Validation = require('../middlewares/Validation');

const router = express.Router();

router.use(Authentication);

// Create Order
router.post(
    '/create',
    OrderValidation.CreateOrder, // Validate request body
    Validation,
    OrdersController.createOrder
);

// Get All Orders (with Search)
router.get('/all', 
    Validation,
 OrdersController.getAllOrders);

// Get Order by ID
router.get(
    '/:id',
    OrderValidation.Params_id,
    Validation,
    OrdersController.getOrderById
);

// Update Order
router.patch(
    '/update/:id',
    OrderValidation.Params_id,
    OrderValidation.UpdateOrder,
    Validation,
    OrdersController.updateOrder
);

// Approve Order (Status Change)
router.patch(
    '/approve/:id',
    OrderValidation.Params_id,
    OrderValidation.ApproveOrder,
    Validation,
    OrdersController.approveOrder
);

// Delete Order
router.delete(
    '/delete/:id',
    OrderValidation.Params_id,
    Validation,
    OrdersController.deleteOrder
);

module.exports = router;
