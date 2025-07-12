const jwt = require("jsonwebtoken");
const { PUBLIC_DATA } = require("../../constant");

// Function to generate a token with user ID and roles
exports.generateToken = (user, expire = '1d') => {
    const token = jwt.sign(
        {
            userid: user._id,
            roles: user.roles // Store all roles as an array
        },
        PUBLIC_DATA.jwt_auth,
        {
            expiresIn: expire
        }
    );
    return token;
};

// Function to validate and decode a token
exports.validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, PUBLIC_DATA.jwt_auth);
        return {
            userid: decoded.userid,
            roles: decoded.roles // Ensure roles are returned
        };
    } catch (error) {
        return null; // Handle invalid or expired tokens
    }
};
