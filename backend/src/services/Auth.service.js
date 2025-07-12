const httpStatus = require("http-status");
const { UserModel, ProfileModel } = require("../models");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/Token.utils");
const axios = require("axios");

class AuthService {
  static async RegisterUser(body) {
    const { email, password, name, roles, token } = body;

    if (!roles || !Array.isArray(roles) || !roles.every(role => ['admin', 'lab-assistant', 'faculty', 'stores', 'manager','accountant'].includes(role))) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Valid roles are required");
    }

    // Captcha Verification
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const data = await response.data;
    if (!data.success) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid");
    }

    const checkExist = await UserModel.findOne({ email });
    if (checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Already Registered");
    }

    

    const user = await UserModel.create({
      email,
      password: password,
      name,
      roles
    });

    const tokend = generateToken(user);
    const refresh_token = generateToken(user, "2d");
    await ProfileModel.create({
      user: user._id,
      refresh_token,
    });

    return {
      msg: "User Registered Successfully",
      token: tokend,
    };
  }

  static async LoginUser(body) {
    const { email, password, token } = body;

    // Captcha Verification
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const data = await response.data;
    if (!data.success) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid");
    }

    const checkExist = await UserModel.findOne({ email });
    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered");
    }

    const isPasswordValid = password === checkExist.password;

    if (!isPasswordValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Credentials");
    }

    const tokend = generateToken(checkExist);

    return {
      msg: "User Login Successful",
      email: checkExist.email,   // ✅ Include email
      name: checkExist.name, 
      token: tokend,
      roles: checkExist.roles,
    };
  } 

  static async ProfileService(user) {
    const checkExist = await UserModel.findById(user.id).select("name email roles");
    
    if (!checkExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered");
    }


    return {
      user: {  // Ensure the response has a 'user' key
        _id: checkExist._id,
        name: checkExist.name,
        email: checkExist.email,
        roles: Array.isArray(checkExist.roles) ? checkExist.roles : [],
    }
  };
}


  static async UpdateUser(userId, updateData) {
    const { name, email,  roles, token } = updateData;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
      }
    }

  
    user.name = name || user.name;
    user.email = email || user.email;
    user.roles = roles || user.roles;

    await user.save();

    return { msg: "User updated successfully", user };
  }

  static async DeleteUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    await UserModel.deleteOne({ _id: userId });

    return { msg: "User deleted successfully" };
  }

  static async GetAllUsers(searchQuery = "") {
    const filter = searchQuery
        ? {
              $or: [
                  { name: { $regex: searchQuery, $options: "i" } },
                  { email: { $regex: searchQuery, $options: "i" } },
                  { roles: { $in: [new RegExp(searchQuery, "i")] } }, // Handles role as an array
              ],
          }
        : {};

    const users = await UserModel.find(filter, "name email roles");
    return users;
}



}


module.exports = AuthService;
