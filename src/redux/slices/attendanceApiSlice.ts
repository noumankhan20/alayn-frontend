import { baseApi } from "../store/baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    clockIn: builder.mutation({
      query: (body) => ({
        url: "/attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    clockOut: builder.mutation({
      query: (body) => ({
        url: "/attendance/check-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceLogs: builder.query({
      query: () => ({
        url: "/attendance",
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useClockInMutation,
  useClockOutMutation,
  useGetAttendanceLogsQuery,
} = attendanceApi;
