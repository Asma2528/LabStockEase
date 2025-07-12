import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Stock Notification API
export const StockNotificationApi = createApi({
  reducerPath: "StockNotificationApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ["getAllStockNotifications"],
  endpoints: (builder) => ({
    getAllStockNotifications: builder.query({
      query: () => ({
        url: "/stock-notification/get-all",
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      providesTags: ["getAllStockNotifications"],
    }),
    deleteStockNotification: builder.mutation({
      query: (id) => ({
        url: `/stock-notification/delete/${id}`,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["getAllStockNotifications"],
    }),
  }),
});

// Requisition Notification API
export const RequisitionNotificationApi = createApi({
  reducerPath: "RequisitionNotificationApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ["getAllRequisitionNotifications"],
  endpoints: (builder) => ({
    getAllRequisitionNotifications: builder.query({
      query: () => ({
        url: "/requisition-notification/get-all",
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      providesTags: ["getAllRequisitionNotifications"],
    }),
    deleteRequisitionNotification: builder.mutation({
      query: (id) => ({
        url: `/requisition-notification/delete/${id}`,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["getAllRequisitionNotifications"],
    }),
  }),
});

// Requisition Notification API
export const NotificationApi = createApi({
  reducerPath: "NotificationApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ["getAllNotifications"],
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      query: () => ({
        url: "/notification/get-all",
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      providesTags: ["getAllNotifications"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/delete/${id}`,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["getAllNotifications"],
    }),
  }),
});

// Export hooks for Stock Notifications
export const {
  useGetAllStockNotificationsQuery,
  useDeleteStockNotificationMutation,
} = StockNotificationApi;

// Export hooks for Requisition Notifications
export const {
  useGetAllRequisitionNotificationsQuery,
  useDeleteRequisitionNotificationMutation,
} = RequisitionNotificationApi;

export const {
  useGetAllNotificationsQuery,
  useDeleteNotificationMutation,
} = NotificationApi;