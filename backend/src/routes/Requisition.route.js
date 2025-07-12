const express = require("express");
const RequisitionController = require("../controllers/RequisitionController");
const Authentication = require("../middlewares/Authentication");
const roleMiddleware = require("../middlewares/roleMiddleware");
const Validation = require("../middlewares/Validation");
const RequisitionValidation = require("../validations/Requisition.validation");

const router = express.Router();

// Apply authentication to all routes in this module
router.use(Authentication);

// Routes for faculty (or lab-assistant users) to create, view, update, and delete their requisitions
router.post(
  "/create",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  RequisitionValidation.CreateRequisition,
  Validation,
  RequisitionController.createRequisition
);

router.get(
  "/user-requisitions",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  RequisitionController.getUserRequisition
);

router.get(
  "/user-return-requisitions",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  RequisitionController.getUserReturnRequisition
);

router.patch(
  "/update/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  RequisitionValidation.UpdateRequisition,
  Validation,
  RequisitionController.updateRequisition
);

router.delete(
  "/delete/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  RequisitionValidation.Params_id,
  Validation,
  RequisitionController.deleteRequisition
);

// Routes for admin to view and approve requisitions
router.get(
  "/all-requisitions",
  roleMiddleware(["admin","manager"]),
  RequisitionController.getAllRequisitions
);

router.patch(
  "/approve/:id",
  roleMiddleware(["admin","manager"]),
  RequisitionValidation.ApproveRequisition,
  Validation,
  RequisitionController.approveRequisition
);

// Additional routes (e.g., for retrieving approved/issued requisitions or changing status)
router.get(
  "/approved-requisitions",
  roleMiddleware(['admin','manager',"lab-assistant"]),
  RequisitionController.getApprovedRequisitions
);

router.get(
  "/approved-issued-requisitions",
  roleMiddleware(['admin','manager',"lab-assistant"]),
  RequisitionController.getApprovedandIssuedRequisitions
);

router.patch(
  "/change-status/:id",
  roleMiddleware(['admin','manager',"lab-assistant"]),
  RequisitionValidation.ChangeStatusToIssued,
  Validation,
  RequisitionController.changeStatusToIssued
);

router.patch(
  "/return/:id",
  roleMiddleware(["admin","faculty","lab-assistant"]),
  RequisitionValidation.ReturnRequisition,
  Validation,
  RequisitionController.returnRequisition
);

router.get(
  "/return-requisitions",
  roleMiddleware(["admin","manager", "lab-assistant"]),
  RequisitionController.getReturnRequisitions
);

module.exports = router;
