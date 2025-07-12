const StockNotification = require("../models/stockNotification.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { UserModel } = require("../models");
const { sendEmail } = require("./Email.service");

class StockNotificationService {
  static async createNotification(notificationData) {
    try {
      const notification = await StockNotification.create(notificationData);

      // Resolve `send_to` roles into email addresses
      const sendToRoles = notificationData.send_to || [];
      const recipients = await UserModel.find({ roles: { $in: sendToRoles } }).select("email");
      const emails = recipients.map(user => user.email);

      for (const email of emails) {
        await sendEmail(email, notification.title, notification.message);
      }

      return notification;
    } catch (error) {
      if (error.code === 11000) {
        console.log("Duplicate stock notification detected.");
        return null;
      }
      throw error;
    }
  }

  static async findOne(filter) {
    return await StockNotification.findOne(filter);
  }

  static async getAllNotifications(userRoles, userId) {
    try {
      const roleFilter = {
        send_to: { $in: userRoles } // Role-based notifications for multiple roles
      };

      const notifications = await StockNotification.find(roleFilter).exec();
      return notifications;
    } catch (error) {
      console.error("Error fetching stock notifications:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching stock notifications.");
    }
  }

  static async deleteNotification(notificationId) {
    const notification = await StockNotification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new ApiError(httpStatus.NOT_FOUND, "Stock notification not found.");
    }
  }

  static async deleteMany(filter) {
    try {
      return await StockNotification.deleteMany(filter);
    } catch (error) {
      console.error("Error deleting stock notifications:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error deleting stock notifications.");
    }
  }
}

module.exports = StockNotificationService;
