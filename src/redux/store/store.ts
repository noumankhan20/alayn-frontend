import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "../slices/authSlice";
import { rtkQueryToastMiddleware } from "../middleware/rtkQueryToastMiddleware";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(baseApi.middleware, rtkQueryToastMiddleware),

    devTools: process.env.NODE_ENV !== "production" ? { maxAge: 25 } : false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;