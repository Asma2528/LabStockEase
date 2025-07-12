const express = require("express");
const NewIndentController = require("../controllers/NewIndentController");
const Authentication = require("../middlewares/Authentication");
const roleMiddleware = require("../middlewares/roleMiddleware");
const Validation = require("../middlewares/Validation");
const NewIndentValidation = require("../validations/NewIndent.validation");

const router = express.Router();

// Apply authentication to all routes in this module
router.use(Authentication);

// Routes for faculty (or lab-assistant users) to create, view, update, and delete their requisitions
router.post(
  "/create",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  NewIndentValidation.CreateNewIndent,
  Validation,
  NewIndentController.createNewIndent
);

router.get(
  "/user-new-indents",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  NewIndentController.getUserNewIndent
);

router.patch(
  "/update/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  NewIndentValidation.UpdateNewIndent,
  Validation,
  NewIndentController.updateNewIndent
);

router.delete(
  "/delete/:id",
  roleMiddleware(["admin","faculty", "lab-assistant"]),
  NewIndentValidation.Params_id,
  Validation,
  NewIndentController.deleteNewIndent
);

// Routes for admin to view and approve requisitions
router.get(
  "/all-new-indents",
  roleMiddleware(["admin","manager"]),
  NewIndentController.getAllNewIndents
);

router.patch(
  "/approve/:id",
  roleMiddleware(["admin","manager"]),
  NewIndentValidation.ApproveNewIndent,
  Validation,
  NewIndentController.approveNewIndent
);

// Additional routes (e.g., for retrieving approved/issued requisitions or changing status)
router.get(
  "/approved-ordered-new-indents",
  roleMiddleware(['admin','manager',"stores"]),
  NewIndentController.getApprovedAndOrderedRequests
);

router.get(
  "/approved-new-indents",
  roleMiddleware(['admin','manager',"stores"]),
  NewIndentController.getApprovedRequests
);
router.patch(
  "/change-status/:id",
  roleMiddleware(['admin','manager',"stores"]),
  NewIndentValidation.ChangeStatusToOrdered,
  Validation,
  NewIndentController.changeStatusToOrdered
);


module.exports = router;
