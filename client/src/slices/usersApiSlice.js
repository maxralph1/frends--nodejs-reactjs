import { AUTH_URL, USERS_URL } from '../utils/urls';
import { apiSlice } from './apiSlice';

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
    searchUser: builder.query({
        query: () => ({
            url: `${USERS_URL}/search/${searchKey}`,
        }),
        providesTags: ['User'],
        keepUnusedDataFor: 5,
    }),
    getUser: builder.query({
        query: (user) => ({
            url: `${USERS_URL}/${user}`,
        }),
        keepUnusedDataFor: 5,
    }),
    getUserFriends: builder.query({
        query: (user) => ({
            url: `${USERS_URL}/${user}/friends`,
        }),
        keepUnusedDataFor: 5,
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserByAdmin: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    addRemoveFriend: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}/friend/${data.friendId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    followUnfollowUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}/follows`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    softDeleteUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}/delete`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    reactivateDeletedUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}/re-activate`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'DELETE',
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
  useGetUsersQuery, 
  useSearchUserQuery, 
  useGetUserQuery, 
  useGetUserFriendsQuery, 
  useUpdateUserMutation, 
  useUpdateUserByAdminMutation, 
  useAddRemoveFriendMutation, 
  useFollowUnfollowUserMutation, 
  useSoftDeleteUserMutation, 
  useReactivateDeletedUserMutation, 
  useDeleteUserMutation, 
} = userApiSlice;