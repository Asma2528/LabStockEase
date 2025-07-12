import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const AuthApi = createApi({
    reducerPath: 'AuthApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['User'], // ✅ Define cache tag
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (obj) => ({
                url: '/auth/register',
                method: 'POST',
                body: obj,
            }),
            invalidatesTags: ['User'], // ✅ Invalidate cache after new user
        }),
        loginUser: builder.mutation({
            query: (obj) => ({
                url: '/auth/login',
                method: 'POST',
                body: obj,
            }),
        }),
        forgotPassword: builder.mutation({
            query: (obj) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: obj,
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: `/auth/forgot-password/reset-password/${token}`,
                method: 'POST',
                body: { password },
            }),
        }),
        updateUser: builder.mutation({
            query: ({ userId, userData }) => ({
                url: `/auth/update/${userId}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'], // ✅ Invalidate users list on update
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/auth/delete/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'], // ✅ Invalidate users list on delete
        }),
        fetchAllUsers: builder.query({
            query: () => ({
                url: '/auth/users',
                method: 'GET',
            }),
            providesTags: ['User'], // ✅ Tagging for auto-refetch
        }),
    }),
});

export const { 
    useRegisterUserMutation, 
    useLoginUserMutation, 
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useFetchAllUsersQuery
} = AuthApi;
