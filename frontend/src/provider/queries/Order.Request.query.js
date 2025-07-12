import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const OrderRequestApi = createApi({
  reducerPath: 'OrderRequestApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ['OrderRequest', 'UserOrderRequests', 'AllOrderRequests', 'ApprovedOrderRequests'],
  endpoints: (builder) => ({
    // Create a new requisition
    createOrderRequest: builder.mutation({
      query: (orderRequestData) => ({
        url: '/order-request/create',
        method: 'POST',
        body: orderRequestData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserOrderRequests', 'AllOrderRequests'],
    }),

    // Get requisitions for the authenticated user
    getUserOrderRequests: builder.query({
      query: (searchParams) => ({
        url: '/order-request/user-order-requests',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['UserOrderRequests'],
    }),

    // Update a requisition by ID
    updateOrderRequest: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/order-request/update/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserOrderRequests', 'AllOrderRequests'],
    }),

    // Delete a requisition by ID
    deleteOrderRequest: builder.mutation({
      query: (id) => ({
        url: `/order-request/delete/${id}`,
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserOrderRequests', 'AllOrderRequests'],
    }),

    // Get all requisitions (for admin/manager view)
    getAllOrderRequests: builder.query({
      query: (searchParams) => ({
        url: '/order-request/all-order-requests',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['AllOrderRequests'],
    }),

    // Approve (or reject) a requisition
    approveOrderRequest: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/order-request/approve/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['ApprovedOrderRequests', 'AllOrderRequests', 'UserOrderRequests'],
    }),

    // Get approved and issued requisitions (for chemistry view)
    getApprovedAndOrderedRequests: builder.query({
      query: (searchParams) => ({
        url: '/order-request/approved-ordered-order-requests',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['ApprovedOrderRequests'],
    }),
    // Get approved and issued requisitions (for chemistry view)
    getApprovedOrderRequests: builder.query({
      query: (searchParams) => ({
        url: '/order-request/approved-order-requests',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['ApprovedOrderRequests'],
    }),
    // Change status to 'Ordered'
    changeStatusToOrdered: builder.mutation({
      query: ({ id, status }) => ({
        url: `/order-request/change-status/${id}`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['ApprovedOrderRequests', 'AllOrderRequests', 'UserOrderRequests'],
    }),
  }),
});

export const {
  useCreateOrderRequestMutation,
  useGetUserOrderRequestsQuery,
  useUpdateOrderRequestMutation,
  useDeleteOrderRequestMutation,
  useGetAllOrderRequestsQuery,
  useApproveOrderRequestMutation,
  useGetApprovedAndOrderedRequestsQuery,
  useGetApprovedOrderRequestsQuery,
  useChangeStatusToOrderedMutation,
} = OrderRequestApi;
