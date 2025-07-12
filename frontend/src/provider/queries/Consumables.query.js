import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ConsumablesApi = createApi({
    reducerPath: 'ConsumablesApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllConsumablesItems', 'getConsumablesItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addConsumablesItem: builder.mutation({
            query: (item) => ({
                url: '/consumables/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllConsumablesItems']
        }),
        getAllConsumablesItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.casNo) params.append('casNo', searchParams.casNo);
                if (searchParams.company) params.append('company', searchParams.company);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/consumables/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllConsumablesItems'],
        }),
    
        deleteConsumablesItem: builder.mutation({
            query: (id) => ({
                url: `/consumables/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllConsumablesItems'],
        }),
        getConsumablesItem: builder.query({
            query: (id) => ({
                url: `/consumables/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getConsumablesItem'],
        }),
        updateConsumablesItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/consumables/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllConsumablesItems', 'getConsumablesItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/consumables/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getConsumablesItem', 'logIssuedQuantity','getAllConsumablesItems','searchConsumablesLogs','getConsumablesLogs','getAllRestockItems'], 
        }),
        getConsumablesLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/consumables/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getConsumablesLogs'],
        }),
        
        // Add the new query for fetching consumables by item_code or item_name
        getConsumableByCodeOrName: builder.query({
            query: (query) => ({
                url: `/consumables/get-consumable-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getConsumablesItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/consumables/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getConsumablesItem', 'logIssuedQuantity','getAllConsumablesItems','searchConsumablesLogs','getConsumablesLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.consumable) params.append('consumable', searchParams.consumable);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.expiration_date) params.append('expiration_date', searchParams.expiration_date);
                return {
                    url: `/consumables/restock/get-all?${params.toString()}`,
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
                url: `/consumables/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/consumables/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getConsumablesLogs','getAllConsumablesItems']
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/consumables/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getConsumablesLogs','getAllConsumablesItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/consumables/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getConsumablesLogs','getAllConsumablesItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteConsumablesLog: builder.mutation({
            query: (logId) => ({
                url: `/consumables/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getConsumablesLogs', 'getAllConsumablesItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddConsumablesItemMutation,
    useGetAllConsumablesItemsQuery,
        useDeleteConsumablesItemMutation,
    useGetConsumablesItemQuery,
    useUpdateConsumablesItemMutation,
    useLogIssuedQuantityMutation,
    useGetConsumablesLogsQuery,
    useUpdateLogMutation,
    useDeleteConsumablesLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetConsumableByCodeOrNameQuery,  // Added here
} = ConsumablesApi;
