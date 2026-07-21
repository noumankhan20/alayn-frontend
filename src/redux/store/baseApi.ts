import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../slices/authSlice";

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE_URL = RAW_URL.endsWith("/") ? RAW_URL.slice(0, -1) : RAW_URL;

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL || "http://localhost:5000/api/v1",
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
    prepareHeaders: (headers) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("alayn_access_token") ||
                (localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user")!)?.accessToken : null);
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
        const urlStr = typeof args === "string" ? args : args.url;
        // Don't loop refresh if refresh or login itself returned 401
        if (urlStr.includes("/auth/refresh") || urlStr.includes("/auth/login")) {
            return result;
        }

        const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("alayn_refresh_token") : null;

        // Try to get a new access token via refresh endpoint
        const refreshResult = await baseQuery(
            {
                url: "/api/v1/auth/refresh",
                method: "POST",
                body: storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined,
                headers: storedRefreshToken ? { "x-refresh-token": storedRefreshToken } : undefined,
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const refreshData = (refreshResult.data as any)?.data || refreshResult.data;
            const newAccessToken = refreshData?.accessToken;
            const newRefreshToken = refreshData?.refreshToken;
            const user = refreshData?.user;

            if (typeof window !== "undefined") {
                if (newAccessToken) {
                    localStorage.setItem("alayn_access_token", newAccessToken);
                }
                if (newRefreshToken) {
                    localStorage.setItem("alayn_refresh_token", newRefreshToken);
                }
            }

            if (user) {
                api.dispatch(setCredentials({ user, accessToken: newAccessToken, refreshToken: newRefreshToken }));
            }

            // Retry the original query with updated headers
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
        "MenuItems",
        "MenuCategories",
        "Orders",
        "KitchenTickets",
        "Shift",
        "Leave",
    ],

    endpoints: () => ({}),
});
