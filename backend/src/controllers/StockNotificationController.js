const StockNotificationService = require("../services/stockNotification.service");

class StockNotificationController {
  static async createNotification(req, res) {
    const notificationData = req.body;
    const notification = await StockNotificationService.createNotification(notificationData);
    if (!notification) {
      return res.status(409).json({ message: "Duplicate stock notification detected." });
    }
    res.status(201).json(notification);
  }

 static async getAllNotifications(req, res) {
    const userRoles = req.user.roles; // Use "roles" array now
    const userId = req.user.id;
  
    console.log("✅ User Roles in request:", userRoles);
  
    const notifications = await StockNotificationService.getAllNotifications(userRoles, userId);
  
    res.status(200).json(notifications);
  }

  static async deleteNotification(req, res) {
    const { id } = req.params;
    await StockNotificationService.deleteNotification(id);
    res.status(200).json({ message: "Stock notification deleted successfully." });
  }

  static async deleteMany(req, res) {
    const filter = req.body;
    const result = await StockNotificationService.deleteMany(filter);
    res.status(200).json(result);
  }
}

module.exports = StockNotificationController;