import { baseApi } from "../store/baseApi";

export interface OrderItem {
  id?: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  menuItem?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface CreateOrderPayload {
  outletId?: string;
  orderSource: "COUNTER" | "QR" | "DELIVERY";
  tableNo?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
  paymentMethod: "CASH" | "CARD" | "UPI";
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  outletId: string;
  orderSource: "COUNTER" | "QR" | "DELIVERY";
  tableNo?: string;
  status: "RECEIVED" | "PREPARING" | "READY" | "SERVED" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: "CASH" | "CARD" | "UPI";
  paymentStatus: "PENDING" | "CONFIRMED" | "FAILED";
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], { status?: string; outletId?: string } | void>({
      query: (params) => ({
        url: "/api/v1/orders",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Orders"],
    }),

    getKitchenTickets: builder.query<Order[], void>({
      query: () => ({
        url: "/api/v1/kitchen/tickets",
        method: "GET",
      }),
      providesTags: ["KitchenTickets"],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({
        url: "/api/v1/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "KitchenTickets"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: Order["status"] }>({
      query: ({ id, status }) => ({
        url: `/api/v1/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders", "KitchenTickets"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetKitchenTicketsQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
