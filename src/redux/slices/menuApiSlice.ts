import { baseApi } from "../store/baseApi";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  items?: MenuItem[];
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], { categoryId?: string; search?: string } | void>({
      query: (params) => ({
        url: "/api/v1/menu/items",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["MenuItems"],
    }),

    getCategories: builder.query<MenuCategory[], void>({
      query: () => ({
        url: "/api/v1/menu/categories",
        method: "GET",
      }),
      providesTags: ["MenuCategories"],
    }),

    createCategory: builder.mutation<MenuCategory, { name: string; description?: string; imageUrl?: string }>({
      query: (body) => ({
        url: "/api/v1/menu/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MenuCategories"],
    }),

    createMenuItem: builder.mutation<MenuItem, Partial<MenuItem>>({
      query: (body) => ({
        url: "/api/v1/menu/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MenuItems"],
    }),

    updateMenuItem: builder.mutation<MenuItem, { id: string; data: Partial<MenuItem> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/menu/items/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["MenuItems"],
    }),

    toggleMenuItemStatus: builder.mutation<MenuItem, { id: string; isAvailable: boolean }>({
      query: ({ id, isAvailable }) => ({
        url: `/api/v1/menu/items/${id}/status`,
        method: "PATCH",
        body: { isAvailable },
      }),
      invalidatesTags: ["MenuItems"],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useToggleMenuItemStatusMutation,
} = menuApi;
