import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    user: any;
    isAuthenticated: boolean;
}

const getInitialUser = () => {
    if (typeof window === "undefined") return null;
    try {
        const item = localStorage.getItem("auth_user");
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

const getInitialIsAuthenticated = () => {
    if (typeof window === "undefined") return false;
    try {
        return !!localStorage.getItem("auth_user");
    } catch {
        return false;
    }
};

const initialState: AuthState = {
    user: getInitialUser(),
    isAuthenticated: getInitialIsAuthenticated(),
};

const isLoginFulfilled = (action: any): boolean =>
    action?.type === "api/executeMutation/fulfilled" && action?.meta?.arg?.endpointName === "login";

const isGetMeFulfilled = (action: any): boolean =>
    action?.type === "api/executeQuery/fulfilled" && action?.meta?.arg?.endpointName === "getMe";

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setCredentials: (state, action) => {
            const payload = action.payload;
            const user = payload?.user || payload;

            state.user = user;
            state.isAuthenticated = true;

            try {
                localStorage.setItem("auth_user", JSON.stringify(user));
                localStorage.removeItem("alayn_access_token");
                localStorage.removeItem("alayn_refresh_token");
            } catch {
                // ignore
            }
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            try {
                localStorage.removeItem("auth_user");
                localStorage.removeItem("alayn_access_token");
                localStorage.removeItem("alayn_refresh_token");
                localStorage.removeItem("alayn_active_branch_id");
                localStorage.removeItem("alayn_cached_branches");
                if (typeof document !== "undefined") {
                    document.cookie = "token=; Max-Age=0; path=/;";
                    document.cookie = "refreshToken=; Max-Age=0; path=/;";
                }
            } catch {
                // ignore
            }
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            isLoginFulfilled,
            (state, action: any) => {
                const payload = action.payload?.data || action.payload;
                const user = payload?.user || payload;

                state.isAuthenticated = true;
                state.user = user;
                try {
                    localStorage.setItem("auth_user", JSON.stringify(user));
                    localStorage.removeItem("alayn_access_token");
                    localStorage.removeItem("alayn_refresh_token");
                } catch {
                    // ignore
                }
            }
        );
        builder.addMatcher(
            isGetMeFulfilled,
            (state, action: any) => {
                const user = action.payload?.data || action.payload;
                state.isAuthenticated = true;
                state.user = user;
                try {
                    localStorage.setItem("auth_user", JSON.stringify(user));
                    localStorage.removeItem("alayn_access_token");
                    localStorage.removeItem("alayn_refresh_token");
                } catch {
                    // ignore
                }
            }
        );
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;