import { baseApi } from "../store/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            }),
        }),

        login: builder.mutation({
            query: (body) => ({
                url: "/auth/login",
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