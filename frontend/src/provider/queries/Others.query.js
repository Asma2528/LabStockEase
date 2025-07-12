import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const OthersApi = createApi({
    reducerPath: 'OthersApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllOthersItems', 'getOthersItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addOthersItem: builder.mutation({
            query: (item) => ({
                url: '/others/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllOthersItems']
        }),
        getAllOthersItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.category) params.append('category', searchParams.category);
                if (searchParams.company) params.append('company', searchParams.company);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/others/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllOthersItems'],
        }),
    
        deleteOthersItem: builder.mutation({
            query: (id) => ({
                url: `/others/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllOthersItems'],
        }),
        getOthersItem: builder.query({
            query: (id) => ({
                url: `/others/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getOthersItem'],
        }),
        updateOthersItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/others/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllOthersItems', 'getOthersItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/others/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getOthersItem', 'logIssuedQuantity','getAllOthersItems','searchOthersLogs','getOthersLogs','getAllRestockItems'], 
        }),
        getOthersLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/others/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getOthersLogs'],
        }),
        
        // Add the new query for fetching others by item_code or item_name
        getOtherByCodeOrName: builder.query({
            query: (query) => ({
                url: `/others/get-other-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getOthersItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/others/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getOthersItem', 'logIssuedQuantity','getAllOthersItems','searchOthersLogs','getOthersLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.other) params.append('other', searchParams.other);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.expiration_date) params.append('expiration_date', searchParams.expiration_date);
                return {
                    url: `/others/restock/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllRestockItems'],
        }),
        
        getRestockItem: builder.query({
            query: (id) => ({
                url: `/others/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/others/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getOthersLogs','getAllOthersItems']
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/others/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getOthersLogs','getAllOthersItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/others/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getChemicalsLogs','getAllChemicalsItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteOthersLog: builder.mutation({
            query: (logId) => ({
                url: `/others/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getOthersLogs', 'getAllOthersItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddOthersItemMutation,
    useGetAllOthersItemsQuery,
        useDeleteOthersItemMutation,
    useGetOthersItemQuery,
    useUpdateOthersItemMutation,
    useLogIssuedQuantityMutation,
    useGetOthersLogsQuery,
    useUpdateLogMutation,
    useDeleteOthersLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetOtherByCodeOrNameQuery,  // Added here
} = OthersApi;
