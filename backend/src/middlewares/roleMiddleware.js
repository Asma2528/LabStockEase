const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

// Role-based middleware
const roleMiddleware = (allowedRoles) => (req, res, next) => {
    const userRoles = req.user.roles; // Now 'roles' is an array

    if (!userRoles || !userRoles.some(role => allowedRoles.includes(role))) {
        return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }

    next();
};

module.exports = roleMiddleware;
