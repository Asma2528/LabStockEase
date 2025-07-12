const cron = require("node-cron");
const EquipmentsRestockModel = require("../src/models/equipments.restock.models.js"); // ✅ Adjust path as needed
const NotificationService = require("../src/services/Notification.service"); // ✅ Adjust path as needed
const NotificationModel = require("../src/models/notification.models.js"); // ✅ Adjust path as needed

// Utility function to run the notification job
const sendMaintenanceNotifications = async () => {
  try {
   const startDate = new Date();
    startDate.setDate(startDate.getDate() - 4);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 4);
    endDate.setHours(23, 59, 59, 999);

    const equipments = await EquipmentsRestockModel.find({
      maintenance_date: { $gte: startDate, $lte: endDate }
    }).populate("equipment");


    // Send a notification for each equipment due for maintenance
   for (const equipmentRestock of equipments) {
  const equipmentName = equipmentRestock.equipment?.item_name || "Unknown Equipment";

  // 🛡️ Check if notification already exists for this equipment today
  const existing = await NotificationModel.findOne({
    title: `Maintenance Due: ${equipmentName}`,
    type: "equipmentMaintenance",
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lte: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });

  if (existing) {
    console.log(`⚠️ Skipped duplicate notification for: ${equipmentName}`);
    continue;
  }

  // ✅ Create notification
  await NotificationService.createNotification({
    title: `Maintenance Due: ${equipmentName}`,
    message: `The equipment "${equipmentName}" is due for maintenance (±4 days).`,
    send_to: ["lab-assistant", "admin"],
    type: "equipmentMaintenance"
  });

  console.log(`🔔 Notification sent for ${equipmentName}`);
}

    console.log(`✅ Maintenance notifications sent for ${equipments.length} equipment(s).`);
  } catch (error) {
    console.error("❌ Maintenance notifier error:", error);
  }
};

cron.schedule("0 * * * *", async () => {
  console.log("🔄 Hourly equipment maintenance check...");
  await sendMaintenanceNotifications(); // your same logic with date range
});


// ✅ Also allow manual run (e.g., during development)
if (require.main === module) {
  sendMaintenanceNotifications();
}
