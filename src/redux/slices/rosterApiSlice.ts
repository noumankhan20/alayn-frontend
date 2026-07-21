import { baseApi } from "../store/baseApi";

export const rosterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeRoster: builder.query({
      query: (employeeId: string) => ({
        url: `/shifts/rosters/employee/${employeeId}`,
        method: "GET",
      }),
      providesTags: ["Roster"],
    }),
    getOutletRosters: builder.query({
      query: () => ({
        url: "/shifts/rosters/outlet",
        method: "GET",
      }),
      providesTags: ["Roster"],
    }),
    setWeeklyRoster: builder.mutation({
      query: (body: {
        employeeId: string;
        weeklySchedule: Array<{ dayOfWeek: string; shiftId: string | null }>;
      }) => ({
        url: "/shifts/rosters",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roster"],
    }),
  }),
});

export const {
  useGetEmployeeRosterQuery,
  useGetOutletRostersQuery,
  useSetWeeklyRosterMutation,
} = rosterApi;
