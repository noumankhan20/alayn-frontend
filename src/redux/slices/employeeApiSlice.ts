import { baseApi } from "../store/baseApi";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => ({
        url: "/api/v1/employees",
        method: "GET",
        params,
      }),
      providesTags: ["Employee"],
    }),
    createEmployee: builder.mutation({
      query: (body) => ({
        url: "/api/v1/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee"],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/employees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Employee"],
    }),
    uploadDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/employees/${id}/documents`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Employee"],
    }),
    getLeaveRequests: builder.query({
      query: () => ({
        url: "/api/v1/leave-requests",
        method: "GET",
      }),
      providesTags: ["Leave"],
    }),
    createLeaveRequest: builder.mutation({
      query: (body) => ({
        url: "/api/v1/leave-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leave"],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/v1/leave-requests/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Leave"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUploadDocumentMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
} = employeeApi;
