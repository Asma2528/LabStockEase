const NotificationModel = require("../models/notification.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const UserModel = require("../models/user.models"); // Import UserModel to fetch emails
const { sendEmail } = require("./Email.service");

class NotificationService {
    static async createNotification(notificationData) {
        try {
            // Save the notification to the database
            const notification = await NotificationModel.create(notificationData);

            // Resolve `send_to` roles into email addresses
            const sendToEmails = [];
            for (const roleOrEmail of notificationData.send_to) {
                // If it's a role, fetch users who have that role in their roles array
                const users = await UserModel.find({ roles: { $in: [roleOrEmail] } }).select("email");
                sendToEmails.push(...users.map((user) => user.email));
            }

            if (sendToEmails.length === 0) {
                throw new ApiError(httpStatus.BAD_REQUEST, "No recipients found for the notification.");
            }

            // Send email notifications
            for (const email of sendToEmails) {
                await sendEmail(email, notification.title, notification.message);
            }

            return notification;
        } catch (error) {
            if (error.code === 11000) {
                console.log("Duplicate notification detected.");
                return null;
            }
            throw error;
        }
    }

    static async getAllNotifications(userRole, userId) {
        try {
            const roleFilter = {
                send_to: { $in: userRole } // Role-based notifications
            };

            const notifications = await NotificationModel.find(roleFilter).exec();
            return notifications;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching notifications.");
        }
    }

    static async deleteNotification(notificationId) {
        const notification = await NotificationModel.findByIdAndDelete(notificationId);
        if (!notification) {
            throw new ApiError(httpStatus.NOT_FOUND, "Notification not found.");
        }
    }

    static async deleteMany(filter) {
        try {
            return await NotificationModel.deleteMany(filter);
        } catch (error) {
            console.error("Error deleting notifications:", error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error deleting notifications.");
        }
    }
}

module.exports = NotificationService;
