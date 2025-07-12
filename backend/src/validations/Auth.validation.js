const { body, param } = require("express-validator");

class AuthValidation {
    // Register User Validation
    static RegisterUser = [
        body("token").notEmpty().withMessage("Token is required"),

        body("name")
            .notEmpty()
            .withMessage("Name cannot be empty"),

        body("email")
            .isEmail()
            .withMessage("Email must be valid")
            .notEmpty()
            .withMessage("Email cannot be empty"),

        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .notEmpty()
            .withMessage("Password is required"),

        body("roles")
            .isArray({ min: 1 })
            .withMessage("At least one role is required")
            .custom((roles) => {
                const validRoles = ["admin", "lab-assistant", "faculty", "stores", "manager", "accountant"];
                const invalidRoles = roles.filter(role => !validRoles.includes(role));
                if (invalidRoles.length > 0) {
                    throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
                }
                return true;
            })
    ];

    // Login User Validation
    static LoginUser = [
        
        body("email")
            .isEmail()
            .withMessage("Email must be valid")
            .notEmpty()
            .withMessage("Email cannot be empty"),

        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .notEmpty()
            .withMessage("Password is required"),
    ];

    // Update User Validation
    static UpdateUser = [
        param("id").isMongoId().withMessage("Invalid user ID"),

        body("name")
            .optional()
            .notEmpty()
            .withMessage("Name cannot be empty"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("Email must be valid"),

        body("password")
            .optional()
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),

        body("roles")
            .optional()
            .isArray({ min: 1 })
            .withMessage("At least one role is required")
            .custom((roles) => {
                const validRoles = ["admin", "lab-assistant", "faculty", "stores", "manager", "accountant"];
                const invalidRoles = roles.filter(role => !validRoles.includes(role));
                if (invalidRoles.length > 0) {
                    throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
                }
                return true;
            })
    ];

    // Delete User Validation
    static DeleteUser = [
        param("id").isMongoId().withMessage("Invalid user ID")
    ];
}

module.exports = AuthValidation;
