import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const GlasswaresApi = createApi({
    reducerPath: 'GlasswaresApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllGlasswaresItems', 'getGlasswaresItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addGlasswaresItem: builder.mutation({
            query: (item) => ({
                url: '/glasswares/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllGlasswaresItems']
        }),
        getAllGlasswaresItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.company) params.append('company', searchParams.company);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/glasswares/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllGlasswaresItems'],
        }),
    
        deleteGlasswaresItem: builder.mutation({
            query: (id) => ({
                url: `/glasswares/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllGlasswaresItems'],
        }),
        getGlasswaresItem: builder.query({
            query: (id) => ({
                url: `/glasswares/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getGlasswaresItem'],
        }),
        updateGlasswaresItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/glasswares/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllGlasswaresItems', 'getGlasswaresItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/glasswares/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getGlasswaresItem', 'logIssuedQuantity','getAllGlasswaresItems','searchGlasswaresLogs','getGlasswaresLogs','getAllRestockItems'], 
        }),
        getGlasswaresLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/glasswares/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getGlasswaresLogs'],
        }),
        
        // Add the new query for fetching glasswares by item_code or item_name
        getGlasswareByCodeOrName: builder.query({
            query: (query) => ({
                url: `/glasswares/get-glassware-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getGlasswaresItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/glasswares/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getGlasswaresItem', 'logIssuedQuantity','getAllGlasswaresItems','searchGlasswaresLogs','getGlasswaresLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.glassware) params.append('glassware', searchParams.glassware);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.createdAt) params.append('createdAt', searchParams.createdAt   );
                return {
                    url: `/glasswares/restock/get-all?${params.toString()}`,
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
                url: `/glasswares/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/glasswares/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getGlasswaresLogs','getAllGlasswaresItems']
        }),
        returnLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/glasswares/return-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getGlasswaresLogs','getAllGlasswaresItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/glasswares/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getGlasswaresLogs','getAllGlasswaresItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/glasswares/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getGlasswaresLogs','getAllGlasswaresItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteGlasswaresLog: builder.mutation({
            query: (logId) => ({
                url: `/glasswares/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getGlasswaresLogs', 'getAllGlasswaresItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddGlasswaresItemMutation,
    useGetAllGlasswaresItemsQuery,
        useDeleteGlasswaresItemMutation,
    useGetGlasswaresItemQuery,
    useUpdateGlasswaresItemMutation,
    useLogIssuedQuantityMutation,
    useGetGlasswaresLogsQuery,
    useUpdateLogMutation,
    useReturnLogMutation,
    useDeleteGlasswaresLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetGlasswareByCodeOrNameQuery,  // Added here
} = GlasswaresApi;
