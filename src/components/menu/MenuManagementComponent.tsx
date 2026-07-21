"use client";

import React, { useState } from "react";
import {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useToggleMenuItemStatusMutation,
  MenuItem,
} from "@/redux/slices/menuApiSlice";
import { Plus, Search, Tag, UtensilsCrossed, CheckCircle2, XCircle, Upload, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import { getImageUrl } from "@/lib/utils";

export default function MenuManagementComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  // RTK Query Hooks
  const { data: categories = [], isLoading: isCatLoading } = useGetCategoriesQuery();
  const { data: menuItems = [], isLoading: isItemsLoading } = useGetMenuItemsQuery();
  const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateMenuItemMutation();
  const [toggleStatus] = useToggleMenuItemStatusMutation();

  // Helper function to handle local image file upload & convert to preview/path string
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "ITEM" | "CATEGORY") => {
    const file = e.target.files?.[0];
    if (file) {
      const fakePath = `/uploads/${file.name}`;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === "ITEM") {
          setNewItem((prev) => ({ ...prev, imageUrl: result }));
        } else {
          setNewCategory((prev) => ({ ...prev, imageUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        isAvailable: true,
      }).unwrap();
      setNewItem({ name: "", description: "", price: "", categoryId: "", imageUrl: "" });
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

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-[#F4F5F8] min-h-screen text-[#1B2A4A]">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#D3232A]" />
            Menu Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure product catalog, categories, pricing, optional photo uploads, and availability.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="btn-ghost flex justify-center items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
          >
            <Tag className="w-4 h-4 text-gray-500" />
            Add Category
          </button>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="btn-primary flex justify-center w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
              selectedCategory === "ALL"
                ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.imageUrl && (
                  <img src={getImageUrl(cat.imageUrl)} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-auto min-w-0 lg:min-w-[280px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search item name or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#D3232A] shadow-sm transition"
          />
        </div>
      </div>

      {/* Items Grid */}
      {isItemsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-white animate-pulse rounded-xl border border-gray-200" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No menu items found</h3>
          <p className="text-gray-500 text-sm mt-1">Try selecting a different category or add a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition group"
            >
              {/* Optional Item Image Preview */}
              {item.imageUrl ? (
                <div className="h-36 w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm transition ${
                        item.isAvailable
                          ? "bg-emerald-500/90 text-white border-emerald-400"
                          : "bg-rose-500/90 text-white border-rose-400"
                      }`}
                    >
                      {item.isAvailable ? "Active" : "Off Stock"}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {item.category?.name || "Uncategorized"}
                    </span>
                    {!item.imageUrl && (
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                          item.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {item.isAvailable ? "Active" : "Off Stock"}
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#1B2A4A] group-hover:text-[#D3232A] transition mt-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {item.description || "No item description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-extrabold text-[#1B2A4A]">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">#{item.id.slice(0, 6)}</span>
                </div>
              </div>
            </div>
          ))}
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
    </div>
    </DashboardLayout>
  );
}
