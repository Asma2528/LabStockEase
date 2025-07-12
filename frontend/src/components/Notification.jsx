import {
  useGetAllStockNotificationsQuery,
  useGetAllRequisitionNotificationsQuery,
  useGetAllNotificationsQuery,
  useDeleteStockNotificationMutation,
  useDeleteRequisitionNotificationMutation,
  useDeleteNotificationMutation,
} from "../provider/queries/Notification.query";

import { TiTrash } from "react-icons/ti";

const Notifications = () => {
  // Fetch stock, requisition, and general notifications
  const {
    data: stockNotifications = [],
    error: stockError,
    isLoading: isLoadingStock,
    refetch: refetchStock,
  } = useGetAllStockNotificationsQuery();
  
  const {
    data: requisitionNotifications = [],
    error: requisitionError,
    isLoading: isLoadingRequisition,
    refetch: refetchRequisition,
  } = useGetAllRequisitionNotificationsQuery();
  
  const {
    data: generalNotifications = [], // renamed to avoid conflict with component name
    error: generalError,
    isLoading: isLoadingGeneral,
    refetch: refetchGeneral,
  } = useGetAllNotificationsQuery();
  

console.log(requisitionNotifications);
console.log(generalNotifications);
console.log(stockNotifications);

  // Mutations for deleting notifications
  const [deleteStockNotification] = useDeleteStockNotificationMutation();
  const [deleteRequisitionNotification] = useDeleteRequisitionNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleDeleteNotification = async (id, category) => {
    try {
      // Delete based on category
      if (category === "stock") {
        await deleteStockNotification(id);
        refetchStock(); // Refresh stock notifications after deletion
      } else if (category === "requisition") {
        await deleteRequisitionNotification(id);
        refetchRequisition(); // Refresh requisition notifications after deletion
      } else {
        await deleteNotification(id);
        refetchGeneral(); // Refresh general notifications after deletion
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationStyle = (notification) => {
    if (["low_stock", "near_expiry"].includes(notification.type)) {
      return "bg-yellow-100 text-black border-2 border-yellow-300";
    }
    if (["expired", "out_of_stock"].includes(notification.type)) {
      return "bg-rose-100 text-black border-2 border-rose-300";
    }
    if (["stock_recovered"].includes(notification.type)) {
      return "bg-purple-100 text-black border-2 border-purple-300";
    }
    if (["equipmentMaintenance","updateOrder","createOrder", "createProject","createInward","createInvoice","approveInvoice"].includes(notification.type)) {
      return "bg-indigo-100 text-black border-2 border-indigo-200";
    }
    if (
      [
        "requisition_created", 
          "requisition_rejected", 
          "requisition_update", 
          "requisition_delete", 
          "requisition_approved", 
          "requisition_issued",
          "requisition_return",
          "order_request_created",
          "order_request_update",
          "order_request_delete",
          "order_request_approved",
          "order_request_rejected",
          "order_request_ordered",
          "order_request_issued",
          "new_indent_created",
          "new_indent_update",
          "new_indent_delete",
          "new_indent_approved",
          "new_indent_rejected",
          "new_indent_ordered",
            "new_indent_issued"
      ].includes(notification.type)
    ) {
      return "bg-blue-100 text-black border-2 border-blue-300";
    }
    return "bg-white text-black";
  };

  // Sort notifications by createdAt (newest first)
  const sortNotificationsByDate = (generalNotifications) => {
    // Create a shallow copy of the notifications array before sorting
    return [...generalNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Merge all notifications into one array
  const allNotifications = [
    ...(Array.isArray(stockNotifications) ? stockNotifications : []),
    ...(Array.isArray(requisitionNotifications) ? requisitionNotifications : []),
    ...(Array.isArray(generalNotifications) ? generalNotifications : []),
  ];

  // Sort the merged notifications by date
  const sortedNotifications = sortNotificationsByDate(allNotifications);

  if (isLoadingStock || isLoadingRequisition || isLoadingGeneral) {
    return <div>Loading notifications...</div>;
  }

  if (stockError || requisitionError || generalError) {
    return (
      <div>
        {stockError && <div>Error fetching stock notifications: {stockError.message}</div>}
        {requisitionError && <div>Error fetching requisition notifications: {requisitionError.message}</div>}
        {Error && <div>Error fetching Notifications: {Error.message}</div>}
      </div>
    );
  }

  return (
    <div className="notifications-list space-y-6">
      {/* All Notifications */}
      {Array.isArray(sortedNotifications) && sortedNotifications.length > 0 && (
        <div className="notifications">
          <h2 className="font-bold text-lg mb-3">All Notifications</h2>
          {sortedNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg ${getNotificationStyle(notification)} flex justify-between items-center my-5`}
            >
              <div className="notification-content">
                <h3 className="notification-title font-bold">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <p className="text-sm text-gray-600 mt-2">
        Created on: {new Date(notification.createdAt).toLocaleString()}
      </p>
              </div>
              <button
                className="delete-button text-red-600 p-2 rounded flex hover:text-red-400"
                onClick={() => {
                  // Determine category and delete notification
                  let category = "";
                  if (stockNotifications.some(item => item._id === notification._id)) {
                    category = "stock";
                  } else if (requisitionNotifications.some(item => item._id === notification._id)) {
                    category = "requisition";
                  } else {
                    category = "general";
                  }
                  handleDeleteNotification(notification._id, category);
                }}
              >
                Delete <TiTrash className="text-2xl" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
