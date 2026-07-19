import { baseApi } from "../store/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({
                url: "/api/v1/auth/register",
                method: "POST",
                body,
            }),
        }),

        login: builder.mutation({
            query: (body) => ({
                url: "/api/v1/auth/login",
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
} = authApi;