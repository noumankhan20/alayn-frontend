import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    user: null;
    // token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    // token: null,
    isAuthenticated: false,
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