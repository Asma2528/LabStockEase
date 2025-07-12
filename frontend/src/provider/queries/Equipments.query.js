import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const EquipmentsApi = createApi({
    reducerPath: 'EquipmentsApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllEquipmentsItems', 'getEquipmentsItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addEquipmentsItem: builder.mutation({
            query: (item) => ({
                url: '/equipments/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllEquipmentsItems']
        }),
        getAllEquipmentsItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.serial_number) params.append('serial_number', searchParams.serial_number);
                if (searchParams.company) params.append('company', searchParams.company);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/equipments/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllEquipmentsItems'],
        }),
    
        deleteEquipmentsItem: builder.mutation({
            query: (id) => ({
                url: `/equipments/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllEquipmentsItems'],
        }),
        getEquipmentsItem: builder.query({
            query: (id) => ({
                url: `/equipments/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getEquipmentsItem'],
        }),
        updateEquipmentsItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/equipments/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllEquipmentsItems', 'getEquipmentsItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/equipments/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getEquipmentsItem', 'logIssuedQuantity','getAllEquipmentsItems','searchEquipmentsLogs','getEquipmentsLogs','getAllRestockItems'], 
        }),
        getEquipmentsLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/equipments/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getEquipmentsLogs'],
        }),
        
        // Add the new query for fetching equipments by item_code or item_name
        getEquipmentByCodeOrName: builder.query({
            query: (query) => ({
                url: `/equipments/get-equipment-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getEquipmentsItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/equipments/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getEquipmentsItem', 'logIssuedQuantity','getAllEquipmentsItems','searchEquipmentsLogs','getEquipmentsLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.equipment) params.append('equipment', searchParams.equipment);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.expiration_date) params.append('expiration_date', searchParams.expiration_date);
                return {
                    url: `/equipments/restock/get-all?${params.toString()}`,
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
                url: `/equipments/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/equipments/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getEquipmentsLogs','getAllEquipmentsItems']
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/equipments/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getEquipmentsLogs','getAllEquipmentsItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/equipments/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getEquipmentsLogs','getAllEquipmentsItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        returnLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/equipments/return-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getEquipmentsLogs','getAllEquipmentsItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteEquipmentsLog: builder.mutation({
            query: (logId) => ({
                url: `/equipments/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getEquipmentsLogs', 'getAllEquipmentsItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddEquipmentsItemMutation,
    useGetAllEquipmentsItemsQuery,
        useDeleteEquipmentsItemMutation,
    useGetEquipmentsItemQuery,
    useUpdateEquipmentsItemMutation,
    useLogIssuedQuantityMutation,
    useGetEquipmentsLogsQuery,
    useUpdateLogMutation,
    useReturnLogMutation,
    useDeleteEquipmentsLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetEquipmentByCodeOrNameQuery,  // Added here
} = EquipmentsApi;
