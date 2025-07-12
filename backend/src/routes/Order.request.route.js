const express = require("express");
const OrderRequestController = require("../controllers/OrderRequestController");
const Authentication = require("../middlewares/Authentication");
const roleMiddleware = require("../middlewares/roleMiddleware");
const Validation = require("../middlewares/Validation");
const OrderRequestValidation = require("../validations/OrderRequest.validation");

const router = express.Router();

// Apply authentication to all routes in this module
router.use(Authentication);

// Routes for faculty (or lab-assistant users) to create, view, update, and delete their requisitions
router.post(
  "/create",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  OrderRequestValidation.CreateOrderRequest,
  Validation,
  OrderRequestController.createOrderRequest
);

router.get(
  "/user-order-requests",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  OrderRequestController.getUserOrderRequest
);

router.patch(
  "/update/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  OrderRequestValidation.UpdateOrderRequest,
  Validation,
  OrderRequestController.updateOrderRequest
);

router.delete(
  "/delete/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  OrderRequestValidation.Params_id,
  Validation,
  OrderRequestController.deleteOrderRequest
);

// Routes for admin to view and approve requisitions
router.get(
  "/all-order-requests",
  roleMiddleware(["admin","manager"]),
  OrderRequestController.getAllOrderRequests
);

router.patch(
  "/approve/:id",
  roleMiddleware(["admin","manager"]),
  OrderRequestValidation.ApproveOrderRequest,
  Validation,
  OrderRequestController.approveOrderRequest
);

// Additional routes (e.g., for retrieving approved/issued requisitions or changing status)
router.get(
  "/approved-ordered-order-requests",
  roleMiddleware(['admin','manager',"stores"]),
  OrderRequestController.getApprovedAndOrderedRequests
);

router.get(
  "/approved-order-requests",
  roleMiddleware(['admin','manager',"stores"]),
  OrderRequestController.getApprovedRequests
);


router.patch(
  "/change-status/:id",
  roleMiddleware(['admin','manager',"stores"]),
  OrderRequestValidation.ChangeStatusToOrdered,
  Validation,
  OrderRequestController.changeStatusToOrdered
);


module.exports = router;
