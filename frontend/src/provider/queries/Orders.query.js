import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const OrderApi = createApi({
    reducerPath: 'OrderApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        // Query to get all orders with optional filters
        getAllOrders: builder.query({
            query: (filters) => ({
                url: '/order/all',
                method: 'GET',
                params: filters,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['Orders'],
        }),

        // Query to get an order by ID
        getOrderById: builder.query({
            query: (id) => ({
                url: `/order/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['Orders'],
        }),

        // Mutation to create a new order
        addOrder: builder.mutation({
            query: (orderData) => ({
                url: '/order/create',
                method: 'POST',
                body: orderData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['Orders'],
        }),

        // Mutation to update an existing order
        updateOrder: builder.mutation({
            query: ({ id, ...updateData }) => ({
                url: `/order/update/${id}`,
                method: 'PATCH',
                body: JSON.stringify(updateData), // Ensure body is correctly formatted as JSON
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['Orders'],
        }),

        // Mutation to approve an order (change status)
        approveOrder: builder.mutation({
            query: ({ id, status,remark }) => ({
                url: `/order/approve/${id}`,
                method: 'PATCH',
                body: JSON.stringify({ status ,remark}),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['Orders'],
        }),

        // Mutation to delete an order
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/order/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['Orders'],
        }),
    }),
});

// Exporting the hooks generated by RTK Query
export const {
    useGetAllOrdersQuery,
    useGetOrderByIdQuery,
    useAddOrderMutation,
    useUpdateOrderMutation,
    useApproveOrderMutation,
    useDeleteOrderMutation,
} = OrderApi;
