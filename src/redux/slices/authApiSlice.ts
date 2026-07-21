import { baseApi } from "../store/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Auth"],
        }),

        login: builder.mutation({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["Auth"],
        }),

        getMe: builder.query({
            query: () => "/auth/me",
            providesTags: ["Auth"],
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
                credentials: "include",
            }),
            invalidatesTags: ["Auth"],
        }),

        refreshToken: builder.mutation({
            query: (body) => ({
                url: "/auth/refresh",
                method: "POST",
                body,
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetMeQuery,
    useLogoutMutation,
    useRefreshTokenMutation,
} = authApi;