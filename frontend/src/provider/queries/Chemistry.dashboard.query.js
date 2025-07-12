import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ChemistryDashboardApi = createApi({
    reducerPath: 'DashboardApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),

    tagTypes: ['getDashboardData'],
    endpoints: (builder) => ({
        // Fetches all necessary dashboard data
        getDashboardData: builder.query({
            query: () => ({
                url: '/chemistry-dashboard/cards-data', // Update with your actual backend route
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            }),
            providesTags: ['getDashboardData'],
        }),
        // Add other endpoints if needed for dashboard functionality
    }),
});

export const {
    useGetDashboardDataQuery,
} = ChemistryDashboardApi;
