import { baseApi } from "../store/baseApi";

export interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  businessId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOutletInput {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export const outletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOutlets: builder.query<Outlet[], void>({
      query: () => "/outlets",
      transformResponse: (response: { data?: Outlet[]; success?: boolean } | Outlet[]) => {
        if (Array.isArray(response)) return response;
        return response?.data || [];
      },
      providesTags: ["Outlet"],
      keepUnusedDataFor: 300,
    }),

    createOutlet: builder.mutation<Outlet, CreateOutletInput>({
      query: (body) => ({
        url: "/outlets",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: Outlet } | Outlet) => {
        if ("data" in response && response.data) return response.data;
        return response as Outlet;
      },
      invalidatesTags: ["Outlet"],
    }),
  }),
});

export const {
  useGetOutletsQuery,
  useCreateOutletMutation,
} = outletApi;
