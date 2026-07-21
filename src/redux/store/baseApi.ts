import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    credentials: "include",

    prepareHeaders: (headers) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("alayn_access_token");
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            const outletId = localStorage.getItem("alayn_active_branch_id");
            if (outletId) {
                headers.set("x-outlet-id", outletId);
            }
        }
        return headers;
    },
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
                url: "/auth/refresh",
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
        "PurchaseOrder",
        "Supplier",
        "Waste",
    ],

    endpoints: () => ({}),
});
