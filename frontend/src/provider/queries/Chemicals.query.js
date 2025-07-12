import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ChemicalsApi = createApi({
    reducerPath: 'ChemicalsApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllChemicalsItems', 'getChemicalsItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addChemicalsItem: builder.mutation({
            query: (item) => ({
                url: '/chemicals/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllChemicalsItems']
        }),
        getAllChemicalsItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.casNo) params.append('casNo', searchParams.casNo);
                if (searchParams.company) params.append('company', searchParams.company);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/chemicals/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllChemicalsItems'],
        }),
    
        deleteChemicalsItem: builder.mutation({
            query: (id) => ({
                url: `/chemicals/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllChemicalsItems'],
        }),
        getChemicalsItem: builder.query({
            query: (id) => ({
                url: `/chemicals/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getChemicalsItem'],
        }),
        updateChemicalsItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/chemicals/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllChemicalsItems', 'getChemicalsItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/chemicals/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getChemicalsItem', 'logIssuedQuantity','getAllChemicalsItems','searchChemicalsLogs','getChemicalsLogs','getAllRestockItems'], 
        }),
        getChemicalsLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/chemicals/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getChemicalsLogs'],
        }),
        
        // Add the new query for fetching chemicals by item_code or item_name
        getChemicalByCodeOrName: builder.query({
            query: (query) => ({
                url: `/chemicals/get-chemical-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getChemicalsItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/chemicals/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getChemicalsItem', 'logIssuedQuantity','getAllChemicalsItems','searchChemicalsLogs','getChemicalsLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.chemical) params.append('chemical', searchParams.chemical);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.expiration_date) params.append('expiration_date', searchParams.expiration_date);
                return {
                    url: `/chemicals/restock/get-all?${params.toString()}`,
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
                url: `/chemicals/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/chemicals/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getChemicalsLogs','getAllChemicalsItems']
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/chemicals/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getChemicalsLogs','getAllChemicalsItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/chemicals/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getChemicalsLogs','getAllChemicalsItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteChemicalsLog: builder.mutation({
            query: (logId) => ({
                url: `/chemicals/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getChemicalsLogs', 'getAllChemicalsItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddChemicalsItemMutation,
    useGetAllChemicalsItemsQuery,
        useDeleteChemicalsItemMutation,
    useGetChemicalsItemQuery,
    useUpdateChemicalsItemMutation,
    useLogIssuedQuantityMutation,
    useGetChemicalsLogsQuery,
    useUpdateLogMutation,
    useDeleteChemicalsLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetChemicalByCodeOrNameQuery,  // Added here
} = ChemicalsApi;
