import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Try to get a new access token via refresh endpoint
        const refreshResult = await baseQuery(
            {
                url: "/api/v1/auth/refresh",
                method: "POST",
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const refreshData = refreshResult.data as any;
            const user = refreshData?.data?.user;
            if (user) {
                api.dispatch(setCredentials(user));
            }
            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
        } else {
            // Refresh failed - log out the user
            api.dispatch(logout());
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",

    baseQuery: baseQueryWithReauth,

    tagTypes: [
        "Auth",
        "Employee",
        "Outlet",
        "Inventory",
        "Attendance",
        "Dashboard",
    ],

    endpoints: () => ({}),
});