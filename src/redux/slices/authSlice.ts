import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    user: any;
    // token: string | null;
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

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            // state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem(
                "auth_user",
                JSON.stringify(action.payload)
            );
        },

        logout: (state) => {
            state.user = null;
            // state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("auth_user");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;