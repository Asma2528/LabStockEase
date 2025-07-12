const RequisitionNotificationModel = require("../models/requisitionNotification.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const UserModel = require("../models/user.models"); // Import UserModel to fetch emails
const { sendEmail } = require("./Email.service");

class RequisitionNotificationService {
    static async createNotification(notificationData) {
        try {
            // Save the notification to the database
            const notification = await RequisitionNotificationModel.create(notificationData);

            // Resolve `send_to` roles into email addresses
            const sendToEmails = [];
            for (const roleOrEmail of notificationData.send_to) {
                // If it's a role, fetch users with that role
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

    static async findOne(filter) {
        return await RequisitionNotificationModel.findOne(filter);
    }

    static async getAllNotifications(userRoles, userId) {
        try {
            const roleFilter = {
                send_to: { $in: userRoles } // Role-based notifications for multiple roles
            };

            const notifications = await RequisitionNotificationModel.find(roleFilter).exec();
            return notifications;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching notifications.");
        }
    }

    static async deleteNotification(notificationId) {
        const notification = await RequisitionNotificationModel.findByIdAndDelete(notificationId);
        if (!notification) {
            throw new ApiError(httpStatus.NOT_FOUND, "Notification not found.");
        }
    }

    static async deleteMany(filter) {
        try {
            return await RequisitionNotificationModel.deleteMany(filter);
        } catch (error) {
            console.error("Error deleting notifications:", error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error deleting notifications.");
        }
    }
}

module.exports = RequisitionNotificationService;
