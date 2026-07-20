import React from "react";
import { Search, Bell, Menu, MapPin } from "lucide-react";
import Image from "next/image";
import { useBranch } from "@/lib/BranchContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { branches, activeBranch, setActiveBranch } = useBranch();

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Left Side: Title & Selectors */}
        <div className="flex flex-1 items-center gap-x-6">
          <div className="w-56 h-16 flex items-center justify-start hidden sm:block">
            <Image
              src="/image1.png"
              alt="ALAYN Logo"
              width={224}
              height={64}
              className="max-h-16 w-auto object-contain"
              priority
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#D3232A]" />
              {branches.length > 0 ? (
                <select
                  value={activeBranch?.id || ""}
                  onChange={(e) => {
                    const match = branches.find((b) => b.id === e.target.value);
                    if (match) setActiveBranch(match);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm focus:border-[#D3232A] focus:outline-none focus:ring-1 focus:ring-[#D3232A] cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-gray-400">No Location</span>
              )}
            </div>
            <div className="flex space-x-4 text-gray-500 font-medium">
              <button className="hover:text-gray-900 transition-colors">This Week</button>
              <button className="hover:text-gray-900 transition-colors">vs Last Week</button>
            </div>
          </div>
        </div>

        {/* Right Side: Search, Notifications, Profile */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              placeholder="Search operations..."
              className="block w-full sm:w-64 rounded-full border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6 bg-gray-50"
            />
          </div>

          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              id="user-menu-button"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
                {/* Fallback avatar */}
                <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
