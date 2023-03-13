import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token

        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.status === 403) {
        console.log('Sending refresh token')

        const refreshResult = await baseQuery('/api/auth/refresh', api, extraOptions)

        if (refreshResult?.data) {
            api.dispatch(setCredentials({ ...refreshResult.data }))

            result = await baseQuery(args, api, extraOptions)
        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "Your login has expired."
            }
            return refreshResult
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Post', 'User'],
    endpoints: builder => ({})
})