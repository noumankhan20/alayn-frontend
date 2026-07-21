import { baseApi } from "../store/baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    clockIn: builder.mutation({
      query: (body) => ({
        url: "/api/v1/attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    clockOut: builder.mutation({
      query: (body) => ({
        url: "/api/v1/attendance/check-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceLogs: builder.query({
      query: () => ({
        url: "/api/v1/attendance",
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
