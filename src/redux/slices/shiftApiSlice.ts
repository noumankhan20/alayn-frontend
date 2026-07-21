import { baseApi } from "../store/baseApi";

export const shiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query({
      query: () => ({
        url: "/api/v1/shifts",
        method: "GET",
      }),
      providesTags: ["Shift"],
    }),
    createShift: builder.mutation({
      query: (body) => ({
        url: "/api/v1/shifts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shift"],
    }),
    assignShift: builder.mutation({
      query: ({ shiftId, ...body }) => ({
        url: `/api/v1/shifts/${shiftId}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shift"],
    }),
    requestSwap: builder.mutation({
      query: (body) => ({
        url: "/api/v1/shifts/swaps",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shift"],
    }),
    updateSwapStatus: builder.mutation({
      query: ({ swapId, status }) => ({
        url: `/api/v1/shifts/swaps/${swapId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Shift"],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useAssignShiftMutation,
  useRequestSwapMutation,
  useUpdateSwapStatusMutation,
} = shiftApi;
