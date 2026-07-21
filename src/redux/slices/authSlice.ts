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
        return !!localStorage.getItem("auth_user") || !!localStorage.getItem("alayn_access_token");
    } catch {
        return false;
    }
};

const initialState: AuthState = {
    user: getInitialUser(),
    isAuthenticated: getInitialIsAuthenticated(),
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setCredentials: (state, action) => {
            const payload = action.payload;
            const user = payload?.user || payload;
            const token = payload?.accessToken || payload?.token;
            const refreshToken = payload?.refreshToken;

            state.user = user;
            state.isAuthenticated = true;

            try {
                localStorage.setItem("auth_user", JSON.stringify(user));
                if (token) {
                    localStorage.setItem("alayn_access_token", token);
                }
                if (refreshToken) {
                    localStorage.setItem("alayn_refresh_token", refreshToken);
                }
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
            } catch {
                // ignore
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;