const AuthController = require("../controllers/Auth.controller");
const Authentication = require("../middlewares/Authentication");
const Validation = require("../middlewares/Validation");
const AuthValidation = require("../validations/Auth.validation");
const roleMiddleware = require("../middlewares/roleMiddleware");
const forgotPasswordRouter = require('./Auth.forgotPassword.route');

const router = require("express").Router();

// Public routes
router.post("/register", AuthValidation.RegisterUser, Validation, AuthController.RegisterUser);
router.post("/login", AuthValidation.LoginUser, Validation, AuthController.LoginUser);

// Add forgot password routes
router.use('/forgot-password', forgotPasswordRouter); // Mount the forgotPassword router

// Protected routes with role-based access
router.get("/profile", Authentication, AuthController.ProfileController);

// Role-based routes for different departments
router.get("/chemistry", Authentication, roleMiddleware(['lab-assistant', 'admin']), (req, res) => {
    res.send("Chemistry department content");
});

// Admin-specific routes
router.get("/admin", Authentication, roleMiddleware(['admin']), (req, res) => {
    res.send("Admin dashboard");
});

// ✅ Add Update User Route (Only Admins & Managers Can Update Users)
router.put(
    "/update/:id",
    Authentication, 
    roleMiddleware(['admin']), // Only admins & managers can update users
    AuthValidation.UpdateUser, 
    Validation, 
    AuthController.UpdateUser
);

// ✅ Add Delete User Route (Only Admins Can Delete Users)
router.delete(
    "/delete/:id",
    Authentication, 
    roleMiddleware(['admin']), // Only admins can delete users
    AuthValidation.DeleteUser, 
    Validation, 
    AuthController.DeleteUser
);

// ✅ Fetch all users (only accessible to admin)
router.get(
    "/users",
    Authentication, 
    roleMiddleware(['admin']),  // Only admin can access
    AuthController.FetchAllUsers
);



module.exports = router;
