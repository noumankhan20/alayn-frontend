import { baseApi } from "../store/baseApi";

export interface KpiResponse {
  totalRevenue: { value: string; change: string; isPositive: boolean };
  cogs: { value: string; change: string; isPositive: boolean };
  grossProfit: { value: string; change: string; isPositive: boolean };
  laborCosts: { value: string; change: string; isPositive: boolean };
  netMargin: { value: string; change: string; isPositive: boolean };
}

export interface SalesForecastPoint {
  date: string;
  actual?: number;
  projected?: number;
}

export interface InventoryForecastPoint {
  item: string;
  currentStock: number;
  threshold: number;
  daysRemaining: number;
}

export const dashboardApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKpis: builder.query<KpiResponse, { outletId?: string }>({
      query: ({ outletId }) => ({
        url: "/api/v1/dashboard/kpi",
        params: outletId ? { outletId } : undefined,
      }),
      providesTags: ["Dashboard"],
    }),
    getSalesForecast: builder.query<SalesForecastPoint[], { outletId?: string }>({
      query: ({ outletId }) => ({
        url: "/api/v1/dashboard/sales-forecast",
        params: outletId ? { outletId } : undefined,
      }),
      providesTags: ["Dashboard"],
    }),
    getInventoryForecast: builder.query<InventoryForecastPoint[], { outletId?: string }>({
      query: ({ outletId }) => ({
        url: "/api/v1/dashboard/inventory-forecast",
        params: outletId ? { outletId } : undefined,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetKpisQuery,
  useGetSalesForecastQuery,
  useGetInventoryForecastQuery,
} = dashboardApiSlice;
