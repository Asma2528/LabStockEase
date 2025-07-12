const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { validateToken } = require("../utils/Token.utils");
const UserModel = require('../models/user.models'); // Adjust the path to your User model

const Authentication = async (req, res, next) => {
    try {
       

        const headers = req.headers['authorization'] || '';
        
        if (!headers || !headers.startsWith("Bearer ")) {
            console.error("Missing or invalid Authorization header:", headers);
            throw new ApiError(httpStatus.UNAUTHORIZED, "Please login first");
        }

        const auth_token = headers.split(" ")[1];

        if (!auth_token) {
            console.error("Token is missing in Authorization header");
            throw new ApiError(httpStatus.UNAUTHORIZED, "Please provide a valid token");
        }

        const data = validateToken(auth_token);


        if (!data || !data.userid) {
            console.error("Invalid token data:", data);
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
        }

        // Retrieve user information from the database
        const user = await UserModel.findById(data.userid).select('email roles'); 
        if (!user) {
            console.error("User not found in database:", data.userid);
            throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
        }

        req.user = { id: data.userid, email: user.email, roles: user.roles };
      
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        next(error);
    }
};


module.exports = Authentication;
