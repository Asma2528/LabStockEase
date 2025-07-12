import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const RequisitionApi = createApi({
  reducerPath: 'RequisitionApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ['Requisition', 'UserRequisitions', 'ApprovedRequisitions'],
  endpoints: (builder) => ({
    // Create a new requisition
    createRequisition: builder.mutation({
      query: (requisitionData) => ({
        url: '/requisition/create',
        method: 'POST',
        body: requisitionData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['UserRequisitions','getAllRequisitions','getUserRequisitions'],
    }),

    // Get requisitions for the authenticated user
    getUserRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/user-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getUserRequisitions','getAllRequisitions'],
    }),
    getUserReturnRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/user-return-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getUserRequisitions','getAllRequisitions','getUserReturnRequisition'],
    }),


    // Update a requisition by ID
    updateRequisition: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/requisition/update/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['getUserRequisitions', 'getAllRequisitions'],
    }),

    // Delete a requisition by ID
    deleteRequisition: builder.mutation({
      query: (id) => ({
        url: `/requisition/delete/${id}`,
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['getUserRequisitions','getAllRequisitions'],
    }),

    // Get all requisitions (for admin/manager view)
    getAllRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/all-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getAllRequisitions'],
    }),

    // Approve (or reject) a requisition
    approveRequisition: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/requisition/approve/${id}`,
        method: 'PATCH',
        body: updateData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      invalidatesTags: ['getApprovedAndIssuedRequisitions', 'getAllRequisitions','getUserRequisitions'],
    }),

    // Get approved and issued requisitions (for chemistry view)
    getApprovedRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/approved-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getApprovedAndIssuedRequisitions'],
    }),

    getApprovedAndIssuedRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/approved-issued-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getApprovedAndIssuedRequisitions'],
    }),


changeStatusToIssued: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/requisition/change-status/${id}`,
    method: 'PATCH',
    body,
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
  }),
  invalidatesTags: ['getApprovedAndIssuedRequisitions', 'getAllRequisitions', 'getUserRequisitions'],
}),

returnRequisition: builder.mutation({
  query: ({ id, updateData }) => ({
    url: `/requisition/return/${id}`,
    method: 'PATCH',
    // Merge the id into the request body as required by your service code
    body: { id, ...updateData },
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
  }),
  invalidatesTags: ['getUserRequisitions', 'getApprovedAndIssuedRequisitions', 'getAllRequisitions','getReturnRequisitions'],
}),
    // Get return requisitions
    getReturnRequisitions: builder.query({
      query: (searchParams) => ({
        url: '/requisition/return-requisitions',
        method: 'GET',
        params: searchParams,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      }),
      providesTags: ['getApprovedAndIssuedRequisitions', 'getAllRequisitions','getUserRequisitions','getReturnRequisitions'],
    }),
  }),
});

export const {
  useCreateRequisitionMutation,
  useGetUserRequisitionsQuery,
  useGetUserReturnRequisitionsQuery,
  useUpdateRequisitionMutation,
  useDeleteRequisitionMutation,
  useGetAllRequisitionsQuery,
  useApproveRequisitionMutation,
  useGetApprovedAndIssuedRequisitionsQuery,
  useGetApprovedRequisitionsQuery,
  useChangeStatusToIssuedMutation,
  useReturnRequisitionMutation ,
  useGetReturnRequisitionsQuery,
} = RequisitionApi;
