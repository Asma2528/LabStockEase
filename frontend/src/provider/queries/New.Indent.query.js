import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const NewIndentApi = createApi({
  reducerPath: 'NewIndentApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ['NewIndent', 'UserNewIndents', 'AllNewIndents', 'ApprovedNewIndents'],
  endpoints: (builder) => ({
    // Create a new requisition
    createNewIndent: builder.mutation({
      query: (newIndentData) => ({
        url: '/new-indent/create',
        method: 'POST',
        body: newIndentData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserNewIndents', 'AllNewIndents'],
    }),

    // Get requisitions for the authenticated user
    getUserNewIndents: builder.query({
      query: (searchParams) => ({
        url: '/new-indent/user-new-indents',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['UserNewIndents'],
    }),

    // Update a requisition by ID
    updateNewIndent: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/new-indent/update/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserNewIndents', 'AllNewIndents'],
    }),

    // Delete a requisition by ID
    deleteNewIndent: builder.mutation({
      query: (id) => ({
        url: `/new-indent/delete/${id}`,
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserNewIndents', 'AllNewIndents'],
    }),

    // Get all requisitions (for admin/manager view)
    getAllNewIndents: builder.query({
      query: (searchParams) => ({
        url: '/new-indent/all-new-indents',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['AllNewIndents'],
    }),

    // Approve (or reject) a requisition
    approveNewIndent: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/new-indent/approve/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['ApprovedNewIndents', 'AllNewIndents', 'UserNewIndents'],
    }),

    // Get approved and issued requisitions (for chemistry view)
    getApprovedAndOrderedRequests: builder.query({
      query: (searchParams) => ({
        url: '/new-indent/approved-ordered-new-indents',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['ApprovedNewIndents'],
    }),
    getApprovedRequests: builder.query({
      query: (searchParams) => ({
        url: '/new-indent/approved-new-indents',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['ApprovedNewIndents'],
    }),


    // Change status to 'Ordered'
    changeStatusToOrdered: builder.mutation({
      query: ({ id, status }) => ({
        url: `/new-indent/change-status/${id}`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['ApprovedNewIndents', 'AllNewIndents', 'UserNewIndents'],
    }),
  }),
});

export const {
  useCreateNewIndentMutation,
  useGetUserNewIndentsQuery,
  useUpdateNewIndentMutation,
  useDeleteNewIndentMutation,
  useGetAllNewIndentsQuery,
  useApproveNewIndentMutation,
  useGetApprovedAndOrderedRequestsQuery,
  useGetApprovedRequestsQuery,
  useChangeStatusToOrderedMutation,
} = NewIndentApi;
