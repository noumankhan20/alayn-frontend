"use client";

import React, { useState } from "react";
import { Store, MapPin, Landmark, Map, Globe, Loader2 } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { getAccessToken } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function CreateFirstOutletModal() {
  const { refreshBranches } = useBranch();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Outlet name is required.";
    if (!formData.address.trim()) errs.address = "Address is required.";
    if (!formData.city.trim()) errs.city = "City is required.";
    if (!formData.state.trim()) errs.state = "State is required.";
    if (!formData.country.trim()) errs.country = "Country is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/outlets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message || body?.error || "Failed to create outlet");
      }

      await refreshBranches();
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while creating the outlet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#D3232A] mb-4">
            <Store className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 font-serif">
            Register Your First Outlet
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto font-medium">
            Welcome to Alayn! Before accessing your dashboard, please set up the physical location/branch of your restaurant.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-[#D3232A] border border-red-100/80">
              {submitError}
            </div>
          )}

          <div>
            <label htmlFor="outlet-name" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Outlet / Branch Name
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="outlet-name"
                type="text"
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="Golden Fork — Bandra"
                className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm bg-gray-50/50 focus:bg-white transition-all duration-200"
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs font-semibold text-[#D3232A]">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="outlet-address" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Address
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute top-3.5 left-0 flex items-start pl-3.5">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="outlet-address"
                rows={3}
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="123 Main Road, Near Station"
                className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm bg-gray-50/50 focus:bg-white transition-all duration-200 resize-none"
              />
            </div>
            {errors.address && <p className="mt-1.5 text-xs font-semibold text-[#D3232A]">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="outlet-city" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                City
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Landmark className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="outlet-city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange("city")}
                  placeholder="Mumbai"
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm bg-gray-50/50 focus:bg-white transition-all duration-200"
                />
              </div>
              {errors.city && <p className="mt-1.5 text-xs font-semibold text-[#D3232A]">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="outlet-state" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                State
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Map className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="outlet-state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange("state")}
                  placeholder="Maharashtra"
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm bg-gray-50/50 focus:bg-white transition-all duration-200"
                />
              </div>
              {errors.state && <p className="mt-1.5 text-xs font-semibold text-[#D3232A]">{errors.state}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="outlet-country" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Country
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="outlet-country"
                type="text"
                value={formData.country}
                onChange={handleChange("country")}
                placeholder="India"
                className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm bg-gray-50/50 focus:bg-white transition-all duration-200"
              />
            </div>
            {errors.country && <p className="mt-1.5 text-xs font-semibold text-[#D3232A]">{errors.country}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D3232A] px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#b01e23] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-[1px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Outlet...
              </>
            ) : (
              "Complete Setup & Enter Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
