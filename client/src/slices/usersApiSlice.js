import { apiSlice } from './apiSlice';
import { AUTH_URL, USERS_URL } from '../utils/urls';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: 'POST',
      }),
    }),
    register: builder.mutation({
        query: (data) => ({
            url: `${AUTH_URL}/register`,
            method: 'POST',
            body: data,
        }),
    }),
    updateProfile: builder.mutation({
        query: (data) => ({
            url: `${USERS_URL}/my-profile`,
            method: 'PUT',
            body: data,
        }),
    }),
    getUsers: builder.query({
        query: () => ({
            url: USERS_URL,
        }),
        providesTags: ['User'],
        keepUnusedDataFor: 5,
    }),
    getUserDetails: builder.query({
        query: (username) => ({
            url: `${USERS_URL}/${username}`,
        }),
        keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} = userApiSlice;