import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const BooksApi = createApi({
    reducerPath: 'BooksApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getAllBooksItems', 'getBooksItem', 'getAllRestockItems', 'getRestockItem'],
    endpoints: (builder) => ({
        addBooksItem: builder.mutation({
            query: (item) => ({
                url: '/books/register',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllBooksItems']
        }),
        getAllBooksItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.item_code) params.append('item_code', searchParams.item_code);
                if (searchParams.item_name) params.append('item_name', searchParams.item_name);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.author) params.append('author', searchParams.author);
                if (searchParams.status) params.append('status', searchParams.status);
        
                return {
                    url: `/books/get-all?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                };
            },
            providesTags: ['getAllBooksItems'],
        }),
    
        deleteBooksItem: builder.mutation({
            query: (id) => ({
                url: `/books/delete/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllBooksItems'],
        }),
        getBooksItem: builder.query({
            query: (id) => ({
                url: `/books/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getBooksItem'],
        }),
        updateBooksItem: builder.mutation({
            query: ({ data,id }) => ({
                url: `/books/update/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllBooksItems', 'getBooksItem'],
        }),
        logIssuedQuantity: builder.mutation({
            query: (logData) => ({
                url: '/books/register-log',
                method: 'POST',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getBooksItem', 'logIssuedQuantity','getAllBooksItems','searchBooksLogs','getBooksLogs','getAllRestockItems'], 
        }),
        getBooksLogs: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams(searchParams).toString();
                return {
                    url: `/books/get-all-logs?${params}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                };
            },
            providesTags: ['getBooksLogs'],
        }),
        
        // Add the new query for fetching books by item_code or item_name
        getBookByCodeOrName: builder.query({
            query: (query) => ({
                url: `/books/get-book-by-code-or-name?query=${query}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getBooksItem'],
        }),

        
        // Restock CRUD
        addRestockItem: builder.mutation({
            query: (item) => ({
                url: '/books/restock',
                method: 'POST',
                body: item,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getBooksItem', 'logIssuedQuantity','getAllBooksItems','searchBooksLogs','getBooksLogs'],
        }),
        getAllRestockItems: builder.query({
            query: (searchParams) => {
                const params = new URLSearchParams();
                if (searchParams.book) params.append('book', searchParams.book);
                if (searchParams.inward_code) params.append('inward_code', searchParams.inward_code);
                if (searchParams.location) params.append('location', searchParams.location);
                if (searchParams.createdAt) params.append('createdAt', searchParams.createdAt);
                return {
                    url: `/books/restock/get-all?${params.toString()}`,
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
                url: `/books/restock/get/${id}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getRestockItem'],
        }),
        updateRestockItem: builder.mutation({
            query: ({ data, id }) => ({
                url: `/books/restock/${id}`,
                method: 'PATCH',
                body: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems', 'getRestockItem','getBooksLogs','getAllBooksItems']
        }),
        deleteRestockItem: builder.mutation({
            query: (id) => ({
                url: `/books/restock/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getAllRestockItems','getBooksLogs','getAllBooksItems'],
        }),
 
        
        updateLog: builder.mutation({
            query: ({ logId, logData }) => ({
                url: `/books/update-log/${logId}`, // Adjust according to your backend route
                method: 'PATCH',
                body: logData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getBooksLogs','getAllBooksItems','getAllRestockItems'], // Invalidate logs to refetch after updating
        }),
        deleteBooksLog: builder.mutation({
            query: (logId) => ({
                url: `/books/delete-log/${logId}`, // Adjust the endpoint as per your backend route
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            invalidatesTags: ['getBooksLogs', 'getAllBooksItems','getAllRestockItems'], // Invalidate logs to refetch after deletion
        }),
        
    }),

    
});

export const {
    useAddBooksItemMutation,
    useGetAllBooksItemsQuery,
        useDeleteBooksItemMutation,
    useGetBooksItemQuery,
    useUpdateBooksItemMutation,
    useLogIssuedQuantityMutation,
    useGetBooksLogsQuery,
    useUpdateLogMutation,
    useDeleteBooksLogMutation,
    useAddRestockItemMutation,
    useGetAllRestockItemsQuery,
    useGetRestockItemQuery,
    useUpdateRestockItemMutation,
    useDeleteRestockItemMutation,
    useGetBookByCodeOrNameQuery,  // Added here
} = BooksApi;
