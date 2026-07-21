"use client";

import React, { useState, useMemo } from "react";
import {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useToggleMenuItemStatusMutation,
  MenuItem,
} from "@/redux/slices/menuApiSlice";
import {
  Plus,
  Search,
  Tag,
  UtensilsCrossed,
  Upload,
  Pencil,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import { getImageUrl } from "@/lib/utils";

type StatusFilter = "ALL" | "ACTIVE";
type DietaryFilter = "ALL" | "VEG" | "NON_VEG";
type SortOption = "NAME_ASC" | "PRICE_ASC" | "PRICE_DESC";

export default function MenuManagementComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NAME_ASC");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isVeg: true,
  });

  const [editItem, setEditItem] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isVeg: true,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  // RTK Query Hooks
  const { data: rawCategories = [], isLoading: isCatLoading } = useGetCategoriesQuery();
  const { data: rawMenuItems = [], isLoading: isItemsLoading } = useGetMenuItemsQuery({
    categoryId: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
    isAvailable: statusFilter === "ACTIVE" ? true : undefined,
    isVeg: dietaryFilter === "VEG" ? true : dietaryFilter === "NON_VEG" ? false : undefined,
  });
  const categories = useMemo(() => (Array.isArray(rawCategories) ? rawCategories : []), [rawCategories]);
  const menuItems = useMemo(() => (Array.isArray(rawMenuItems) ? rawMenuItems : []), [rawMenuItems]);

  const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdatingItem }] = useUpdateMenuItemMutation();
  const [toggleStatus] = useToggleMenuItemStatusMutation();

  // File upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "ITEM" | "CATEGORY" | "EDIT_ITEM") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === "ITEM") {
          setNewItem((prev) => ({ ...prev, imageUrl: result }));
        } else if (target === "CATEGORY") {
          setNewCategory((prev) => ({ ...prev, imageUrl: result }));
        } else if (target === "EDIT_ITEM") {
          setEditItem((prev) => ({ ...prev, imageUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = menuItems.length;
    const active = menuItems.filter((i) => i.isAvailable).length;
    const catCount = categories.length;
    return { total, active, catCount };
  }, [menuItems, categories]);

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    return [...menuItems].sort((a, b) => {
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      if (sortBy === "PRICE_ASC") return Number(a.price) - Number(b.price);
      if (sortBy === "PRICE_DESC") return Number(b.price) - Number(a.price);
      return 0;
    });
  }, [menuItems, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(processedItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedItems.slice(start, start + pageSize);
  }, [processedItems, currentPage, pageSize]);

  // Reset page when filters change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDietaryFilterChange = (dietary: DietaryFilter) => {
    setDietaryFilter(dietary);
    setCurrentPage(1);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await createCategory(newCategory).unwrap();
      setNewCategory({ name: "", description: "", imageUrl: "" });
      setIsAddCategoryOpen(false);
    } catch (err) {
      console.error("Failed to create category:", err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.categoryId) return;
    try {
      await createMenuItem({
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        categoryId: newItem.categoryId,
        imageUrl: newItem.imageUrl,
        isVeg: newItem.isVeg,
        isAvailable: true,
      }).unwrap();
      setNewItem({ name: "", description: "", price: "", categoryId: "", imageUrl: "", isVeg: true });
      setIsAddItemOpen(false);
    } catch (err) {
      console.error("Failed to create menu item:", err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await toggleStatus({ id: item.id, isAvailable: !item.isAvailable }).unwrap();
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditItem({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price !== undefined ? item.price.toString() : "",
      categoryId: item.categoryId || "",
      imageUrl: item.imageUrl || "",
      isVeg: item.isVeg !== false,
    });
    setIsEditItemOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem.name || !editItem.price || !editItem.categoryId) return;
    try {
      await updateMenuItem({
        id: editItem.id,
        data: {
          name: editItem.name,
          description: editItem.description,
          price: parseFloat(editItem.price),
          categoryId: editItem.categoryId,
          imageUrl: editItem.imageUrl,
          isVeg: editItem.isVeg,
        },
      }).unwrap();
      setIsEditItemOpen(false);
    } catch (err) {
      console.error("Failed to update menu item:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-[#F4F5F8] min-h-screen text-[#1B2A4A]">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-[#D3232A]" />
              Menu Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Scalable product catalog dashboard for managing dishes, categories, pricing, and stock status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="btn-ghost flex justify-center items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            >
              <Tag className="w-4 h-4 text-gray-500" />
              Add Category
            </button>
            <button
              onClick={() => setIsAddItemOpen(true)}
              className="btn-primary flex justify-center items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Scalable Stats Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Items</p>
              <h3 className="text-2xl font-extrabold text-[#1B2A4A] mt-1">{metrics.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Items</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.active}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{metrics.catCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Toolbar & Filters Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
          {/* Top Row: Search, Status Filter, Sort, View Toggle */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dish name or description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#D3232A] transition"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-medium">
                <button
                  onClick={() => handleStatusFilterChange("ALL")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    statusFilter === "ALL"
                      ? "bg-white text-[#1B2A4A] font-bold shadow-xs border border-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => handleStatusFilterChange("ACTIVE")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    statusFilter === "ACTIVE"
                      ? "bg-emerald-500 text-white font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
              </div>

              {/* Dietary Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-medium">
                <button
                  onClick={() => handleDietaryFilterChange("ALL")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    dietaryFilter === "ALL"
                      ? "bg-white text-[#1B2A4A] font-bold shadow-xs border border-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => handleDietaryFilterChange("VEG")}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                    dietaryFilter === "VEG"
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Veg
                </button>
                <button
                  onClick={() => handleDietaryFilterChange("NON_VEG")}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                    dietaryFilter === "NON_VEG"
                      ? "bg-rose-600 text-white font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Non-Veg
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 font-semibold">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-gray-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="NAME_ASC">Name (A-Z)</option>
                  <option value="PRICE_ASC">Price (Low → High)</option>
                  <option value="PRICE_DESC">Price (High → Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs Pill Row */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-gray-100">
            <button
              onClick={() => handleCategoryChange("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                selectedCategory === "ALL"
                  ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat.imageUrl && (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body: Table View */}
        {isItemsLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-3 shadow-xs">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : processedItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-xs">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No menu items found</h3>
            <p className="text-gray-500 text-sm mt-1">Try resetting filters, changing search terms, or adding a new menu item.</p>
          </div>
        ) : (
          /* HIGH-DENSITY COMPACT TABLE VIEW */
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                              <UtensilsCrossed className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs border p-0.5 shrink-0 ${
                                  item.isVeg !== false ? "border-emerald-600" : "border-rose-600"
                                }`}
                                title={item.isVeg !== false ? "Vegetarian" : "Non-Vegetarian"}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isVeg !== false ? "bg-emerald-600" : "bg-rose-600"
                                  }`}
                                />
                              </span>
                              <p className="font-bold text-[#1B2A4A]">{item.name}</p>
                            </div>
                            <p className="text-xs text-gray-400 max-w-xs truncate">
                              {item.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {item.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-[#1B2A4A]">
                        ₹{Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isAvailable ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                            title={item.isAvailable ? "Click to Deactivate" : "Click to Activate"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out ${
                                item.isAvailable ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-bold ${
                              item.isAvailable ? "text-emerald-700" : "text-gray-500"
                            }`}
                          >
                            {item.isAvailable ? "Active" : "Deactivated"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-[#D3232A] hover:bg-gray-100 transition text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scalable Pagination Footer */}
        {processedItems.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Range info */}
            <div className="text-xs text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {Math.min((currentPage - 1) * pageSize + 1, processedItems.length)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-900">
                {Math.min(currentPage * pageSize, processedItems.length)}
              </span>{" "}
              of <span className="font-bold text-gray-900">{processedItems.length}</span> items
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs font-bold text-[#1B2A4A]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {isAddItemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 pb-3 border-b border-gray-100">
                <Plus className="w-5 h-5 text-[#D3232A]" /> Create Menu Item
              </h2>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Butter Chicken Special"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Dietary Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dietary Type *</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, isVeg: true })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        newItem.isVeg
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-2xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Veg (Vegetarian)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, isVeg: false })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        !newItem.isVeg
                          ? "bg-rose-50 text-rose-700 border-rose-500 shadow-2xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Non-Veg
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="350.00"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={newItem.categoryId}
                      onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Item Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Photo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer hover:bg-gray-100 transition">
                      <Upload className="w-4 h-4 text-[#D3232A]" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "ITEM")}
                        className="hidden"
                      />
                    </label>
                    {newItem.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={newItem.imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                        <span className="text-[11px] text-emerald-600 font-bold">Image Uploaded</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">No image chosen</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short dish summary, ingredients..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="input resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddItemOpen(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingItem}
                    className="btn-primary"
                  >
                    {isCreatingItem ? "Creating..." : "Save Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 pb-3 border-b border-gray-100">
                <Tag className="w-5 h-5 text-[#D3232A]" /> New Menu Category
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starters, Beverages"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Upload Category Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category Icon/Photo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer hover:bg-gray-100 transition">
                      <Upload className="w-4 h-4 text-[#D3232A]" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "CATEGORY")}
                        className="hidden"
                      />
                    </label>
                    {newCategory.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={newCategory.imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                        <span className="text-[11px] text-emerald-600 font-bold">Image Uploaded</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">No image chosen</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Optional category description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCat}
                    className="btn-primary"
                  >
                    {isCreatingCat ? "Saving..." : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {isEditItemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 pb-3 border-b border-gray-100">
                <Pencil className="w-5 h-5 text-[#D3232A]" /> Edit Menu Item
              </h2>
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Butter Chicken Special"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Dietary Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dietary Type *</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditItem({ ...editItem, isVeg: true })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        editItem.isVeg
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-2xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Veg (Vegetarian)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditItem({ ...editItem, isVeg: false })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        !editItem.isVeg
                          ? "bg-rose-50 text-rose-700 border-rose-500 shadow-2xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Non-Veg
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="350.00"
                      value={editItem.price}
                      onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={editItem.categoryId}
                      onChange={(e) => setEditItem({ ...editItem, categoryId: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Item Photo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Photo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer hover:bg-gray-100 transition">
                      <Upload className="w-4 h-4 text-[#D3232A]" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "EDIT_ITEM")}
                        className="hidden"
                      />
                    </label>
                    {editItem.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={getImageUrl(editItem.imageUrl)} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                        <span className="text-[11px] text-emerald-600 font-bold">Image Set</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">No image chosen</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short dish summary, ingredients..."
                    value={editItem.description}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                    className="input resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditItemOpen(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingItem}
                    className="btn-primary"
                  >
                    {isUpdatingItem ? "Updating..." : "Update Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
