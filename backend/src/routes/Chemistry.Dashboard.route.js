const express = require("express");
const DashboardController = require("../controllers/ChemistryDashboardController");
const Validation = require("../middlewares/Validation");
const router = express.Router();
const Authentication = require("../middlewares/Authentication");

// Apply authentication middleware to all routes
router.use(Authentication);
// Route to get dashboard summary for all categories
router.get("/cards-data",DashboardController.getDashboardSummary);

module.exports = router;
